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
                  conversationMetadata } } = getState()

  const { sidebar: { visible,
                     content } } = getState()

  if(convoId != null){activeConversation = convoId}

  if(visible == false && convoId != null){
    dispatch(hideSidebar());
    return;
  } else {
    var toggle = handleToggle(content, visible, false, activeConversation)
    if(toggle){dispatch(toggleSidebar()); return;}
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

  var toggle = handleToggle(content, visible, true, contactId)
  if(toggle){dispatch(toggleSidebar()); return}

  const contact = contactsById[contactId]

  if (!contact) {
    // TODO load the contact
    return
  }

  dispatch(sidebarShowProfile(contact))
}

function handleToggle(content, visible, profile, existingId){
  if(content == null){
    return false
  }

  if(profile){
    if(content.profile == null){return false}
    if(content.profile.id == existingId && visible){
      return true
    }
  }

  if(!profile){
    if(existingId == 'compose'){return true}
    if(content.conversation == null){return false}
    if(content.conversation.id == existingId && visible){
      return true
    }
  }

  return false
}
