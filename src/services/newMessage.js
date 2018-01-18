import {saveJson, getJson} from './blockstack'
import {encodeText} from './keys'
import * as blockstack from 'blockstack'

export async function newMessage(text, blockstackID){
  var id = blockstackID.replace('.id', '')
  var conversations = await getJson("conversations.json")
  var convoMeta = conversations.conversations[id]
  var convo = await getJson(convoMeta.filename, {username:blockstack.loadUserData().username})
  var encodedText = encodeText(text, convoMeta.secret)
  var message = {}
  message.sentAt = new Date()
  message.content = encodedText
  convo.messages = [] //testing only
  convo.messages.push(message)
  await saveJson(convoMeta.filename, convo, {isPublic: true})
  var privateConversation = await getJson("conversation_" + id + ".json")
  message.text = text
  privateConversation.messages.push(message)
  await saveJson("conversation_" + id + ".json", privateConversation)
}
