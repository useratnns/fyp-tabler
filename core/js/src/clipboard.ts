import ClipboardJS from 'clipboard'

/**
 * --------------------------------------------------------------------------
 * Tabler clipboard.js
 * --------------------------------------------------------------------------
 */

/**
 * Constants
 */

const NAME = 'clipboard'
const DATA_KEY = `tblr.${NAME}`

const SELECTOR_DATA_CLIPBOARD = '[data-bs-clipboard]'

const CLASS_NAME_SUCCESS = 'btn-success'
const CLASS_NAME_DARK = 'btn-dark'
const CLASS_NAME_D_NONE = 'd-none'

const ATTRIBUTE_ICON_DEFAULT = 'data-clipboard-icon-default'
const ATTRIBUTE_ICON_SUCCESS = 'data-clipboard-icon-success'

const TIMEOUT_SUCCESS = 2000

/**
 * Class definition
 */

class Clipboard {
  private element: HTMLElement
  private clipboardInstance: ClipboardJS | null = null
  private initialized: boolean = false
  private successTimeout: number | null = null

  constructor(element: HTMLElement) {
    this.element = element
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
   * Initialize clipboard on the element
   */
  init(): void {
    if (this.initialized) {
      return
    }

    const text = this.element.getAttribute('data-bs-clipboard')
    if (!text) {
      return
    }

    this.clipboardInstance = new ClipboardJS(this.element, {
      text: (trigger: HTMLElement) => {
        return trigger.getAttribute('data-bs-clipboard') || ''
      },
    })

    this.clipboardInstance.on('success', (e) => {
      this._handleSuccess(e)
    })

    this.clipboardInstance.on('error', (e) => {
      this._handleError(e)
    })

    this.initialized = true
  }

  /**
   * Destroy clipboard instance
   */
  dispose(): void {
    if (!this.initialized || !this.clipboardInstance) {
      return
    }

    if (this.successTimeout) {
      clearTimeout(this.successTimeout)
      this.successTimeout = null
    }

    this.clipboardInstance.destroy()
    this.clipboardInstance = null
    this.initialized = false
  }

  // Private
  /**
   * Handle success event
   */
  private _handleSuccess(e: ClipboardJS.Event): void {
    e.clearSelection()

    const trigger = e.trigger as HTMLElement

    // Add success class and remove dark class
    trigger.classList.add(CLASS_NAME_SUCCESS)
    trigger.classList.remove(CLASS_NAME_DARK)

    // Handle icons with data attributes (Bootstrap-style)
    const defaultIconSelector = trigger.getAttribute(ATTRIBUTE_ICON_DEFAULT)
    const successIconSelector = trigger.getAttribute(ATTRIBUTE_ICON_SUCCESS)

    let defaultIcon: HTMLElement | null = null
    let successIcon: HTMLElement | null = null

    if (defaultIconSelector && successIconSelector) {
      // Use data attributes to find icons (Bootstrap-style)
      defaultIcon = trigger.querySelector<HTMLElement>(defaultIconSelector)
      successIcon = trigger.querySelector<HTMLElement>(successIconSelector)
    }

    if (defaultIcon && successIcon) {
      // Hide default icon, show success icon
      defaultIcon.classList.add(CLASS_NAME_D_NONE)
      successIcon.classList.remove(CLASS_NAME_D_NONE)
    } else if (trigger.children.length >= 2) {
      // Fallback: Hide first child, show second child (backward compatibility)
      trigger.children[0].classList.add(CLASS_NAME_D_NONE)
      trigger.children[1].classList.remove(CLASS_NAME_D_NONE)
    }

    // Reset after timeout
    this.successTimeout = window.setTimeout(() => {
      trigger.classList.remove(CLASS_NAME_SUCCESS)
      trigger.classList.add(CLASS_NAME_DARK)

      if (defaultIcon && successIcon) {
        // Show default icon, hide success icon
        defaultIcon.classList.remove(CLASS_NAME_D_NONE)
        successIcon.classList.add(CLASS_NAME_D_NONE)
      } else if (trigger.children.length >= 2) {
        // Fallback: Show first child, hide second child
        trigger.children[0].classList.remove(CLASS_NAME_D_NONE)
        trigger.children[1].classList.add(CLASS_NAME_D_NONE)
      }

      this.successTimeout = null
    }, TIMEOUT_SUCCESS)
  }

  /**
   * Handle error event
   */
  private _handleError(e: ClipboardJS.Event): void {
    console.error('Error copying text: ', e)
  }

  // Static
  /**
   * Get instance from element
   */
  static getInstance(element: HTMLElement): Clipboard | null {
    return elementMap.get(element) || null
  }

  /**
   * Get or create instance
   */
  static getOrCreateInstance(element: HTMLElement): Clipboard {
    return this.getInstance(element) || new this(element)
  }
}

/**
 * Instance storage
 */
const elementMap = new WeakMap<HTMLElement, Clipboard>()

/**
 * Data API implementation
 */
const clipboardTriggerList: HTMLElement[] = [].slice.call(
  document.querySelectorAll<HTMLElement>(SELECTOR_DATA_CLIPBOARD),
)
clipboardTriggerList.map(function (clipboardTriggerEl: HTMLElement) {
  const instance = Clipboard.getOrCreateInstance(clipboardTriggerEl)
  elementMap.set(clipboardTriggerEl, instance)
  instance.init()
  return instance
})

export default Clipboard
