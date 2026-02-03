// Toast notification composable
// Provides success/error/info feedback to users

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timeout: number
}

// Global reactive state for toasts
const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', timeout = 4000) {
    const id = ++toastId
    const toast: Toast = { id, message, type, timeout }
    toasts.value.push(toast)

    // Auto-remove after timeout
    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }

    return id
  }

  function success(message: string, timeout = 4000) {
    return show(message, 'success', timeout)
  }

  function error(message: string, timeout = 6000) {
    return show(message, 'error', timeout)
  }

  function info(message: string, timeout = 4000) {
    return show(message, 'info', timeout)
  }

  function warning(message: string, timeout = 5000) {
    return show(message, 'warning', timeout)
  }

  function remove(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    warning,
    remove,
    clear,
  }
}
