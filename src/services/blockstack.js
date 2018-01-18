import * as blockstack from 'blockstack'

export const getJson = async (filename, { username = null, ...options } = {}) => {
  if (!username) {
    return JSON.parse(await blockstack.getFile(filename, { decrypt: true, ...options }))
  }

  console.debug(`reading ${filename} from user ${username}`)
  const publicOptions = {
    username,
    app: 'http://localhost:3000' // TODO put this in configuration instead of a constant
    //app: 'https://hihermes.co',
  }
  return JSON.parse(await blockstack.getFile(filename, { ...publicOptions, ...options }))
}

export const saveJson = (filename, json, { isPublic = false, ...options } = {}) => {
  if (isPublic) {
    console.debug(`saving to ${filename} [PUBLIC FILE]:`, json)
    return blockstack.putFile(filename, JSON.stringify(json), { encrypt: false, ...options })
  }

  console.debug(`saving to ${filename}:`, json)
  return blockstack.putFile(filename, JSON.stringify(json), { encrypt: true, ...options })
}
