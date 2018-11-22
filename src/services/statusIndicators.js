import { HermesHelperId } from '../constants'
import { identity, getLocalPublicIndex, saveLocalPublicIndex } from './identity'
import { getJson, saveJson} from './blockstack'
import { encodeText, decodeText } from './keys'
import { saveContactDataById, getContacts } from './contacts'
import { getConversations } from './conversations'
import { enableStatusPage } from './discovery'
import { getPublicAddress } from './bitcoin'

export async function setTyping(convo){
  if(convo.id.includes(HermesHelperId)){return}
  var outbox = await getJson(convo.filename, {username: identity().username})
  outbox.typing = encodeText(new Date().toISOString(), convo.secret)
  return await saveJson(convo.filename, outbox, { isPublic: true } )
}

export function checkTyping(typing){
  if (!typing) {
    return false
  }

  const lastTyped = new Date(typing)
  return (new Date() - lastTyped) < 30000
}

export async function updateStatus(){
  const info = await getJson('status.json')
  if(info == null){await refreshStatusAndBitcoinAddress(); return true}
  var status = await getJson(info.filename, {username: identity().username})
  var lastSeen = new Date().toISOString()
  var encoded = encodeText(lastSeen, info.secret)
  status.lastSeen = encoded
  await saveJson(info.filename, status, {isPublic: true})
  return true
}

export async function refreshStatusAndBitcoinAddress(){
  await enableStatusPage();
  var index = await getLocalPublicIndex()
  index.bitcoinAddress = await getPublicAddress()
  await saveLocalPublicIndex(index)
  return true;
}

export async function getMyStatus(){
  const info = await getJson('status.json')
  const status = await getJson(info.filename, {username: identity().username})
  var lastSeen = decodeText(status.lastSeen, info.secret)
  return new Date(lastSeen)
}

export async function getLastSeenForId(id){
  const statusPageAndSecret = await getStatusPageAndSecretForId(id)
  if(!statusPageAndSecret){return false}
  const lastSeen = decodeText(statusPageAndSecret.statusPage.lastSeen, statusPageAndSecret.secret)
  return new Date(lastSeen)
}

export async function getPublicFriendsForId(id){
  const statusPageAndSecret = await getStatusPageAndSecretForId(id)
  if(!statusPageAndSecret){return []}
  var decodedFriends = []
  for(var i = 0; i < statusPageAndSecret.statusPage.contacts.length; i++){
    decodedFriends.push(decodeText(statusPageAndSecret.statusPage.contacts[i], statusPageAndSecret.secret))
  }
  return decodedFriends
}

export async function getStatusPageAndSecretForId(id){
  if (id === HermesHelperId) {
    return false
  }

  const { contacts } = await getContacts()
  if (!contacts) {
    return false
  }

  let contact = contacts[id]

  if (!contact || !contact.trusted) {
    return false
  }

  if (!contact.statusPage || !contact.statusSecret) {
    contact = await updateContact(contact)
    if (!contact) {
      return false
    }
    const statusPage = await getJson(contact.statusPage, { username: contact.id })
    return {
      statusPage,
      secret: contact.statusSecret
    }
  }

  const statusPage = await getJson(contact.statusPage, {username: contact.id})
  return {
    statusPage,
    secret: contact.statusSecret
  }
}

async function updateContact(contact){
  const conversations = await getConversations()
  var secret = ''
  var filename = ''
  for(var id in conversations.conversations){
    if(id.includes(contact.id)){
      filename = conversations.conversations[id].filename
      secret = conversations.conversations[id].secret
    }
  }
  var outbox = await getJson(filename, {username: contact.id})
  if(outbox == null || outbox.statusPage == null || outbox.statusSecret == null){return false}
  contact.statusPage = decodeText(outbox.statusPage, secret)
  contact.statusSecret = decodeText(outbox.statusSecret, secret)
  saveContactDataById(contact.id, contact)
  return contact
}
