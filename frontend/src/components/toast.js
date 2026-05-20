let toastFn = null

export function setToastFn(fn) {
  toastFn = fn
}

export function toast(msg, type = 'info') {
  toastFn?.({ msg, type, id: Date.now() })
}