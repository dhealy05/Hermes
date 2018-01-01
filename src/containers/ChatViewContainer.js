import { compose, lifecycle, branch } from 'recompose'
import { connect } from 'react-redux'
import { ChatView } from '../components/ChatView'
import { WithAuthChallenge } from './WithAuthChallenge'
import { actions } from '../store'

const WithRedux = connect(
  state => ({
    loadingConversation: state.chat.loading,
    messages: state.chat.messages
  }),
  dispatch => ({
    loadInitialData: async () => {
      await dispatch(actions.setup())

      dispatch(actions.contacts.fetchContacts())
      dispatch(actions.chat.fetchConversationList())
    },
    onRecvMessage: payload => dispatch(actions.chat.recvMessage(payload)),
    onSendMessage: text => dispatch(actions.chat.sendMessage(text))
  })
)

const WithLoader = branch(
  props => props.loadingData
)

const WithDataOnLoad = lifecycle({
  componentDidMount() {
    this.props.loadInitialData()
  }
})

export const ChatViewContainer = compose(
  WithAuthChallenge,
  WithRedux,
  WithLoader,
  WithDataOnLoad
)(ChatView)
