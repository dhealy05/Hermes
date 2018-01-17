import { getJson, saveJson } from './blockstack'

export async function getContacts() {
  return await getJson('contacts.json')
}

export async function saveContactById(id, contact) {
  const { contacts } = await getContacts()
  contacts[id] = contact
  await saveContactsFile(contacts)
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
