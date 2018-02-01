import * as blockstack from 'blockstack'
const request = require('request')

export async function queryName(query){
  var url = "https://core.blockstack.org/v1/search?query=" + query
  const requestData = {
    uri: url,
    method: 'GET'
  }
  request(requestData, function (error, response, body) {
    if(response == null){console.log("Null Response"); return ''}
    if(response.statusCode != 200){console.log("Not 200"); return ''}
    try {
      var resultsArray = JSON.parse(body);
      console.log(resultsArray)
      return resultsArray
    } catch (e) {
      console.log(e)
    }
  })
}
