import './src/autosize'
import './src/countup'
import './src/input-mask'
import './src/dropdown'
import './src/tooltip'
import './src/popover'
import './src/switch-icon'
import './src/tab'
import './src/toast'
import './src/sortable'

// Export Popper
export * as Popper from '@popperjs/core'

// Export all Bootstrap components directly for consistent usage
export { Alert, Button, Carousel, Collapse, Dropdown, Modal, Offcanvas, Popover, ScrollSpy, Tab, Toast, Tooltip } from 'bootstrap'

// Export custom Tabler components
export { default as Autosize } from './src/autosize'
export { default as SwitchIcon } from './src/switch-icon'

// Re-export everything as namespace for backward compatibility
export * as bootstrap from 'bootstrap'

// Re-export tabler namespace
export * as tabler from './src/tabler'
