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
import { COMPOSE_CONVERSATION_ID } from '../store/chat/actions'
import { actions } from '../store'
import { ChatSidebarContainer } from './ChatSidebarContainer'
import { EmojiPickerContainer } from './EmojiPickerContainer'
import { InfoSidebarContainer } from './InfoSidebarContainer'
import { TopBarContainer } from './TopBarContainer'
import { MessageOutletContainer } from './MessageOutletContainer'

const WithRedux = connect(
  state => {
    const activeConversation = state.chat.activeConversation

    const composing = activeConversation === COMPOSE_CONVERSATION_ID
    const conversation = activeConversation
                      && state.chat.conversationDetails[activeConversation]

    const contacts = state.contacts.contactsById

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || (!conversation && !composing)

    const typing = chain(state.chat.typingIndicators[activeConversation] || {})
      .map((isTyping, contactId) => ({ isTyping, contactId }))
      .filter(({ isTyping }) => !!isTyping)
      .map(({ contactId }) => get(contacts, `['${contactId}'].name`, contactId))
      .value()

    const { messageInputValue, messageExpirationDate } = state.chat

    return {
      loading,
      contacts,
      typing,
      messageInputValue,
      messageExpirationDate
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
    onSendMessage: text => {
      if (text.trim() === '/delete') {
        dispatch(actions.chat.deleteActiveConversation())
        return
      }

      dispatch(actions.chat.sendText(text))
    },
    onPickImage: file => dispatch(actions.chat.sendFile(file)),
    onToggleEmojiPicker: () => dispatch(actions.emoji.setPickerActive(true)),
    onTyping: () => dispatch(actions.chat.broadcastTyping()),
    sendBtc: amt => dispatch(actions.chat.sendBtc(amt)),
    setExpirationDate: date => dispatch(actions.chat.setExpirationDate(date)),
    onMessageInputChange: evt => {
      const value = typeof evt === 'string'
                  ? evt
                  : evt.target.value
      dispatch(actions.chat.setMessageInputValue(value))
    }
  })
)

const WithContainerChildren = withProps({
  sidebar: <ChatSidebarContainer/>,
  infoSidebar: <InfoSidebarContainer/>,
  emojiPicker: <EmojiPickerContainer/>,
  topbar: <TopBarContainer/>,
  messageOutlet: <MessageOutletContainer/>
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
