import * as blockstack from 'blockstack'

export const getJson = async filename => JSON.parse(
  await blockstack.getFile(filename, true)
)

export const saveJson = (filename, json) => {
  console.debug(`saving to ${filename}:`, json)
  return blockstack.putFile(filename, JSON.stringify(json), true)
}
