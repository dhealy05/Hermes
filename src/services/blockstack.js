import * as blockstack from 'blockstack'

export const getJson = async filename => JSON.parse(
  await blockstack.getFile(filename, true)
)

export const saveJson = (filename, json) => {
  console.debug(`saving to ${filename}:`, json)
  return blockstack.putFile(filename, JSON.stringify(json), true)
}

export const queryLocalNode = async args =>{
  var request = require('request')
  for(var i = 0; i < 400; i++){
    var pageString = i.toString()
    var url = "http://localhost:6270/v1/names?page=" + pageString
    const requestData = {
      //uri: 'http://localhost:6270/v1/blockchains/bitcoin/name_count',
      uri: url,
      method: 'GET'
    }
    request(requestData, function (error, response, body) {
      console.log("DONE")
    })
  }
}
