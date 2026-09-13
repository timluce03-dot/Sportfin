import katex from 'katex'

/**
 * Markdown + LaTeX renderer.
 * Supports: ### headings, bullet/numbered lists, tables, **bold**, *italic*,
 * $$...$$ display math (KaTeX), $...$ inline math (KaTeX), --- hr, > blockquote.
 */
export function renderMd(text, tableClass = 'cs-table') {
  if (!text) return ''

  // ── 1. Pre-extract display math $$...$$ ─────────────────────────
  const mathBlocks = []
  let src = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
    const idx = mathBlocks.length
    try {
      mathBlocks.push(katex.renderToString(formula.trim(), { throwOnError: false, displayMode: true }))
    } catch (e) {
      mathBlocks.push(`<pre style="font-family:monospace;font-size:13px;overflow-x:auto">${formula}</pre>`)
    }
    return `\n@@MATH_${idx}@@\n`
  })

  // ── 2. Helpers ───────────────────────────────────────────────────
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Render inline $...$ and then **bold** / *italic*
  function inlineFull(raw) {
    // First replace inline math (avoid matching $$ by using a non-$ char lookaround trick)
    let s = raw.replace(/\$([^$\n]+?)\$/g, (match, f, offset, str) => {
      // Make sure it's not part of $$
      const prev = str[offset - 1]
      const next = str[offset + match.length]
      if (prev === '$' || next === '$') return match
      try { return katex.renderToString(f.trim(), { throwOnError: false, displayMode: false }) }
      catch { return `<code>${esc(f)}</code>` }
    })
    // Escape HTML in non-KaTeX parts (KaTeX already outputs HTML, so only escape outside spans)
    // Simple approach: escape then apply bold/italic
    // Since KaTeX output contains < > &, we must not escape it.
    // Strategy: escape first, then apply bold/italic on escaped text, then un-protect katex spans.
    // Easier: build the string segment by segment.
    // Simplest correct approach for our use case: apply bold/italic on the raw string,
    // then escape only the non-HTML parts.
    // → Process: bold/italic markers never appear inside KaTeX output, so apply them first.
    // Bold: **text** — simple greedy match, handles most cases
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* (not **)
    s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Strip any remaining orphaned ** markers
    s = s.replace(/\*\*/g, '')
    return s
  }

  // Inline for lines that have no math — escape + bold/italic
  function inlineEsc(raw) {
    let s = esc(raw)
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    s = s.replace(/\*\*/g, '')
    return s
  }

  const isRow = l => /^\s*\|/.test(l) && l.includes('|')
  const isSep = l => /^\s*\|[\s\-:\|]+\|/.test(l)
  const cols  = l => l.split('|').map(c => c.trim()).filter(Boolean)

  // ── 3. Line-by-line ─────────────────────────────────────────────
  const lines = src.split('\n')
  const out   = []
  let i = 0

  while (i < lines.length) {
    const ln = lines[i]

    // Math placeholder
    const mm = ln.trim().match(/^@@MATH_(\d+)@@$/)
    if (mm) {
      out.push(`<div style="overflow-x:auto;margin:14px 0;text-align:center">${mathBlocks[+mm[1]]}</div>`)
      i++; continue
    }

    // Horizontal rule ---
    if (/^---+$/.test(ln.trim())) {
      out.push('<hr style="border:none;border-top:1px solid var(--sf-border);margin:16px 0">')
      i++; continue
    }

    // Table
    if (isRow(ln) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const ths = cols(ln).map(h => `<th>${inlineEsc(h)}</th>`).join('')
      i += 2
      const trs = []
      while (i < lines.length && isRow(lines[i])) {
        trs.push(`<tr>${cols(lines[i]).map(c => `<td>${inlineEsc(c)}</td>`).join('')}</tr>`)
        i++
      }
      out.push(`<table class="${tableClass}"><thead><tr>${ths}</tr></thead><tbody>${trs.join('')}</tbody></table>`)
      continue
    }

    // Headings
    const hm = ln.match(/^(#{1,6})\s+(.*)/)
    if (hm) {
      const lvl = hm[1].length
      const fs  = lvl === 1 ? '20px' : lvl === 2 ? '17px' : '15px'
      const fw  = lvl <= 2 ? '800' : '700'
      out.push(`<h${lvl} style="font-size:${fs};font-weight:${fw};margin:18px 0 8px;color:var(--sf-primary)">${inlineEsc(hm[2])}</h${lvl}>`)
      i++; continue
    }

    // Blockquote >
    if (/^>\s?/.test(ln)) {
      const qLines = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        qLines.push(inlineFull(lines[i].replace(/^>\s?/, '')))
        i++
      }
      out.push(`<blockquote style="border-left:3px solid var(--sf-accent,#C9A84C);margin:10px 0;padding:4px 14px;color:var(--sf-muted);font-style:italic">${qLines.join('<br>')}</blockquote>`)
      continue
    }

    // Bullet list
    if (/^[-*]\s/.test(ln)) {
      const items = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li style="margin-bottom:4px">${inlineFull(lines[i].replace(/^[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul style="margin:8px 0 10px 20px;padding:0;list-style:disc">${items.join('')}</ul>`)
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(ln)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li style="margin-bottom:6px">${inlineFull(lines[i].replace(/^\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol style="margin:8px 0 10px 20px;padding:0;list-style:decimal">${items.join('')}</ol>`)
      continue
    }

    // Empty line
    if (!ln.trim()) { i++; continue }

    // Paragraph
    const pLines = []
    while (i < lines.length) {
      const l = lines[i]
      if (!l.trim()) break
      if (/^[-*]\s/.test(l) || /^\d+\.\s/.test(l) || /^#+\s/.test(l) || /^---+$/.test(l.trim())) break
      if (isRow(l) || /^>\s?/.test(l) || /^@@MATH_\d+@@$/.test(l.trim())) break
      pLines.push(l)
      i++
    }
    if (pLines.length) out.push(`<p style="margin:0 0 12px;line-height:1.75">${inlineFull(pLines.join(' '))}</p>`)
  }

  return out.join('')
}
