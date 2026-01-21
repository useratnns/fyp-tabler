type ShikiHighlighter = {
  codeToHtml: (code: string, options: { lang: string; theme: string }) => string
}

const shikiSelector = 'pre code[class*="language-"], pre code[data-language]'
const shikiCodeBlocks = Array.from(document.querySelectorAll<HTMLElement>(shikiSelector))

const getShikiLanguage = (codeBlock: HTMLElement): string => {
  const dataLanguage = codeBlock.dataset.language
  if (dataLanguage) {
    return dataLanguage
  }

  const languageClass = Array.from(codeBlock.classList).find((className) => className.startsWith('language-'))
  return languageClass ? languageClass.replace('language-', '') : 'text'
}

const getShikiTheme = (codeBlock: HTMLElement): string => {
  return codeBlock.dataset.shikiTheme || codeBlock.closest<HTMLElement>('[data-shiki-theme]')?.dataset.shikiTheme || 'github-dark'
}

const getShikiBlocksToHighlight = (codeBlocks: HTMLElement[]): HTMLElement[] => {
  return codeBlocks.filter((codeBlock) => {
    const pre = codeBlock.closest('pre')
    return pre && !pre.classList.contains('shiki') && pre.dataset.shikiProcessed !== 'true'
  })
}

const highlightShikiBlocks = async (codeBlocks: HTMLElement[]) => {
  if (!codeBlocks.length) {
    return
  }

  const languages = new Set<string>(['text'])

  codeBlocks.forEach((codeBlock) => {
    languages.add(getShikiLanguage(codeBlock))
  })

  const { createHighlighter, createCssVariablesTheme } = await import('shiki')

  const theme = createCssVariablesTheme({
    name: 'css-variables',
    variablePrefix: '--shiki-',
    variableDefaults: {},
    fontStyle: true
  })
  
  const highlighter = (await createHighlighter({
    langs: Array.from(languages).filter(Boolean),
    themes: [theme],
  })) as ShikiHighlighter

  codeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.closest('pre')
    if (!pre || pre.dataset.shikiProcessed === 'true') {
      return
    }

    const language = getShikiLanguage(codeBlock)
    const code = codeBlock.textContent || ''

    let highlightedHtml = ''
    try {
      highlightedHtml = highlighter.codeToHtml(code, { lang: language, theme: 'css-variables' })
    } catch (error) {
      highlightedHtml = highlighter.codeToHtml(code, { lang: 'text', theme: 'css-variables' })
    }

    const wrapper = document.createElement('div')
    wrapper.innerHTML = highlightedHtml
    const highlightedPre = wrapper.firstElementChild

    if (highlightedPre) {
      pre.dataset.shikiProcessed = 'true'
      pre.replaceWith(highlightedPre)
    }
  })
}

const shikiBlocksToHighlight = getShikiBlocksToHighlight(shikiCodeBlocks)
if (shikiBlocksToHighlight.length) {
  void highlightShikiBlocks(shikiBlocksToHighlight)
}
