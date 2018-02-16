import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Dropzone from 'react-dropzone'
import * as colors from '../colors'
import { AppView } from './AppView'
import { NewMessageInput } from './NewMessageInput'
import { TypingIndicator } from './TypingIndicator'

const MessageInputContainer = styled.div`
  box-sizing: border-box;
  margin: 15px;
`

const DropzoneContainer = styled(Dropzone)`
  width: 100%;
  height: 100%;
  border: none;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

const DropzoneLayer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: auto;
  ${props => props.isDragActive && css`
    border: 4px dashed ${colors.blue};
  `}
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

  onDrop = acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      this.props.onPickImage(acceptedFiles[0]);
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
        <DropzoneContainer accept="image/gif,image/jpeg,image/png"
                           onDrop={this.onDrop}
                           disableClick
                           multiple={false}>
          {({ isDragActive, isDragReject }) => (
            <DropzoneLayer isDragActive={isDragActive} isDragRejected={isDragReject}>
              {messageOutlet}
            </DropzoneLayer>
          )}
        </DropzoneContainer>
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
