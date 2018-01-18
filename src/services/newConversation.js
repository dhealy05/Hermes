import {saveJson, getJson} from './blockstack'
import {getMyKeys, getMyPublicIndex, getSharedSecret, encodeText, decodeText} from './keys'
import {Conversation,Contact,Message} from '../models'
import {saveConversationById} from './conversations'
import {saveContactById} from './contacts'
import * as blockstack from 'blockstack'
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
  console.log(encodedText)
  var dt = decodeText(encodedText, secret)
  console.log(dt)
  var convoID = crypto.randomBytes(20).toString('base64');
  var secretConvoID = encodeText(convoID, secret)
  var secretSecret = encodeText(secret, secret)
  var json = {
    convoID: secretConvoID,
    secret: secretSecret,
    text: encodedText
  }
  var discovery = await getMyPublicIndex()
  discovery.introductions = [] //testing only
  discovery.introductions.push(json)
  /*await saveJson("public_index.json", discovery, { isPublic: true })
  await saveJson(convoID, {messages: []}, {isPublic: true})
  addConversation(convoID, blockstackID, text, secret)
  addContact(blockstackID)*/
}

async function addConversation(convoID, blockstackID, text, sharedSecret){
  var myConversations = await getJson("conversations.json")
  var m = new Message({sender: 'you', content: text, sentAt: new Date()})
  var c = new Conversation({contacts: [blockstackID.replace('.id', '')], publicID: convoID, secret: sharedSecret, messages: [m]})
  await saveConversationById(Conversation.getId(c), c)
}

async function addContact(blockstackID){
  var id = blockstackID.replace('.id', '')
  var profile = await blockstack.lookupProfile(blockstackID)
  var contact = {name: profile.name, id: id}
  saveContactById(id, contact)
}
