import * as blockstack from 'blockstack'
import { identity } from '../../services/identity'
import { payloadAction } from '../util'

export const SET_IDENTITY = 'SET_USER_INFO'
export const setIdentity = payloadAction(SET_IDENTITY)

export const CHECK_AUTH = 'CHECK_AUTH'
export const checkAuth = () => async dispatch => {
  const origin = window.location.origin

  if (blockstack.isUserSignedIn()) {
    dispatch(setIdentity(identity()))
    return
  }

  if (blockstack.isSignInPending()) {
    await blockstack.handlePendingSignIn('https://core.blockstack.org/v1/names')
    window.location = origin
    return
  }
  
  blockstack.redirectToSignIn(origin, `${origin}/manifest.json`, ['store_write', 'publish_data'])

  // get rid of this window to avoid duplicating hermes
  // (which can lead to weird auth errors)
  setTimeout(() => {
    window.location = 'https://www.hihermes.co'
  }, 500)
}

export const signOut = () => dispatch => {
  blockstack.signUserOut('https://www.hihermes.co')
}
