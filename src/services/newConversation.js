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

export async function newConversation(text, otherIds) {
  if (!Array.isArray(otherIds)) {
    otherIds = [otherIds]
  }

  const contacts = [identity().username, ...otherIds]

  if (contacts.length === 2 && await discoverConversation(contacts[1])) {
    // TODO naive
    return true
  }

  const existingContacts = await getJson("contacts.json")
  if (contacts.length === 2 && existingContacts[contacts[1]]) {
    // this is also a naive check TODO improve
    return true
  }

  const introduction = {
    filename: crypto.randomBytes(20).toString('base64'),
    groupSecret: crypto.randomBytes(48).toString('base64'),
    contacts: JSON.stringify(contacts),
    discovery: await getLocalPublicIndex(),
    text: text
  }

  for (const contactId of contacts) {
    if (contactId === identity().username) {
      continue
    }

    await addContactAndIntroduction(introduction, contactId)
  }

  await saveNewOutbox(introduction.filename)
  return createNewConversation(introduction.filename, contacts, text, introduction.groupSecret)
}

export async function addContactAndIntroduction(intro, id){
  const pubkey = await getPublicKeyForId(id)

  if (!pubkey) {
    return null
  }

  const secret = await getSharedSecret(pubkey)

  const json = {
    filename: encodeText(intro.filename, secret),
    secret: encodeText(secret, secret),
    text: encodeText(intro.text, secret),
    contacts: encodeText(intro.contacts, secret),
    groupSecret: encodeText(intro.groupSecret, secret)
  }
  //discovery.introductions = [json] //testing only
  intro.discovery.introductions.push(json)

  await saveLocalPublicIndex(intro.discovery)
  await addContactById(id)
  return secret
}
