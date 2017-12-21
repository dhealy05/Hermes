import * as blockstack from 'blockstack'

//returns thumbnails meant for the left side of the messages view
export function getThumbnails(callback){
  blockstack.getFile("conversations.json", true)
    .then(conversations=>{
      var convoArray = JSON.parse(conversations)
      var convoPromises = []
      var thumbnails = []
      for(var i = 0; i < convoArray.length; i++){
        convoPromises.push(getConversation(convoArray[i]))
      }
      console.log(convoPromises)
      Promise.all(convoPromises).then(convos=>{
          for(var j=0; j<convos.length;j++){
            thumbnails.push(getThumbnail(JSON.parse(convos[j])))
          }
          callback(thumbnails)
        })
    })
}

//returns a promise for the given conversation
export function getConversation(blockstackID){
  var fileName = blockstackID + "Convo.json"
  return blockstack.getFile(fileName, true)
}

function getThumbnail(conversation){
  var thumbnail = {}
  thumbnail.name = conversation.name
  var message0 = JSON.parse(conversation.messages[0])
  thumbnail.contentType = message0.type
  thumbnail.content = message0.content
  thumbnail.time = message0.time
  return thumbnail
}
