const request = require('request')

export function queryLocalNode(){
  for(var i = 0; i < 400; i++){
    var pageString = i.toString()
    var url = "http://localhost:6270/v1/names?page=" + pageString
    getIDs(url, function(array){
      iterateIDs(array)
    })
  }
}

function getIDs(url, callback){
  const requestData = {
    //uri: 'http://localhost:6270/v1/blockchains/bitcoin/name_count',
    uri: url,
    method: 'GET'
  }
  request(requestData, function (error, response, body) {
    callback(body)
  })
}

function iterateIDs(array){
  try {
    var newArray = JSON.parse(array);
    for(var i = 0; i < newArray.length; i++){
      //console.log(newArray[i])
    }
  } catch (e) {
    console.log(e)
  }
}
