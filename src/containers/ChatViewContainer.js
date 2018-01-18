import React from 'react'
import {
  compose,
  lifecycle,
  branch,
  renderNothing,
  withProps
} from 'recompose'
import { connect } from 'react-redux'
import { ChatView } from '../components/ChatView'
import { actions } from '../store'
import { WithAuthChallenge } from './WithAuthChallenge'
import { ChatSidebarContainer } from './ChatSidebarContainer'

const WithRedux = connect(
  state => {
    const identity = state.auth.identity

    const conversation = state.chat.activeConversation
                      && state.chat.conversationDetails[state.chat.activeConversation]

    const contacts = state.contacts.contactsById

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || !conversation
                 || conversation.loading

    return {
      identity,
      conversation,
      loading,
      contacts
    }
  },
  dispatch => ({
    loadInitialData: async () => {
      await dispatch(actions.setup())
      await dispatch(actions.contacts.fetchContacts())
      await dispatch(actions.contacts.fetchSelf())
      await dispatch(actions.chat.fetchConversationList())
    },
    onSendMessage: text => dispatch(actions.chat.sendMessage(text))
  })
)

const WithSidebar = withProps({
  sidebar: <ChatSidebarContainer/>
})

const WithLoader = branch(
  props => props.loading,
  renderNothing
)

const WithDataOnLoad = lifecycle({
  componentDidMount() {
    this.props.loadInitialData()
  }
})

export const ChatViewContainer = compose(
  WithAuthChallenge,
  WithRedux,
  WithSidebar,
  WithDataOnLoad,
  WithLoader
)(ChatView)
