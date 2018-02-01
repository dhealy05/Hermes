import * as blockstack from 'blockstack'
import { getJson, saveJson } from './blockstack'

export const identity = () => blockstack.loadUserData()

export const getLocalPublicIndex = () => getJson(
  'public_index.json',
  { username: identity().username }
)

export const saveLocalPublicIndex = data => saveJson(
  'public_index.json',
  data,
  { isPublic: true }
)

export async function lookupProfile(id){
  return await blockstack.lookupProfile(id, "https://core.blockstack.org/v1/names/")
}

export async function isUserOnHermes(idOrProfile) {
  const profile = typeof idOrProfile === 'string'
                ? await lookupProfile(idOrProfile)
                : idOrProfile

  return !!profile.apps[window.location.origin]
}
