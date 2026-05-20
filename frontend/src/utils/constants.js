export const EVENT_TYPES = [
  { value: 'follow',    label: 'Follow' },
  { value: 'subscribe', label: 'Subscription' },
  { value: 'raid',      label: 'Raid' },
  { value: 'cheer',     label: 'Cheer' },
  { value: 'gift_sub',  label: 'Gift Sub' },
]

export const ANIMATIONS_IN = ['fadeIn', 'slideIn', 'bounceIn', 'zoomIn']
export const ANIMATIONS_OUT = ['fadeOut', 'slideOut', 'bounceOut', 'zoomOut']

export const PERMISSION_LEVELS = [
  { value: 'everyone',    label: 'Everyone' },
  { value: 'subscriber',  label: 'Subscribers+' },
  { value: 'moderator',   label: 'Moderators+' },
  { value: 'broadcaster', label: 'Broadcaster only' },
]

export const WIDGET_TYPES = ['chat', 'eventList', 'goalBar', 'nowPlaying']

export const MAX_COMMANDS = 100