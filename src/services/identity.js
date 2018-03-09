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
  try {
    const profile = await blockstack.lookupProfile(id, "https://core.blockstack.org/v1/names/")
    return profile
  } catch (error) {
    return null
  }
}

export async function isUserOnHermes(idOrProfile) {

  if(idOrProfile == null){return false}

  const profile = typeof idOrProfile === 'string'
                ? await lookupProfile(idOrProfile)
                : idOrProfile

  if(profile.apps == null){return false}
  if(profile.apps[window.location.origin] == null){return false}
  return true
  //return !!profile.apps[window.location.origin]
}
