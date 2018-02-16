import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { TypingIndicator } from './TypingIndicator'
import { MessageTextInput } from './MessageTextInput'

const MessageInputContainer = styled.div`
  box-sizing: border-box;
  margin: 15px;
`

export class SendMessageInput extends React.Component {
  state = {
    msgInput: ''
  }

  onMsgInputKeyUp = evt => {
    if (evt.keyCode === 13) {
      this.props.onSendMessage(this.props.messageInputValue)
      this.props.onMessageInputChange('')
    }
  }

  render() {
    const {
      typing,
      onPickImage,
      onToggleEmojiPicker,
      messageInputValue,
      onTyping,
      sendBtc,
      setExpirationDate,
      onMessageInputChange
    } = this.props

    return (
      <MessageInputContainer>
        <TypingIndicator names={typing}/>
        <MessageTextInput onPickImage={onPickImage}
                          onToggleEmojiPicker={onToggleEmojiPicker}
                          placeholder="Type your message"
                          value={messageInputValue}
                          onTyping={onTyping}
                          sendBtc={sendBtc}
                          setExpirationDate={setExpirationDate}
                          onChange={onMessageInputChange}
                          onKeyUp={this.onMsgInputKeyUp}/>
      </MessageInputContainer>
    )
  }
}
SendMessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  sendBtc: PropTypes.func.isRequired,
  setExpirationDate: PropTypes.func.isRequired,
  onToggleEmojiPicker: PropTypes.func.isRequired,
  messageInputValue: PropTypes.string.isRequired,
  onMessageInputChange: PropTypes.func.isRequired,
}
