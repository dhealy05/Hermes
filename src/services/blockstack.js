import * as blockstack from 'blockstack'


export const getJson = async filename => JSON.parse(
  await blockstack.getFile(filename, true)
)

export const saveJson = (filename, json) => {
  console.debug(`saving to ${filename}:`, json)
  return blockstack.putFile(filename, JSON.stringify(json), true)
}

/*export const getJson = async (filename, blockstackID) => {
  if(blockstackID == null){
    console.log("XXX")
    JSON.parse(await blockstack.getFile(filename, true))
  } else {
    console.log("YYY")
    let options = {
      user: blockstackID,
      app: 'localhost:3000'
      //app: 'https://hihermes.co'
    }
    JSON.parse(await blockstack.getFile(filename, options))
  }
}

export const saveJson = (filename, json, isPublic) => {
  console.debug(`saving to ${filename}:`, json)
  if(isPublic == null || isPublic == false){
    return blockstack.putFile(filename, JSON.stringify(json), true)
  } else {
    return blockstack.putFile(filename, JSON.stringify(json))
  }
}
*/
