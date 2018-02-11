import { payloadAction } from '../util'

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const toggleSidebar = payloadAction(TOGGLE_SIDEBAR)

export const SIDEBAR_SHOW_CONVERSATION_INFO = 'SIDEBAR_SHOW_CONVERSATION_INFO'
export const sidebarShowConversationInfo = payloadAction(SIDEBAR_SHOW_CONVERSATION_INFO)

export const SIDEBAR_SHOW_PROFILE = 'SIDEBAR_SHOW_PROFILE'
export const sidebarShowProfile = payloadAction(SIDEBAR_SHOW_PROFILE)

export const showActiveConversation = () => (dispatch, getState) => {
  const { chat: { activeConversation,
                  conversationMetadata } } = getState()

  const { sidebar: { visible } } = getState()

  console.log(visible)

  if(visible){dispatch(toggleSidebar()); return}

  const convo = conversationMetadata[activeConversation]

  if (!convo) {
    return
  }

  dispatch(sidebarShowConversationInfo({ message: 'look at me' }))
}

export const showProfile = contactId => (dispatch, getState) => {
  const { contacts: { contactsById } } = getState()

  const { sidebar: { visible } } = getState()

  if(visible){dispatch(toggleSidebar()); return}

  const contact = contactsById[contactId]

  if (!contact) {
    // TODO load the contact
    return
  }

  dispatch(sidebarShowProfile(contact))
}
