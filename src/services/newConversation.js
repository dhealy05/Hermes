import {
  Conversation,
  Message
} from '../models'
import {
  createNewConversation,
  getConversations,
  saveConversationById,
  saveNewOutbox
} from './conversations'
import {
  addContactById,
  getPublicKeyForId
} from './contacts'
import {
  getSharedSecret,
  encodeText
} from './keys'
import {
  getLocalPublicIndex,
  saveLocalPublicIndex
} from './identity'
import {
  getJson
} from './blockstack'

const crypto = require('crypto')

export async function newConversation(text, otherId) {

  var contacts = await getJson("contacts.json")
  console.log(contacts)
  if(contacts[otherId] != null){return true}
  //this is also a naive check TODO improve

  const pubkey = await getPublicKeyForId(otherId)

  if (!pubkey) {
    return null
  }

  const secret = await getSharedSecret(pubkey)
  const filename = crypto.randomBytes(20).toString('base64')
  const json = {
    filename: encodeText(filename, secret),
    secret: encodeText(secret, secret),
    text: encodeText(text, secret)
  }

  const discovery = await getLocalPublicIndex()
  discovery.introductions = [json] //testing only

  // we could use Promise.all here but we'd probably get rate-limited
  await saveLocalPublicIndex(discovery)
  await saveNewOutbox(filename)
  await addContactById(otherId)
  return createNewConversation(filename, otherId, text, secret)
}
