import * as blockstack from 'blockstack'
const request = require('request')

export async function queryName(query){
  var url = "https://core.blockstack.org/v1/search?query=" + query
  const requestData = {
    uri: url,
    method: 'GET'
  }
  return new Promise((resolve, reject) => {
    request(requestData, function (error, response, body) {
      if (response == null) { console.log("Null Response"); resolve([]); }
      if (response.statusCode != 200) { console.log("Not 200"); resolve([]); }
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
  })
}
