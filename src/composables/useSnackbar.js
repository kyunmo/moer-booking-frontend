import { ref } from 'vue'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000,
})

export function useSnackbar() {
  function showSnackbar(message, color = 'success', timeout = 3000) {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout,
    }
  }

  function success(message) {
    showSnackbar(message, 'success')
  }

  function error(message) {
    showSnackbar(message, 'error')
  }

  function warning(message) {
    showSnackbar(message, 'warning')
  }

  function info(message) {
    showSnackbar(message, 'info')
  }

  return {
    snackbar,
    showSnackbar,
    success,
    error,
    warning,
    info,
  }
}
