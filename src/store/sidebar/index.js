import * as _actions from './actions'
import { SidebarContentTypes } from './contentTypes'

export const actions = _actions
export const namespace = 'sidebar'

const initialState = {
  visible: false,
  loading: false,
  content: null
}

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case actions.TOGGLE_SIDEBAR:
      return {
        ...state,
        visible: !state.visible,
      }
    case actions.SIDEBAR_SHOW_PROFILE:
      return {
        ...state,
        visible: true,
        content: {
          type: SidebarContentTypes.Profile,
          profile: action.payload
        }
      }
    case actions.SIDEBAR_SHOW_CONVERSATION_INFO:
      return {
        ...state,
        visible: true,
        content: {
          type: SidebarContentTypes.Conversation,
          conversation: action.payload
        }
      }
    default:
      return state
  }
}
