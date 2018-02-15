import * as blockstack from 'blockstack'
import { Contact } from '../models/contact'
import { getJson, saveJson } from './blockstack'
import {lookupProfile, identity, isUserOnHermes} from './identity'
import {encodeText, decodeText} from './keys'

export async function getContacts() {
  return await getJson('contacts.json')
}

export async function addContactById(id, trusted = false) {
  if(id == 'hermesHelper'){return getHermesHelper()}
  const profile = await lookupProfile(id)
  var pic = 'https://www.hihermes.co/images/avatars/' + id[0].toLowerCase() + '.svg'
  if(profile.image != null){pic = profile.image[0].contentUrl}
  var name = profile.name
  if(name == null || name == ''){name = id}

  const contact = new Contact({
    id,
    name: name,
    pic,
    statusPage: '',
    statusSecret: '',
    trusted: trusted
  })
  return saveContactDataById(id, contact)
}

function getHermesHelper(){
  var pic = 'https://www.hihermes.co/images/avatars/HermesHelper.svg'
  const contact = new Contact({
    id: 'hermesHelper',
    name: "Hermes Helper",
    pic,
    statusPage: '',
    statusSecret: '',
    trusted: true
  })
  return contact
}

export async function saveContactDataById(id, contact) {
  const { contacts } = await getContacts()
  contacts[id] = contact
  await saveContactsFile(contacts)
  addFriendsOnlyContactById(id)
  return contact
}

export async function saveContactsFile(listOrMap) {
  const contacts = Array.isArray(listOrMap)
                 ? listOrMap.reduce((accm, c) => { accm[c.id] = c; return accm; }, {})
                 : listOrMap

  const file = { contacts }
  await saveJson('contacts.json', file)
  return file
}

export async function deleteContact(id){
  var contacts = await getJson("contacts.json")
  delete contacts[id]
  await saveJson("contacts.json", contacts)
}

export function getPublicIndexForId(username) {
  return getJson('public_index.json', { username })
}

export async function getPublicKeyForId(id) {
  const index = await getPublicIndexForId(id)

  if (!index) {
    return null
  }

  return index.pubkey.data
}

export async function addFriendsOnlyContactById(id){
  if(id == 'hermesHelper'){return;}
  const info = await getJson('status.json')
  var status = await getJson(info.filename, {username: identity().username})
  var friendsList = []
  for(var i = 0; i < status.contacts.length; i++){
    friendsList.push(decodeText(status.contacts[i], info.secret))
  }
  if(friendsList.includes(id)){return;}
  var profile = await lookupProfile(id)
  var onHermes = await isUserOnHermes(profile)
  if(!onHermes){return;}
  var encoded = encodeText(id, info.secret)
  status.contacts.push(encoded)
  await saveJson(info.filename, status, {isPublic: true})
}

export async function clearFriendsOnlyContacts(){
  const info = await getJson('status.json')
  var status = await getJson(info.filename, {username: identity().username})
  status.contacts = []
  await saveJson(info.filename, status, {isPublic: true})
}
