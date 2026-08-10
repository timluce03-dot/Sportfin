-- ============================================================
-- SPORTFIN — Schéma Supabase
-- À coller dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- PROFILES (étend auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'user', -- 'user' | 'admin'
  goal text,
  avatar_url text,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- COURSES
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  level text default 'Tous niveaux',
  duration text,
  cover_url text,
  is_premium boolean default false,
  published boolean default false,
  created_at timestamptz default now()
);

-- CHAPTERS
create table if not exists public.chapters (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses on delete cascade not null,
  title text not null,
  content text,
  type text default 'lecture', -- lecture | video | pdf | exercise | quiz
  duration text,
  position integer default 1,
  is_premium boolean default false,
  created_at timestamptz default now()
);

-- QUIZZES
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text,
  difficulty text default 'Débutant',
  question_count integer default 0,
  published boolean default false,
  created_at timestamptz default now()
);

-- QUIZ QUESTIONS
create table if not exists public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes on delete cascade not null,
  question text not null,
  options jsonb not null default '[]',       -- array of strings
  correct_index integer not null default 0,
  explanation text,
  position integer default 1,
  created_at timestamptz default now()
);

-- Auto-update question_count on quizzes
create or replace function public.update_quiz_question_count()
returns trigger as $$
begin
  update public.quizzes
  set question_count = (select count(*) from public.quiz_questions where quiz_id = coalesce(new.quiz_id, old.quiz_id))
  where id = coalesce(new.quiz_id, old.quiz_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists update_count_on_insert on public.quiz_questions;
create trigger update_count_on_insert after insert or delete on public.quiz_questions
  for each row execute procedure public.update_quiz_question_count();

-- QUIZ RESULTS
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  quiz_id uuid references public.quizzes on delete cascade not null,
  score integer not null,
  total integer not null,
  created_at timestamptz default now()
);

-- ARTICLES
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text,
  content text,
  category text default 'Finance',
  author text,
  cover_url text,
  read_time text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.chapters enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.articles enable row level security;

-- Profiles: user can read/update their own
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "admins full profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Courses: public read if published, admin full access
create policy "public read published courses" on public.courses for select using (published = true);
create policy "admins full courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Chapters: same pattern
create policy "public read chapters" on public.chapters for select using (
  exists (select 1 from public.courses where id = chapters.course_id and published = true)
);
create policy "admins full chapters" on public.chapters for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Quizzes
create policy "public read published quizzes" on public.quizzes for select using (published = true);
create policy "admins full quizzes" on public.quizzes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Quiz questions
create policy "public read quiz questions" on public.quiz_questions for select using (
  exists (select 1 from public.quizzes where id = quiz_questions.quiz_id and published = true)
);
create policy "admins full questions" on public.quiz_questions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Quiz results: user can insert/read their own
create policy "users insert own results" on public.quiz_results for insert with check (auth.uid() = user_id);
create policy "users read own results" on public.quiz_results for select using (auth.uid() = user_id);
create policy "admins full results" on public.quiz_results for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Articles
create policy "public read published articles" on public.articles for select using (published = true);
create policy "admins full articles" on public.articles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================

insert into public.courses (title, description, level, duration, is_premium, published) values
('Les Droits TV dans le Sport', 'Comprendre le moteur audiovisuel du sport business moderne. Mécanismes financiers, risques et mutations des droits audiovisuels.', 'Intermédiaire', '4h30', false, true),
('Finance des Clubs Professionnels', 'Analyse des bilans, FFP, valorisation des clubs et stratégies financières des franchises sport.', 'Avancé', '6h', true, true),
('Sponsoring & Partenariats Sport', 'Montage d''opérations de sponsoring, activation de marque, mesure du ROI et tendances du marché.', 'Débutant', '3h', false, true),
('Private Equity & Sport Business', 'Acquisitions de clubs, fonds d''investissement, due diligence et création de valeur dans le sport.', 'Expert', '5h', true, true);

insert into public.quizzes (title, description, category, difficulty, published) values
('Droits Audiovisuels', 'Testez vos connaissances sur les mécanismes des droits TV dans le sport.', 'Droits TV', 'Intermédiaire', true),
('FFP & Réglementation', 'Le Fair-Play Financier et les règles comptables des clubs professionnels.', 'Finance', 'Avancé', true),
('Sport Business Généraliste', 'Culture générale sur l''économie du sport mondial.', 'Général', 'Débutant', true),
('Sponsoring & Naming', 'Contrats de partenariat, naming rights et activation de marque.', 'Sponsoring', 'Intermédiaire', true);

insert into public.articles (title, excerpt, content, category, author, published, published_at) values
('La crise des droits TV en Ligue 1 : causes et perspectives', 'Après l''effondrement de DAZN, comment le football français rebâtit son modèle audiovisuel pour 2025-2029.', 'Le marché des droits audiovisuels du football français traverse une période de profonde transformation...', 'Droits TV', 'Équipe SPORTFIN', true, now()),
('Valorisation des clubs de football : méthodologies et tendances', 'De Forbes aux fonds d''investissement, comment mesure-t-on la valeur d''un club en 2025 ?', 'La valorisation des clubs de football est devenue un exercice complexe qui mêle finance traditionnelle et actifs immatériels...', 'Finance', 'Équipe SPORTFIN', true, now()),
('Le sponsoring sportif post-Covid : nouveaux acteurs, nouveaux modèles', 'Crypto, e-sport, IA : comment l''arrivée de nouveaux secteurs transforme le marché du sponsoring sportif mondial.', 'Les marchés du sponsoring ont subi une transformation profonde depuis 2020...', 'Sponsoring', 'Équipe SPORTFIN', true, now());
