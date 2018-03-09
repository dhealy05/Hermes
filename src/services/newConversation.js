import {
  createNewConversation,
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
  discoverConversation
} from './discovery'
import swal from 'sweetalert'

const crypto = require('crypto')

export async function contactRequest(id){
  await newConversation("Please add me to your contact list!", [id])
}

export async function newConversation(text, otherIds) {
  if (typeof text !== 'string') {
    throw new TypeError('first message must be a string right now')
  }

  if (!Array.isArray(otherIds)) {
    otherIds = [otherIds]
  }

  const contacts = [identity().username, ...otherIds]

  if (contacts.length === 2) {
    const discovered = await discoverConversation(contacts[1])

    if (discovered) {
      return discovered
    }
  }

  const introduction = {
    filename: crypto.randomBytes(20).toString('base64'),
    groupSecret: crypto.randomBytes(48).toString('base64'),
    contacts: JSON.stringify(contacts),
    discovery: await getLocalPublicIndex(),
    text
  }

  let finalSecret = introduction.groupSecret

  for (const contactId of contacts) {
    if (contactId === identity().username) {
      continue
    }

    const regularSecret = await addContactAndIntroduction(introduction, contactId)

    if(regularSecret == null){
      const message = `Oops! ${contactId} hasn't signed on to Hermes yet. We'll let you know when they do :)`
      swal(message)
      return;
    }

    if (contacts.length === 2) {
      finalSecret = regularSecret
    }
  }

  await saveNewOutbox(introduction.filename, finalSecret)
  return createNewConversation(introduction.filename, contacts, text, finalSecret)
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
  await addContactById(id, true)
  return secret
}
