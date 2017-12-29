import * as blockstack from 'blockstack'

export function makeConversations() {
  var dummyArray = makeDummyMessageArray()
  var names = ["Mike Raymond", "Sarah Miller", "Jessica Belwick"]
  var blockstackIDs = ["mike", "sarah", "jessica"]
  for(var i = 0; i < 3; i++){
    var conversation = {}
    conversation.name = names[i]
    conversation.blockstackID = blockstackIDs[i]
    conversation.messages = []
    for(var j = 0; j < dummyArray[i].length; j++){
      var messageObject = makeMessage(dummyArray[i][j])
      conversation.messages.push(messageObject)
    }
    var fileName = blockstackIDs[i]+"Convo.json"
    blockstack.putFile(fileName, JSON.stringify(conversation), true)
  }
  blockstack.putFile("conversations.json", JSON.stringify(blockstackIDs), true)
}

function makeMessage(content){
  var message = {}
  message.time = new Date().toISOString()
  message.type = 1
  message.content = content
  return JSON.stringify(message)
}

function makeDummyMessageArray() {
  return [
    ["Hey, we still on for Sunday?", "New phone, who dis?", "Mike!", "Oh cool. Yeah all good", "😅😅😅"],
    ["Yo bro", "Yo yo yo, bro bro", "Bro bro yo, yo yo?", "Shut your mouth!"],
    ["Miss you :/", "Miss you too <3", "So excited to see you!", "Likwise."]
  ]
}
