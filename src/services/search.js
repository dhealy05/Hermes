import * as blockstack from 'blockstack'
const request = require('request')
var filenames = []

export async function appIndex(){
  /*console.log("Indexing")
  for(var i = 300; i < 390; i++){
    var x = await getPage(i)
    console.log(x)
    console.log(i + 1)
  }
  console.log("PUBLIC FILE NAMES")
  console.log(filenames)*/
  var test = blockstack.lookupProfile("djhealy.id", "http://localhost:6270/v1/names/")
  test.then(object=>{console.log(object)})
}

async function getPage(page){
  return new Promise((resolve, reject) => {
    var pageString = page.toString()
    var url = "http://localhost:6270/v1/names?page=" + pageString
    const requestData = {
      //uri: 'http://localhost:6270/v2/blockchains/bitcoin/name_count',
      uri: url,
      method: 'GET'
    }
    request(requestData, function (error, response, body) {
      if(response === null){resolve("Next Page");}
      if(response.statusCode != 200){resolve("Next Page");}
      try {
        var newArray = JSON.parse(body);
        searchPage(newArray, function(status){
          resolve("Next Page");
        })
      } catch (e) {
        console.log(e)
      }
    })
  })
}

function reflect(promise){
    return promise.then(function(object){ return {object:object, status: "resolved" }},
                        function(error){ return {error:error, status: "rejected" }});
}

function searchPage(array, callback){
  var promises = []
  for(var i = 0; i < array.length; i++){
    var p = blockstack.lookupProfile(array[i], "http://localhost:6270/v1/names/")
    promises.push(p)
  }
  Promise.all(promises.map(reflect)).then(function(values){
    for(var i = 0; i < values.length; i++){
      if(values[i].status == "resolved"){
        if(values[i].object.apps != null){
          console.log(array[i])
          filenames.push(array[i])
          console.log(values[i].object)
        }
      }
    }
    callback(200)
  }, function(err){

  })
}

function checkApps(apps, appID, id){
  //if(apps[appID] != null){
  //  console.log(id)
    saveID(id)
  //}
}

function saveID(id){
  //var newID = new Parse.Object("IDs")
  //newID.set("blockstackID", id)
  //newID.save()
}
