import * as blockstack from 'blockstack'

export const getJson = async (filename, { username = null } = {}) => {
  if (!username) {
    return JSON.parse(await blockstack.getFile(filename, { decrypt: true }))
  }

  console.debug(`reading ${filename} from user ${username}`)
  const options = {
    username,
    app: 'localhost:3000' // TODO put this in configuration instead of a constant
    //app: 'https://hihermes.co'
  }
  return JSON.parse(await blockstack.getFile(filename, options))
}

export const saveJson = (filename, json, { isPublic = false } = {}) => {
  if (isPublic) {
    console.debug(`saving to ${filename} [PUBLIC FILE]:`, json)
    return blockstack.putFile(filename, JSON.stringify(json), { decrypt: false })
  }

  return blockstack.putFile(filename, JSON.stringify(json), { encrypt: true })
}
