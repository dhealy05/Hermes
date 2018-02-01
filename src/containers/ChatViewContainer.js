import React from 'react'
import {
  compose,
  lifecycle,
  branch,
  renderComponent,
  withProps
} from 'recompose'
import { connect } from 'react-redux'
import { ChatView } from '../components/ChatView'
import { Loader } from '../components/Loader'
import { identity } from '../services'
import { COMPOSE_CONVERSATION_ID } from '../store/chat/actions'
import { actions } from '../store'
import { ChatSidebarContainer } from './ChatSidebarContainer'

function getTitleForConversation(convo, contactsById) {
  if (!convo) {
    return ''
  }

  const myId = identity().username

  let names = convo.contacts
    .filter(id => id !== myId)
    .map(id => {
      const contact = contactsById[id]

      if (!contact) {
        return id
      }

      return contact.name
    })

  names = ['You', ...names]

  if (names.length < 3) {
    return names.join(' and ')
  }

  const commaNames = names.slice(0, names.length - 1).join(', ')
  const finalName = names[names.length - 1]

  return `${commaNames}, and ${finalName}`
}

const WithRedux = connect(
  state => {
    const identity = state.auth.identity

    const composing = state.chat.activeConversation === COMPOSE_CONVERSATION_ID
    const conversation = state.chat.activeConversation
                      && state.chat.conversationDetails[state.chat.activeConversation]

    const contacts = state.contacts.contactsById
    const fileContents = state.chat.fileContents

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || (!conversation && !composing)
                 || conversation && conversation.loading

    const metadata = state.chat.conversationMetadata[state.chat.activeConversation]
    const conversationTitle = (composing || !conversation)
                            ? 'New Conversation'
                            : getTitleForConversation(metadata, contacts)

    let newMessageRecipients = []

    if (composing) {
      newMessageRecipients = state.chat.newMessageRecipients.map(id => contacts[id])
    }

    const sendingNewConversation = state.chat.sendingNewConversation

    return {
      identity,
      composing,
      conversation,
      conversationTitle,
      loading,
      contacts,
      fileContents,
      newMessageRecipients,
      sendingNewConversation
    }
  },
  dispatch => ({
    loadInitialData: async () => {
      await dispatch(actions.setup())
      await dispatch(actions.contacts.fetchContacts())
      await dispatch(actions.contacts.fetchSelf())
      await dispatch(actions.chat.fetchConversationList())
    },
    onMarkConversationAsRead: () => dispatch(actions.chat.markActiveConversationAsRead()),
    onPollMessages: () => dispatch(actions.chat.pollNewMessages()),
    onSendMessage: text => {
      if (text.trim() === '/delete') {
        dispatch(actions.chat.deleteActiveConversation())
        return
      }

      dispatch(actions.chat.sendText(text))
    },
    onPickImage: file => dispatch(actions.chat.sendFile(file)),
    onSetNewMessageRecipients: ids => dispatch(actions.chat.setNewMessageRecipients(ids)),
    onSignOut: () => dispatch(actions.auth.signOut())
  })
)

const WithSidebar = withProps({
  sidebar: <ChatSidebarContainer/>
})

const WithLoader = branch(
  props => props.loading,
  renderComponent(Loader)
)

const WithDataOnLoad = lifecycle({
  componentDidMount() {
    this.props.loadInitialData()
  }
})

export const ChatViewContainer = compose(
  WithRedux,
  WithSidebar,
  WithDataOnLoad,
  WithLoader
)(ChatView)
