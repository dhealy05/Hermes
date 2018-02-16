import { connect } from 'react-redux'
import { compose } from 'recompose'
import { chain, get } from 'lodash'
import { actions } from '../store'
import { SendMessageInput } from '../components/SendMessageInput'

const withRedux = connect(
  state => {
    const { chat: { activeConversation,
                    typingIndicators,
                    messageInputValue },
            contacts: { contactsById } } = state

    const typing = chain(typingIndicators[activeConversation] || {})
      .map((isTyping, contactId) => ({ isTyping, contactId }))
      .filter(({ isTyping }) => !!isTyping)
      .map(({ contactId }) => get(contactsById, `['${contactId}'].name`, contactId))
      .value()

    return {
      typing,
      messageInputValue
    }
  },
  dispatch => ({
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

export const SendMessageInputContainer = compose(
  withRedux
)(SendMessageInput)
