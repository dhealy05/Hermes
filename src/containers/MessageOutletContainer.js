import { connect } from 'react-redux'
import { compose, branch, renderComponent } from 'recompose'
import { MessageOutlet } from '../components/MessageOutlet'
import { ComposeIllustration } from '../components/ComposeIllustration'
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
    showProfileSidebar: contactId => dispatch(actions.sidebar.showProfile(contactId)),
    onDownloadFile: timestamp => dispatch(actions.chat.downloadFile(timestamp))
  })
)

const withComposeIllustration = branch(
  props => !props.conversation,
  renderComponent(ComposeIllustration)
)

const withNewConversationInvitation = branch(
  props => !props.conversation.loading && !props.conversation.trusted,
  renderComponent(NewConversationInvitationContainer)
)

export const MessageOutletContainer = compose(
  withRedux,
  withComposeIllustration,
  withNewConversationInvitation
)(MessageOutlet)
