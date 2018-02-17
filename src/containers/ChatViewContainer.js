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
import { SendMessageInputContainer } from './SendMessageInputContainer'

const WithRedux = connect(
  state => {
    const activeConversation = state.chat.activeConversation
    const sendingNewConversation = state.chat.sendingNewConversation

    const composing = activeConversation === COMPOSE_CONVERSATION_ID
    const conversation = activeConversation
                      && state.chat.conversationMetadata[activeConversation]

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || (!conversation && !composing && !sendingNewConversation)

    return { loading }
  },
  dispatch => ({
    loadInitialData: async () => {
      await dispatch(actions.setup())
      await dispatch(actions.contacts.fetchContacts())
      await dispatch(actions.contacts.fetchSelf())
      await dispatch(actions.chat.fetchConversationList())
    },
  })
)

const WithContainerChildren = withProps({
  sidebar: <ChatSidebarContainer/>,
  infoSidebar: <InfoSidebarContainer/>,
  emojiPicker: <EmojiPickerContainer/>,
  topbar: <TopBarContainer/>,
  messageOutlet: <MessageOutletContainer/>,
  sendMessageInput: <SendMessageInputContainer/>
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
