import * as _actions from './actions'

export const actions = _actions

export const namespace = 'emoji'

const initialState = {
  emojiPickerActive: false
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_EMOJI_PICKER_ACTIVE:
      return {
        ...state,
        emojiPickerActive: action.payload
      }
    case actions.PICK_EMOJI:
      return {
        ...state,
        emojiPickerActive: false
      }
    default:
      return state
  }
}
