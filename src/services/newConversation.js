import * as blockstack from 'blockstack'
import {
  Conversation,
  Contact,
  Message
} from '../models'
import {
  getConversations,
  saveConversationById,
  saveOutgoingMessages
} from './conversations'
import {
  addContactById,
  getPublicKeyForId
} from './contacts'
import {
  getMyKeys,
  getSharedSecret,
  encodeText,
  decodeText
} from './keys'
import {
  getLocalPublicIndex,
  saveLocalPublicIndex
} from './identity'

const crypto = require('crypto')

export async function newConversation(text, otherId) {
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
  await saveOutgoingMessages(filename, { messages: [] })
  await addConversation(filename, otherId, text, secret)
  await addContactById(otherId)
}

async function addConversation(filename, blockstackId, content, sharedSecret){
  const myConversations = await getConversations()
  const msg = new Message({
    sender: 'you',
    content,
    sentAt: new Date()
  })
  const convo = new Conversation({
    filename,
    contacts: [blockstackId],
    secret: sharedSecret,
    messages: [msg]
  })
  await saveConversationById(Conversation.getId(convo), convo)
}
