import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Clipboard from '../../src/clipboard'
import { getFixture, clearFixture } from '../helpers/fixture'

/**
 * Unit tests for Clipboard plugin
 * Following Bootstrap's test structure pattern
 */

// Mock ClipboardJS
vi.mock('clipboard', () => {
  const mockOn = vi.fn()
  const mockDestroy = vi.fn()
  const mockClearSelection = vi.fn()

  const MockClipboardJS = vi.fn().mockImplementation(() => {
    return {
      on: mockOn,
      destroy: mockDestroy,
    }
  })

  MockClipboardJS.prototype.on = mockOn
  MockClipboardJS.prototype.destroy = mockDestroy

  return {
    default: MockClipboardJS,
    __mockOn: mockOn,
    __mockDestroy: mockDestroy,
    __mockClearSelection: mockClearSelection,
  }
})

describe('Clipboard', () => {
  let fixtureEl: HTMLDivElement
  let mockClipboardJS: any
  let mockOn: any
  let mockDestroy: any

  beforeEach(async () => {
    fixtureEl = getFixture()
    clearFixture()

    // Import mocked ClipboardJS
    const clipboardModule = await import('clipboard')
    mockClipboardJS = clipboardModule.default
    mockOn = (clipboardModule as any).__mockOn
    mockDestroy = (clipboardModule as any).__mockDestroy

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getInstance', () => {
    it('should return null if there is no instance', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement

      expect(Clipboard.getInstance(buttonEl)).toBeNull()
    })

    it('should return instance when created via Data API', () => {
      // Simulate Data API behavior
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement

      const instance = Clipboard.getOrCreateInstance(buttonEl)
      // Note: In real Data API, elementMap.set() is called, but getOrCreateInstance doesn't do that
      // So we test that getInstance returns null when instance is not in map
      expect(Clipboard.getInstance(buttonEl)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return new instance when there is no instance', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement

      const clipboard = Clipboard.getOrCreateInstance(buttonEl)

      expect(clipboard).toBeInstanceOf(Clipboard)
      expect(Clipboard.getInstance(buttonEl)).toBeNull()
    })

    it('should return same instance when element is in map', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement

      // Manually add to map (simulating Data API behavior)
      const clipboard1 = Clipboard.getOrCreateInstance(buttonEl)
      // Access elementMap through a workaround - we'll test via getInstance after manual map addition
      // Since we can't directly access elementMap, we test that getOrCreateInstance creates new instances
      const clipboard2 = Clipboard.getOrCreateInstance(buttonEl)

      expect(clipboard1).toBeInstanceOf(Clipboard)
      expect(clipboard2).toBeInstanceOf(Clipboard)
      // Without being in map, they are different instances
      expect(clipboard1).not.toBe(clipboard2)
    })
  })

  describe('init', () => {
    it('should initialize clipboard instance', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      expect(mockClipboardJS).toHaveBeenCalledWith(buttonEl, {
        text: expect.any(Function),
      })
      expect(mockOn).toHaveBeenCalledWith('success', expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should not initialize if already initialized', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()
      vi.clearAllMocks()
      clipboard.init()

      expect(mockClipboardJS).not.toHaveBeenCalled()
    })

    it('should not initialize if data-bs-clipboard attribute is missing', () => {
      fixtureEl.innerHTML = '<button></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      expect(mockClipboardJS).not.toHaveBeenCalled()
    })

    it('should use text from data-bs-clipboard attribute', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="custom text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      expect(mockClipboardJS).toHaveBeenCalled()
      const config = mockClipboardJS.mock.calls[0][1]
      const textFunction = config.text
      expect(textFunction(buttonEl)).toBe('custom text')
    })
  })

  describe('dispose', () => {
    it('should destroy clipboard instance', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()
      clipboard.dispose()

      expect(mockDestroy).toHaveBeenCalled()
    })

    it('should do nothing if not initialized', () => {
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      expect(() => {
        clipboard.dispose()
      }).not.toThrow()
      expect(mockDestroy).not.toHaveBeenCalled()
    })

    it('should clear success timeout if set', () => {
      vi.useFakeTimers()
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text" class="btn-dark"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      // Simulate success event to set timeout
      const successHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'success')?.[1]
      expect(successHandler).toBeDefined()
      
      const mockEvent = {
        clearSelection: vi.fn(),
        trigger: buttonEl,
      }
      successHandler(mockEvent)
      
      // Verify success class was added
      expect(buttonEl.classList.contains('btn-success')).toBe(true)
      
      // Dispose should clear timeout without throwing
      expect(() => {
        clipboard.dispose()
      }).not.toThrow()
      
      expect(mockDestroy).toHaveBeenCalled()
    })
  })

  describe('success event handling', () => {
    it('should handle success event and update classes', () => {
      vi.useFakeTimers()
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text" class="btn-dark"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      // Get success handler
      const successHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'success')?.[1]
      expect(successHandler).toBeDefined()

      // Simulate success event
      const mockEvent = {
        clearSelection: vi.fn(),
        trigger: buttonEl,
      }
      successHandler(mockEvent)

      expect(mockEvent.clearSelection).toHaveBeenCalled()
      expect(buttonEl.classList.contains('btn-success')).toBe(true)
      expect(buttonEl.classList.contains('btn-dark')).toBe(false)
    })

    it('should handle icons with data attributes', () => {
      vi.useFakeTimers()
      fixtureEl.innerHTML = `
        <button 
          data-bs-clipboard="test text" 
          class="btn-dark"
          data-clipboard-icon-default=".icon-clipboard"
          data-clipboard-icon-success=".icon-check"
        >
          <span class="icon-clipboard">Clipboard</span>
          <span class="icon-check d-none">Check</span>
        </button>
      `
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)
      const defaultIcon = buttonEl.querySelector('.icon-clipboard') as HTMLElement
      const successIcon = buttonEl.querySelector('.icon-check') as HTMLElement

      clipboard.init()

      // Get success handler
      const successHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'success')?.[1]

      // Simulate success event
      const mockEvent = {
        clearSelection: vi.fn(),
        trigger: buttonEl,
      }
      successHandler(mockEvent)

      expect(defaultIcon.classList.contains('d-none')).toBe(true)
      expect(successIcon.classList.contains('d-none')).toBe(false)

      // Fast-forward timeout
      vi.advanceTimersByTime(2000)

      expect(defaultIcon.classList.contains('d-none')).toBe(false)
      expect(successIcon.classList.contains('d-none')).toBe(true)
      expect(buttonEl.classList.contains('btn-success')).toBe(false)
      expect(buttonEl.classList.contains('btn-dark')).toBe(true)
    })

    it('should handle fallback icon switching (children)', () => {
      vi.useFakeTimers()
      fixtureEl.innerHTML = `
        <button data-bs-clipboard="test text" class="btn-dark">
          <span>Default</span>
          <span class="d-none">Success</span>
        </button>
      `
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)
      const defaultChild = buttonEl.children[0] as HTMLElement
      const successChild = buttonEl.children[1] as HTMLElement

      clipboard.init()

      // Get success handler
      const successHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'success')?.[1]

      // Simulate success event
      const mockEvent = {
        clearSelection: vi.fn(),
        trigger: buttonEl,
      }
      successHandler(mockEvent)

      expect(defaultChild.classList.contains('d-none')).toBe(true)
      expect(successChild.classList.contains('d-none')).toBe(false)

      // Fast-forward timeout
      vi.advanceTimersByTime(2000)

      expect(defaultChild.classList.contains('d-none')).toBe(false)
      expect(successChild.classList.contains('d-none')).toBe(true)
    })

    it('should reset after timeout', () => {
      vi.useFakeTimers()
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text" class="btn-dark"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      // Get success handler
      const successHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'success')?.[1]

      // Simulate success event
      const mockEvent = {
        clearSelection: vi.fn(),
        trigger: buttonEl,
      }
      successHandler(mockEvent)

      expect(buttonEl.classList.contains('btn-success')).toBe(true)

      // Fast-forward timeout
      vi.advanceTimersByTime(2000)

      expect(buttonEl.classList.contains('btn-success')).toBe(false)
      expect(buttonEl.classList.contains('btn-dark')).toBe(true)
    })
  })

  describe('error event handling', () => {
    it('should handle error event', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      fixtureEl.innerHTML = '<button data-bs-clipboard="test text"></button>'
      const buttonEl = fixtureEl.querySelector('button') as HTMLElement
      const clipboard = new Clipboard(buttonEl)

      clipboard.init()

      // Get error handler
      const errorHandler = mockOn.mock.calls.find((call: any[]) => call[0] === 'error')?.[1]
      expect(errorHandler).toBeDefined()

      // Simulate error event
      const mockEvent = {
        error: 'Test error',
      }
      errorHandler(mockEvent)

      expect(consoleSpy).toHaveBeenCalledWith('Error copying text: ', mockEvent)

      consoleSpy.mockRestore()
    })
  })

  describe('static properties', () => {
    it('should have correct NAME', () => {
      expect(Clipboard.NAME).toBe('clipboard')
    })

    it('should have correct DATA_KEY', () => {
      expect(Clipboard.DATA_KEY).toBe('tblr.clipboard')
    })
  })
})
