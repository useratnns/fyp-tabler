import './src/dropdown'
import './src/tooltip'
import './src/popover'
import './src/tab'
import './src/toast'
import './src/modal'
import './src/collapse'
import './src/offcanvas'
import './src/sortable'
import './src/switch-icon'
import './src/autosize'
import './src/countup'
import './src/input-mask'
import './src/clipboard'

// Export Popper
export * as Popper from '@popperjs/core'

// Export all Bootstrap components directly for consistent usage
export { Alert, Button, Carousel, Collapse, Dropdown, Modal, Offcanvas, Popover, ScrollSpy, Tab, Toast, Tooltip } from 'bootstrap'

// Export custom Tabler components
export { default as Autosize } from './src/autosize'
export { default as SwitchIcon } from './src/switch-icon'
export { default as Countup } from './src/countup'
export { default as InputMask } from './src/input-mask'
export { default as Clipboard } from './src/clipboard'

// Re-export everything as namespace for backward compatibility
export * as bootstrap from 'bootstrap'

// Re-export tabler namespace
export * as tabler from './src/tabler'
