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
  console.log(otherId)
  console.log(text)
  if(contacts == null){contacts = [identity().username, otherId]}

  if(await discoverConversation(otherId) != '' && contacts.length == 2){return true}

  var existingContacts = await getJson("contacts.json")
  if(existingContacts[otherId] != null && contacts.length == 2){return true}
  //this is also a naive check TODO improve

  var introduction = {
    filename: crypto.randomBytes(20).toString('base64'),
    groupSecret: crypto.randomBytes(48).toString('base64'),
    contacts: JSON.stringify(contacts),
    discovery: await getLocalPublicIndex(),
    text: text
  }

  console.log(contacts)
  console.log()

  if(contacts.length == 2){
    introduction.groupSecret = await addContactAndIntroduction(introduction, otherId)
  } else {
    introductionsAndContacts(contacts, introduction)
  }

  // we could use Promise.all here but we'd probably get rate-limited
  await saveNewOutbox(introduction.filename)
  return createNewConversation(introduction.filename, contacts, text, introduction.groupSecret)
}

export async function introductionsAndContacts(contacts, introduction){
  for(var i = 0; i < contacts.length; i++){
    await addContactAndIntroduction(introduction, contacts[i])
  }
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
