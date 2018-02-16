import { chain } from 'lodash'
import { connect } from 'react-redux'
import { NewConversationInvitation } from '../components/NewConversationInvitation'
import { identity } from '../services'
import { actions } from '../store'

export const NewConversationInvitationContainer = connect(
  state => {
    const { chat: { activeConversation,
                    conversationMetadata },
            contacts: { contactsById } } = state

    const convo = conversationMetadata[activeConversation]

    const others = chain(convo)
      .get('contacts', [])
      .filter(c => c !== identity().username)
      .map(c => contactsById[c])
      .value()

    return { others }
  },
  dispatch => ({
    onAccept: () => dispatch(actions.chat.acceptActiveConversation())
  })
)(NewConversationInvitation)
