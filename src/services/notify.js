export const notify = async (title, options) => {
  if (!title) {
    throw new Error('must specify title when creating a notification')
  }

  if (!('Notification' in window) || document.hasFocus()) {
    return null
  }

  if (Notification.permission !== 'granted') {
    await Notification.requestPermission()
  }

  if (Notification.permission !== 'granted') {
    return null
  }

  const notification = new Notification(title, options)
  setTimeout(() => notification.close(), 5000)
  return notification
}
