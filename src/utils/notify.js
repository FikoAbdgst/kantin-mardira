import Swal from 'sweetalert2'

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  showCloseButton: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
  didOpen: (toastElement) => {
    toastElement.addEventListener('mouseenter', Swal.stopTimer)
    toastElement.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

const toastBaseOptions = {
  showClass: { popup: 'swal2-show' },
  hideClass: { popup: 'swal2-hide' },
}

const modalBaseClass = {
  popup: 'pos-swal-popup',
  confirmButton: 'pos-swal-confirm',
  cancelButton: 'pos-swal-cancel',
}

export const showSuccess = (title, text = '', options = {}) =>
  toast.fire({
    icon: 'success',
    title,
    text,
    ...toastBaseOptions,
    ...options,
  })

export const showError = (title, text = '', options = {}) =>
  toast.fire({
    icon: 'error',
    title,
    text,
    ...toastBaseOptions,
    ...options,
  })

export const showWarning = (title, text = '', options = {}) =>
  toast.fire({
    icon: 'warning',
    title,
    text,
    ...toastBaseOptions,
    ...options,
  })

export const showInfo = (title, text = '', options = {}) =>
  toast.fire({
    icon: 'info',
    title,
    text,
    ...toastBaseOptions,
    ...options,
  })

export const showConfirm = (options = {}) =>
  Swal.fire({
    icon: options.icon || 'question',
    title: options.title || 'Konfirmasi',
    text: options.text || '',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Ya',
    cancelButtonText: options.cancelButtonText || 'Batal',
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    confirmButtonColor: options.confirmButtonColor || '#f97316',
    cancelButtonColor: options.cancelButtonColor || '#9ca3af',
    background: '#fffdf8',
    buttonsStyling: false,
    customClass: {
      ...modalBaseClass,
      ...(options.customClass || {}),
    },
    ...options,
  })

export const notify = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  confirm: showConfirm,
}

export default notify
