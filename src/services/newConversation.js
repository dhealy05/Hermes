import {saveJson, getJson} from './blockstack'
import {getMyKeys, encodeText} from './keys'
const crypto = require('crypto');

export async function getPublicKey(blockstackID){
  var discovery = await getJson("public_index.json", blockstackID)
  if(discovery==null){return null}
  return discovery.pubkey.data
}

export async function getSharedSecret(pubkey){
  var me = await getMyKeys()
  return me.computeSecret(pubkey, null, "hex")
}

export async function newConversation(text, blockstackID){
  var pubkey = await getPublicKey(blockstackID)
  if(pubkey==null){return null}
  var secret = await getSharedSecret(pubkey)
  var encodedText = encodeText(secret, text)
  var discovery = await getJson("public_index.json")
  var convoID = crypto.randomBytes(128);
  var secretConvoID = encodeText(secret, convoID)
  var secretSecret = encodeText(secret, secret)
  var json = {
    convoID: secretConvoID,
    secret: secretSecret,
    text: encodedText
  }
  discovery.introductions.push(json)
  await saveJson("public_index.json", discovery, { isPublic: true })
  //addConversation(convoID, blockstackID, text, secret)
}

/*async function addConversation(convoID, blockstackID, text, sharedSecret){
  var myConversations = await getJson("conversations.json")
  var newConvo = new Conversation(convoID, blockstackID, text, sharedSecret)
  myConversations.conversations.push(newConvo)
  saveJson("conversations.json", myConversations)
}*/
