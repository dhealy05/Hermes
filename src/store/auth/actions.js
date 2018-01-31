import * as blockstack from 'blockstack'
import { identity } from '../../services/identity'
import { payloadAction } from '../util'

export const SET_IDENTITY = 'SET_USER_INFO'
export const setIdentity = payloadAction(SET_IDENTITY)

export const CHECK_AUTH = 'CHECK_AUTH'
export const checkAuth = dispatch => {
  if (blockstack.isUserSignedIn()) {
    dispatch(setIdentity(identity()))
  } else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn('https://core.blockstack.org/v1/names/')
      .then(userData => {
        window.location = window.location.origin
      })
  }
}

export const redirectToSignIn = dispatch => {
  const origin = window.location.origin
  blockstack.redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
}

export const signOut = dispatch => {
  var redirect = window.location.origin
  if (process.env.NODE_ENV === 'production') {
    redirect = "https://www.hihermes.co"
  }
  blockstack.signUserOut(redirect)
  dispatch(setIdentity(null))
}
