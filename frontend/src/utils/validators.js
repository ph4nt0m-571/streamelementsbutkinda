export function isValidUrl(str) {
  try { new URL(str); return true } catch { return false }
}

export function isValidCommand(trigger) {
  return /^![a-zA-Z0-9_]{1,30}$/.test(trigger)
}

export function isValidLength(str, min = 1, max = 500) {
  return typeof str === 'string' && str.length >= min && str.length <= max
}

export function validateAlertForm(data) {
  const errors = {}
  if (data.gifUrl && !isValidUrl(data.gifUrl)) errors.gifUrl = 'Must be a valid URL'
  if (data.soundUrl && !isValidUrl(data.soundUrl)) errors.soundUrl = 'Must be a valid URL'
  if (data.messageTemplate && data.messageTemplate.length > 200)
    errors.messageTemplate = 'Max 200 characters'
  if (data.duration && (data.duration < 1000 || data.duration > 30000))
    errors.duration = 'Must be between 1000 and 30000ms'
  return errors
}

export function validateCommandForm(data) {
  const errors = {}
  if (!isValidCommand(data.trigger)) errors.trigger = 'Must be !letters/numbers/underscores, max 30 chars'
  if (!isValidLength(data.response, 1, 500)) errors.response = 'Response required, max 500 chars'
  if (data.cooldown < 0 || data.cooldown > 3600) errors.cooldown = 'Cooldown 0–3600 seconds'
  return errors
}