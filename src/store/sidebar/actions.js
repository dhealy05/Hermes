import { payloadAction } from '../util'

export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const toggleSidebar = payloadAction(TOGGLE_SIDEBAR)

export const HIDE_SIDEBAR = 'HIDE_SIDEBAR'
export const hideSidebar = payloadAction(HIDE_SIDEBAR)

export const SIDEBAR_SHOW_CONVERSATION_INFO = 'SIDEBAR_SHOW_CONVERSATION_INFO'
export const sidebarShowConversationInfo = payloadAction(SIDEBAR_SHOW_CONVERSATION_INFO)

export const SIDEBAR_SHOW_PROFILE = 'SIDEBAR_SHOW_PROFILE'
export const sidebarShowProfile = payloadAction(SIDEBAR_SHOW_PROFILE)

export const showActiveConversation = convoId => (dispatch, getState) => {
  var { chat: { activeConversation,
                conversationMetadata },
        sidebar: { visible,
                   content } } = getState()

  if (convoId) {
    activeConversation = convoId
  }

  if (convoId && !visible) {
    dispatch(hideSidebar())
    return
  }

  if (shouldShowSidebar(content, visible, false, activeConversation)) {
    dispatch(toggleSidebar())
    return
  }

  const convo = conversationMetadata[activeConversation]

  if (!convo) {
    return
  }

  dispatch(sidebarShowConversationInfo(convo))
}

export const showProfile = contactId => (dispatch, getState) => {
  const { contacts: { contactsById } } = getState()

  const { sidebar: { visible,
                     content } } = getState()

  if (shouldShowSidebar(content, visible, true, contactId)) {
    dispatch(toggleSidebar())
    return
  }

  const contact = contactsById[contactId]

  if (!contact) {
    // TODO load the contact
    return
  }

  dispatch(sidebarShowProfile(contact))
}

function shouldShowSidebar(content, visible, profile, existingId) {
  if (!content || !visible) {
    return false
  }

  if (profile) {
    return !!(content.profile && content.profile.id === existingId)
  }

  return existingId === 'compose'
       || !!(content.conversation && content.conversation.id === existingId)
}
