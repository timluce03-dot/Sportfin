import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Certification from './pages/Certification'
import Podcasts from './pages/Podcasts'
import PodcastDetail from './pages/PodcastDetail'
import QuizSport from './pages/QuizSport'
import CareerCenter from './pages/CareerCenter'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Pricing from './pages/Pricing'
import Profil from './pages/Profil'
import Dashboard from './pages/dashboard/Dashboard'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminChapters from './pages/admin/AdminChapters'
import AdminQuizzes from './pages/admin/AdminQuizzes'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminArticles from './pages/admin/AdminArticles'
import AdminJobs from './pages/admin/AdminJobs'
import AdminExercises from './pages/admin/AdminExercises'
import AdminPodcasts from './pages/admin/AdminPodcasts'
import AdminReviews from './pages/admin/AdminReviews'
import AdminPricing from './pages/admin/AdminPricing'
import AdminCertification from './pages/admin/AdminCertification'
import AdminSettings from './pages/admin/AdminSettings'
import AdminDesign from './pages/admin/AdminDesign'
import AdminPartners from './pages/admin/AdminPartners'
import AdminCareerMetiers from './pages/admin/AdminCareerMetiers'
import AdminTeam from './pages/admin/AdminTeam'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cours" element={<Courses />} />
              <Route path="/cours/:id" element={<CourseDetail />} />
              <Route path="/certification" element={<Certification />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/podcasts/:id" element={<PodcastDetail />} />
              <Route path="/quiz" element={<QuizSport />} />
<Route path="/career" element={<CareerCenter />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/tarifs" element={<Pricing />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="chapters" element={<AdminChapters />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="articles"  element={<AdminArticles />} />
              <Route path="jobs"      element={<AdminJobs />} />
              <Route path="exercises"     element={<AdminExercises />} />
              <Route path="podcasts"      element={<AdminPodcasts />} />
              <Route path="reviews"       element={<AdminReviews />} />
              <Route path="pricing"       element={<AdminPricing />} />
              <Route path="certification" element={<AdminCertification />} />
              <Route path="settings"      element={<AdminSettings />} />
              <Route path="design"        element={<AdminDesign />} />
              <Route path="partners"      element={<AdminPartners />} />
              <Route path="career-metiers" element={<AdminCareerMetiers />} />
              <Route path="team"          element={<AdminTeam />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
