export const notify = async (title, options) => {
  if (!title) {
    throw new Error('must specify title when creating a notification')
  }

  if (!('Notification' in window) || Notification.permission === 'denied') {
    // exit if we're not allowed to send notifications
    return null
  }

  if (Notification.permission !== 'granted') {
    // ask for permission if we haven't done that yet
    await Notification.requestPermission()
  }

  if (Notification.permission !== 'granted') {
    // now that we've asked for permission, exit if we got denied or ignored
    return null
  }

  if (document.hasFocus()) {
    // don't show notifications if the user is looking at hermes
    return null
  }
  
  const notification = new Notification(title, options)
  setTimeout(() => notification.close(), 5000)
  return notification
}
