import {saveJson, getJson} from './blockstack'
import {getMyKeys, getMyPublicIndex, getSharedSecret, encodeText, decodeText} from './keys'
const crypto = require('crypto');

export async function getPublicKey(blockstackID){
  var discovery = await getJson('public_index.json', { username: blockstackID })
  if(discovery==null){return null}
  return discovery.pubkey.data
}

export async function newConversation(text, blockstackID){
  var pubkey = await getPublicKey(blockstackID)
  if(pubkey==null){return null}
  var secret = await getSharedSecret(pubkey)
  var encodedText = encodeText(text, secret)
  var convoID = crypto.randomBytes(20).toString('base64');
  var secretConvoID = encodeText(convoID, secret)
  var secretSecret = encodeText(secret, secret)
  var json = {
    convoID: secretConvoID,
    secret: secretSecret,
    text: encodedText
  }
  var discovery = await getMyPublicIndex()
  discovery.introductions.push(json)
  console.log(secret)
  //await saveJson("public_index.json", discovery, { isPublic: true })
  //addConversation(convoID, blockstackID, text, secret)
}

/*async function addConversation(convoID, blockstackID, text, sharedSecret){
  var myConversations = await getJson("conversations.json")
  var newConvo = new Conversation(convoID, blockstackID, text, sharedSecret)
  myConversations.conversations.push(newConvo)
  saveJson("conversations.json", myConversations)
}*/
