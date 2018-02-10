import { identity } from 'lodash'
import * as blockstack from 'blockstack'

export const getJson = async (filename, options) => {
  return JSON.parse(await getFile(filename, options))
}

export const getFile = async (filename, { username = null, ...options } = {}) => {

  if (!username) {
    return blockstack.getFile(filename, { decrypt: true, zoneFileLookupURL: 'https://core.blockstack.org/v1/names/',  ...options })
  }

  console.debug(`reading ${filename} from user ${username}`)

  const publicOptions = {
    username,
    app: process.env.REACT_APP_PUBLIC_URL,
    zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'
  }

  if (username.indexOf('.id') === -1) {
    username = `${username}.id`
  }

  return await blockstack.getFile(filename, { ...publicOptions, ...options })
}

export const saveJson = async (filename, json, options = {}) => {
  return saveFile(filename, json, { ...options, serialize: JSON.stringify })
}

export const saveFile = async (
  filename,
  data,
  { isPublic = false, serialize = identity, ...options } = {}
) => {
  // don't want to log e.g. an entire 5MB image file
  let dataForLogging = data

  if (typeof data === 'string')  {
    dataForLogging = data.slice(0, 1024)

    if (dataForLogging.length !== data.length) {
      dataForLogging += `... (1024 of ${data.length} bytes total)`
    }
  }

  if (isPublic) {
    console.debug(`saving to ${filename} [PUBLIC FILE]:`, dataForLogging)
    return blockstack.putFile(filename, serialize(data), { encrypt: false, ...options })
  }

  console.debug(`saving to ${filename}:`, dataForLogging)
  await blockstack.putFile(filename, serialize(data), { encrypt: true, ...options })
  return data
}

export const deleteFile = async filename => {
  return blockstack.deleteFile(filename)
}
