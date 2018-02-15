export const fetchWithTimeout = (url, { timeout = 30000, ...options } = {}) =>
  new Promise(async (resolve, reject) => {
    let didTimeOut = false
    const timer = setTimeout(() => {
      didTimeOut = true
      reject(new Error(fetchWithTimeout.TimedOutError))
    }, timeout)

    try {
      const resp = await fetch(url, options)
      resolve(resp)
    } catch (e) {
      if (didTimeOut) {
        // already rejected in the timeout handler
        return
      }

      reject(e)
    } finally {
      clearTimeout(timer)
    }
  })
fetchWithTimeout.TimedOutError = 'RequestTimedOut'

export const formatListOfNames = names => {
  if (names.length < 3) {
    return names.join(' and ')
  }

  const commaNames = names.slice(0, names.length - 1).join(', ')
  const finalName = names[names.length - 1]

  return `${commaNames}, and ${finalName}`
}
