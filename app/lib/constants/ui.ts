// UI constants for consistent styling across components

export const MODAL_CONSTANTS = {
  ANIMATION: {
    DURATION: 'duration-300',
    SCALE_VISIBLE: 'scale-100 opacity-100',
    SCALE_HIDDEN: 'scale-95 opacity-0',
    BACKDROP_VISIBLE: 'opacity-50',
    BACKDROP_HIDDEN: 'opacity-0',
  },
  SIZING: {
    MAX_WIDTH_SM: 'max-w-sm',
    MAX_WIDTH_MD: 'max-w-md',
    MAX_WIDTH_LG: 'max-w-lg',
    ICON_SIZE: 'h-12 w-12',
  },
  SPACING: {
    MODAL_PADDING: 'p-6',
    SECTION_MARGIN: 'mb-4',
    BUTTON_SPACING: 'space-y-3',
  },
  STYLES: {
    BACKDROP: 'fixed inset-0 z-50 overflow-y-auto',
    CONTAINER: 'flex min-h-full items-center justify-center p-4 text-center',
    OVERLAY: 'fixed inset-0 bg-black transition-opacity',
    MODAL: 'relative w-full transform rounded-2xl bg-white text-left shadow-xl transition-all',
  },
} as const;

export const BUTTON_VARIANTS = {
  PRIMARY: 'bg-red-burgundy hover:bg-red-burgundy/90 text-white font-medium py-3 rounded-lg transition-all duration-200',
  SECONDARY: 'border border-red-burgundy text-red-burgundy hover:bg-red-burgundy/5 font-medium py-3 rounded-lg transition-all duration-200',
  TERTIARY: 'text-sm text-gray-400 hover:text-red-burgundy underline transition-all duration-200',
} as const; 