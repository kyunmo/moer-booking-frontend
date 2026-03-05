import { ref } from 'vue'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000,
  location: 'top right',
  icon: '',
})

export function useSnackbar() {
  function showSnackbar(message, color = 'success', timeout = 3000, location = 'top right', icon = '') {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout,
      location,
      icon,
    }
  }

  function success(message) {
    showSnackbar(message, 'success', 2500, 'bottom right', 'ri-check-line')
  }

  function error(message) {
    showSnackbar(message, 'error', 5000, 'top right', 'ri-error-warning-line')
  }

  function warning(message) {
    showSnackbar(message, 'warning', 4000, 'top right', 'ri-alert-line')
  }

  function info(message) {
    showSnackbar(message, 'info', 3000, 'top right', 'ri-information-line')
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
