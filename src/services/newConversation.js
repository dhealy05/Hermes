import {
  ContentTypes,
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

export async function addContactWithConversation(contactId, firstMessage = null) {
  const myId = identity().username
  const contact = await addContactById(contactId)

  const { conversations } = await getConversations()

  const convoId = Conversation.getId({ contacts: [contact.id,
                                                  myId] })

  if (conversations[convoId]) {
    return {
      contact,
      conversation: conversations[convoId]
    }
  }

  if (await discoverConversation(contact.id)) {
    return {
      contact,
      conversation: (await getConversations())[convoId]
    }
  }

  firstMessage = firstMessage || new Message({
    sender: 'SYSTEM',
    sentAt: new Date().toISOString(),
    content: 'You are now connected on Hermes'
  })

  return {
    contact,
    conversation: await newConversation(firstMessage, [contactId])
  }
}

export async function newConversation(msg, otherIds) {
  if (!(msg instanceof Message)) {
    throw new TypeError('message must be a Message')
  }

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

  let text = msg.content

  if (msg.type === ContentTypes.Image) {
    text = 'sent an image'
  }

  const introduction = {
    filename: crypto.randomBytes(20).toString('base64'),
    groupSecret: crypto.randomBytes(48).toString('base64'),
    contacts: JSON.stringify(contacts),
    discovery: await getLocalPublicIndex(),
    text
  }

  for (const contactId of contacts) {
    if (contactId === identity().username) {
      continue
    }

    await addContactAndIntroduction(introduction, contactId)
  }

  await saveNewOutbox(introduction.filename)
  return createNewConversation(introduction.filename, contacts, msg, introduction.groupSecret)
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
