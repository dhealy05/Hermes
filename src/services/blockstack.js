import { identity } from 'lodash'
import * as blockstack from 'blockstack'

export const getJson = async (filename, options) => {
  return JSON.parse(await getFile(filename, options))
}

export const getFile = async (filename, { username = null, ...options } = {}) => {
  if (!username) {
    return blockstack.getFile(filename, { decrypt: true, ...options })
  }

  console.debug(`reading ${filename} from user ${username}`)

  const publicOptions = {
    username,
    app: 'http://localhost:3000' // TODO put this in configuration instead of a constant
    //app: 'https://hihermes.co',
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
