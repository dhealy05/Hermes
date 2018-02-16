import React from 'react'
import { connect } from 'react-redux'
import { compose, branch, renderComponent } from 'recompose'
import { MessageOutlet, MessagesContainerDiv } from '../components/MessageOutlet'
import { ComposeIllustration } from '../components/ComposeIllustration'
import { Loader } from '../components/Loader'
import { actions } from '../store'
import { NewConversationInvitationContainer } from './NewConversationInvitationContainer'

const withRedux = connect(
  state => {
    const { auth: { identity },
            chat: { activeConversation,
                    conversationDetails,
                    fileContents },
            contacts: { contactsById } } = state

    const conversation = activeConversation
                      && conversationDetails[activeConversation]

    return {
      identity,
      conversation,
      contactsById,
      fileContentsById: fileContents
    }
  },
  dispatch => ({
    onPollMessages: () => dispatch(actions.chat.pollNewMessages()),
    showProfileSidebar: contactId => dispatch(actions.sidebar.showProfile(contactId))
  })
)

const withComposeIllustration = branch(
  props => !props.conversation,
  renderComponent(ComposeIllustration)
)

const withLoader = branch(
  props => props.conversation.loading,
  renderComponent(() => (
    <MessagesContainerDiv>
      <Loader/>
    </MessagesContainerDiv>
  ))
)

const withNewConversationInvitation = branch(
  props => !props.conversation.trusted,
  renderComponent(NewConversationInvitationContainer)
)

export const MessageOutletContainer = compose(
  withRedux,
  withComposeIllustration,
  withLoader,
  withNewConversationInvitation
)(MessageOutlet)
