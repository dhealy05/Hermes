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

export async function lookupProfileNonLocal(id){
  return await blockstack.lookupProfile(id, "https://core.blockstack.org/v1/names/")
}
