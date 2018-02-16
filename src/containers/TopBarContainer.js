import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { AddUserToChat } from '../components/AddUserToChat'
import { TopNav } from '../components/TopNav'
import { identity } from '../services'
import { actions } from '../store'
import { COMPOSE_CONVERSATION_ID } from '../store/chat/actions'
import { formatListOfNames } from '../util'

const WithRedux = connect(
  state => {
    const { chat: { activeConversation,
                    conversationMetadata,
                    sendingNewConversation },
            contacts: { contactsById } } = state

    const composing = activeConversation === COMPOSE_CONVERSATION_ID
    const conversation = activeConversation
                      && conversationMetadata[activeConversation]

    const title = conversation && getTitleForConversation(conversation, contactsById)

    let newMessageRecipients = []
    if (composing) {
      newMessageRecipients = state.chat.newMessageRecipients.map(id => contactsById[id])
    }

    return {
      composing,
      sendingNewConversation,
      title,
      newMessageRecipients
    }
  },
  dispatch => ({
    toggleInfoSidebar: () => dispatch(actions.sidebar.showActiveConversation()),
    showProfileSidebar: () => dispatch(actions.sidebar.showProfile()),
    onSignOut: () => dispatch(actions.auth.signOut()),
    onSetNewMessageRecipients: ids => dispatch(actions.chat.setNewMessageRecipients(ids))
  }),
  (stateProps, dispatchProps, ownProps) => {
    const children = (stateProps.composing && !stateProps.sendingNewConversation)
                   ? <AddUserToChat recipients={stateProps.newMessageRecipients}
                                    onChange={dispatchProps.onSetNewMessageRecipients}/>
                   : null

    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      children
    }
  }
)

export const TopBarContainer = compose(
  WithRedux
)(TopNav)

function getTitleForConversation(convo, contactsById) {
  if (!convo) {
    return ''
  }

  const myId = identity().username

  const names = convo.contacts
    .filter(id => id !== myId)
    .map(id => {
      const contact = contactsById[id]

      if (!contact) {
        return id
      }

      return contact.name
    })

  return formatListOfNames(['You', ...names])
}
