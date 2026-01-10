/**
 * --------------------------------------------------------------------------
 * Tabler theme.js
 * --------------------------------------------------------------------------
 */

/**
 * Constants
 */

const NAME = 'theme'
const DATA_KEY = `tblr.${NAME}`

interface ThemeConfig {
  'theme': string
  'theme-base': string
  'theme-font': string
  'theme-primary': string
  'theme-radius': string
}

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  'theme': 'light',
  'theme-base': 'gray',
  'theme-font': 'sans-serif',
  'theme-primary': 'blue',
  'theme-radius': '1',
}

/**
 * Class definition
 */

class Theme {
  private initialized: boolean = false
  private config: ThemeConfig

  constructor(config?: Partial<ThemeConfig>) {
    this.config = { ...DEFAULT_THEME_CONFIG, ...config }
  }

  // Getters
  static get NAME() {
    return NAME
  }

  static get DATA_KEY() {
    return DATA_KEY
  }

  // Public
  /**
   * Initialize theme
   */
  init(): void {
    if (this.initialized) {
      return
    }

    this._applyTheme()
    this.initialized = true
  }

  /**
   * Update theme configuration
   */
  update(config: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...config }
    this._applyTheme()
  }

  /**
   * Get current theme configuration
   */
  getConfig(): ThemeConfig {
    return { ...this.config }
  }

  /**
   * Dispose theme instance
   */
  dispose(): void {
    if (!this.initialized) {
      return
    }

    this.initialized = false
  }

  // Private
  /**
   * Apply theme to document
   */
  private _applyTheme(): void {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams: URLSearchParams, prop: string): string | null => searchParams.get(prop),
    })

    for (const key in this.config) {
      const param = params[key]
      let selectedValue: string

      if (!!param) {
        localStorage.setItem('tabler-' + key, param)
        selectedValue = param
      } else {
        const storedTheme = localStorage.getItem('tabler-' + key)
        selectedValue = storedTheme ? storedTheme : this.config[key as keyof ThemeConfig]
      }

      if (selectedValue !== this.config[key as keyof ThemeConfig]) {
        document.documentElement.setAttribute('data-bs-' + key, selectedValue)
      } else {
        document.documentElement.removeAttribute('data-bs-' + key)
      }
    }
  }

  // Static
  /**
   * Get or create instance
   */
  static getOrCreateInstance(config?: Partial<ThemeConfig>): Theme {
    if (!Theme.instance) {
      Theme.instance = new Theme(config)
    }
    return Theme.instance
  }

  private static instance: Theme | null = null
}

/**
 * Data API implementation
 */
const theme = Theme.getOrCreateInstance()
theme.init()

export default Theme
