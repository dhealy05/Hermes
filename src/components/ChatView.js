import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { AppView } from './AppView'
import { NewMessageInput } from './NewMessageInput'
import { TypingIndicator } from './TypingIndicator'

const MessageInputContainer = styled.div`
  box-sizing: border-box;
  margin: 15px;
`

export class ChatView extends React.Component {
  state = {
    lastRead: null,
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
      onTyping,
      sendBtc,
      setExpirationDate,
      sidebar,
      infoSidebar,
      emojiPicker,
      onToggleEmojiPicker,
      messageInputValue,
      onMessageInputChange,
      topbar,
      messageOutlet
    } = this.props

    return (
      <AppView sidebar={sidebar}
               infoSidebar={infoSidebar}
               emojiPicker={emojiPicker}
               topbar={topbar}>
        {messageOutlet}
        <MessageInputContainer>
          <TypingIndicator names={typing}/>
          <NewMessageInput onPickImage={onPickImage}
                           onToggleEmojiPicker={onToggleEmojiPicker}
                           placeholder="Type your message"
                           value={messageInputValue}
                           onTyping={onTyping}
                           sendBtc={sendBtc}
                           setExpirationDate={setExpirationDate}
                           onChange={onMessageInputChange}
                           onKeyUp={this.onMsgInputKeyUp}/>
        </MessageInputContainer>
      </AppView>
    )
  }
}
ChatView.propTypes = {
  onMarkConversationAsRead: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  sendBtc: PropTypes.func.isRequired,
  setExpirationDate: PropTypes.func.isRequired,
  onToggleEmojiPicker: PropTypes.func.isRequired,
  messageInputValue: PropTypes.string.isRequired,
  onMessageInputChange: PropTypes.func.isRequired,
  sidebar: PropTypes.element,
  infoSidebar: PropTypes.element,
  emojiPicker: PropTypes.element,
  topbar: PropTypes.element,
  messageOutlet: PropTypes.element,
}
