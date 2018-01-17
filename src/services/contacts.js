import { getJson, saveJson } from './blockstack'

export async function getContacts() {
  return await getJson('contacts.json')
}

export async function saveContactById(id, contact) {
  const list = await getContacts()
  list.contacts[id] = contact
  await saveJson('contacts.json', list)
  return contact
}
