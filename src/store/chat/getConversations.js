import * as blockstack from 'blockstack'

//returns thumbnails meant for the left side of the messages view
export async function getThumbnails() {
  const ids = JSON.parse(await blockstack.getFile("conversations.json", true))
  const convos = await Promise.all(ids.map(id => getConversation(id)))
  return convos.map(c => getThumbnail(c))
}

//returns a promise for the given conversation
export async function getConversation(blockstackID){
  var fileName = blockstackID + "Convo.json"
  const json = await blockstack.getFile(fileName, true)
  return JSON.parse(json)
}

function getThumbnail(conversation) {
  const message0 = JSON.parse(conversation.messages[0])
  return {
    name: conversation.name,
    contentType: message0.type,
    content: message0.content,
    time: message0.time
  }
}
