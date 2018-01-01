import { compose, lifecycle, branch, renderNothing } from 'recompose'
import { connect } from 'react-redux'
import { ChatView } from '../components/ChatView'
import { WithAuthChallenge } from './WithAuthChallenge'
import { actions } from '../store'

const WithRedux = connect(
  state => {
    const conversation = state.chat.activeConversation
                      && state.chat.conversationDetails[state.chat.activeConversation]

    const contacts = state.contacts.contactsById

    const loading = state.chat.loadingConversationMetadata
                 || state.contacts.loading
                 || !conversation
                 || conversation.loading

    return {
      conversation,
      loading,
      contacts
    }
  },
  dispatch => ({
    loadInitialData: async () => {
      await dispatch(actions.setup())

      // TODO right now actions.setup() directly inserts fake data into the redux store because blockstack is 503ing
      //dispatch(actions.contacts.fetchContacts())
      //dispatch(actions.chat.fetchConversationList())
    },
    onRecvMessage: payload => dispatch(actions.chat.recvMessage(payload)),
    onSendMessage: text => dispatch(actions.chat.sendMessage(text))
  })
)

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
  WithDataOnLoad,
  WithLoader
)(ChatView)
