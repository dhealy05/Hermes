import { identity } from './identity'
import { getJson, saveJson} from './blockstack'
import { encodeText, decodeText } from './keys'
import { saveContactDataById, getContacts } from './contacts'
import { getConversations } from './conversations'

export async function setTyping(convo){
  var outbox = await getJson(convo.filename, {username: identity().username})
  outbox.typing = encodeText(new Date().toISOString(), convo.secret)
  return await saveJson(convo.filename, outbox, { isPublic: true } )
}

export function checkTyping(typing){
  if (!typing) {
    return false
  }

  var lastTyped = new Date(typing)
  var thirty_secs = 30 * 1000;
  if(((new Date) - lastTyped) < thirty_secs){return true}
  return false
}

export async function updateStatus(){
  const info = await getJson('status.json')
  var status = await getJson(info.filename, {username: identity().username})
  var lastSeen = new Date().toISOString()
  var encoded = encodeText(lastSeen, info.secret)
  status.lastSeen = encoded
  await saveJson(info.filename, status, {isPublic: true})
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
  if(id == 'hermesHelper'){return}
  var contacts = await getContacts()
  if(contacts == null){return false}
  var contact = contacts.contacts[id]
  if(contact == null){return false}
  if(!contact.trusted){return false}
  if(contact.statusPage == '' || contact.statusSecret == ''){
    contact = await updateContact(contact)
    if(!contact){return false}
    var statusPage = await getJson(contact.statusPage, {username: contact.id})
    return {statusPage: statusPage, secret: contact.statusSecret}
  } else {
    var statusPage = await getJson(contact.statusPage, {username: contact.id})
    return {statusPage: statusPage, secret: contact.statusSecret}
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
