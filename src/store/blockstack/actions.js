import * as blockstack from 'blockstack'
import { payloadAction } from '../util'

export const SET_IDENTITY = 'SET_USER_INFO'
export const setIdentity = payloadAction(SET_IDENTITY)

export const CHECK_AUTH = 'CHECK_AUTH'
export const checkAuth = () => (dispatch) => {
  if (blockstack.isUserSignedIn()) {
    dispatch(setIdentity(blockstack.loadUserData()))
  } else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn('http://localhost:6270/v1/names/')
      .then(userData => {
        window.location = window.location.origin
      })
  }
}

export const redirectToSignIn = () => blockstack.redirectToSignIn()
