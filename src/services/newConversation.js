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
  saveLocalPublicIndex,
  identity
} from './identity'
import {
  getJson
} from './blockstack'
import {
  discoverConversation
} from './discovery'

const crypto = require('crypto')

export async function newConversation(text, otherId, contacts) {
  if(contacts == null){contacts = [identity().username, otherId]}

  if(await discoverConversation(otherId) != '' && contacts.length == 1){return true}

  var existingContacts = await getJson("contacts.json")
  if(existingContacts[otherId] != null && contacts.length == 1){return true}
  //this is also a naive check TODO improve

  const pubkey = await getPublicKeyForId(otherId)

  if (!pubkey) {
    return null
  }

  const secret = await getSharedSecret(pubkey)
  const filename = crypto.randomBytes(20).toString('base64')

  var groupSecret = crypto.randomBytes(48).toString('base64')
  contacts = JSON.stringify(contacts)

  const json = {
    filename: encodeText(filename, secret),
    secret: encodeText(secret, secret),
    text: encodeText(text, secret),
    contacts: encodeText(contacts, secret),
    groupSecret: encodeText(groupSecret, secret)
  }

  const discovery = await getLocalPublicIndex()
  //discovery.introductions = [json] //testing only
  discovery.introductions.push(json)

  contacts = JSON.parse(contacts)

  // we could use Promise.all here but we'd probably get rate-limited
  await saveLocalPublicIndex(discovery)
  await saveNewOutbox(filename)
  await addContactById(otherId)
  return createNewConversation(filename, contacts, text, secret)
}
