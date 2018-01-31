import { identity } from 'lodash'
import * as blockstack from 'blockstack'

export const getJson = async (filename, options) => {
  return JSON.parse(await getFileLocal(filename, options))
}

export const getFileLocal = async (filename, { username = null, ...options } = {}) => {
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
  if (isPublic) {
    console.debug(`saving to ${filename} [PUBLIC FILE]:`, data)
    return blockstack.putFile(filename, serialize(data), { encrypt: false, ...options })
  }

  console.debug(`saving to ${filename}:`, data)
  await blockstack.putFile(filename, serialize(data), { encrypt: true, ...options })
  return data
}

export const deleteFile = async filename => {
  return blockstack.deleteFile(filename)
}
