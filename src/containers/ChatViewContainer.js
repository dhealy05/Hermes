import React from 'react'
import {
  compose,
  lifecycle,
  branch,
  renderComponent,
  withProps
} from 'recompose'
import { connect } from 'react-redux'
import { chain, get } from 'lodash'
import { ChatView } from '../components/ChatView'
import { Loader } from '../components/Loader'
import { identity } from '../services'
import { COMPOSE_CONVERSATION_ID } from '../store/chat/actions'
import { actions } from '../store'
import { formatListOfNames } from '../util'
import { ChatSidebarContainer } from './ChatSidebarContainer'
import { EmojiPickerContainer } from './EmojiPickerContainer'
import { InfoSidebarContainer } from './InfoSidebarContainer'

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

const WithRedux = connect(
  state => {
    const identity = state.auth.identity

    const activeConversation = state.chat.activeConversation

    const composing = activeConversation === COMPOSE_CONVERSATION_ID
    const conversation = activeConversation
                      && state.chat.conversationDetails[activeConversation]

    const contacts = state.contacts.contactsById
    const fileContents = state.chat.fileContents

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || (!conversation && !composing)
                 || conversation && conversation.loading

    const metadata = state.chat.conversationMetadata[activeConversation]
    const conversationTitle = (composing || !conversation)
                            ? 'New Conversation'
                            : getTitleForConversation(metadata, contacts)

    const typing = chain(state.chat.typingIndicators[activeConversation] || {})
      .map((isTyping, contactId) => ({ isTyping, contactId }))
      .filter(({ isTyping }) => !!isTyping)
      .map(({ contactId }) => get(contacts, `['${contactId}'].name`, contactId))
      .value()

    let newMessageRecipients = []

    if (composing) {
      newMessageRecipients = state.chat.newMessageRecipients.map(id => contacts[id])
    }

    const { sendingNewConversation, messageInputValue } = state.chat

    return {
      identity,
      composing,
      conversation,
      conversationTitle,
      loading,
      contacts,
      typing,
      fileContents,
      newMessageRecipients,
      sendingNewConversation,
      messageInputValue
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
    onToggleEmojiPicker: () => dispatch(actions.emoji.setPickerActive(true)),
    onSignOut: () => dispatch(actions.auth.signOut()),
    onTyping: () => dispatch(actions.chat.broadcastTyping()),
    onMessageInputChange: evt => {
      const value = typeof evt === 'string'
                  ? evt
                  : evt.target.value
      dispatch(actions.chat.setMessageInputValue(value))
    },
    onAcceptConversation: () => dispatch(actions.chat.acceptActiveConversation()),
    toggleInfoSidebar: () => dispatch(actions.sidebar.toggleSidebar())
  })
)

const WithContainerChildren = withProps({
  sidebar: <ChatSidebarContainer/>,
  infoSidebar: <InfoSidebarContainer/>,
  emojiPicker: <EmojiPickerContainer/>
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
  WithContainerChildren,
  WithDataOnLoad,
  WithLoader
)(ChatView)
