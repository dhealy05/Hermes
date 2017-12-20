import { payloadAction } from '../util'

export const START_LOADING_CONTACT = 'START_LOADING_CONTACT'
export const startLoadingContact = payloadAction(START_LOADING_CONTACT)

export const ERROR_LOADING_CONTACT = 'ERROR_LOADING_CONTACT'
export const errorLoadingContact = payloadAction(ERROR_LOADING_CONTACT)

export const FINISH_LOADING_CONTACT = 'FINISH_LOADING_CONTACT'
export const finishLoadingContact = payloadAction(FINISH_LOADING_CONTACT)

export const SET_CONTACT = 'SET_CONTACT'
export const setContact = payloadAction(SET_CONTACT)

export const loadContact = id => dispatch => {
  dispatch(startLoadingContact())

  try {
    const result = {
      id: 'abcdef',
      name: 'Foo Bar',
      username: 'foobar'
    }
    dispatch(finishLoadingContact(result))
  } catch (e) {
    dispatch(errorLoadingContact(e))
  }
}
