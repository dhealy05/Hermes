import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { chain, get } from 'lodash'
import ReactPlaceholder from 'react-placeholder'
import { MediaBlock } from 'react-placeholder/lib/placeholders'
import Dropzone from 'react-dropzone'
import "react-placeholder/lib/reactPlaceholder.css"
import * as colors from '../colors'
import { ContentTypes, Conversation } from '../models/conversation'
import { AppView } from './AppView'
import { MessageGroup } from './MessageGroup'
import { Message } from './Message'
import { AddUserToChat } from './AddUserToChat'
import { NewMessageInput } from './NewMessageInput'
import { TypingIndicator } from './TypingIndicator'
import { NewConversationInvitation } from './NewConversationInvitation'
import { TopNav } from './TopNav'

const MessagesContainer = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
)

  &::-webkit-scrollbar-track {
    width: 3px;
    background-color: ${colors.white};
  }
`

const MessageInputContainer = styled.div`
  box-sizing: border-box;
  margin: 15px;
`

const Title = styled.div`
  flex-grow: 10;
  text-align: center;
`

const NewConversationIllustration = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 700px;
  height: 317px;
  margin-top: -200px; /* Half the height */
  margin-left: -350px; /* Half the width */
  div {
    text-align: center;
  }
  img {
    width: 500px;
    margin: 10px 100px;
  }
`

const DropzoneContainer = styled(Dropzone)`
  width: 100%;
  height: 100%;
  border: none;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
`

const DropzoneLayer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  box-sizing: border-box;
  overflow: auto;
  ${props => props.isDragActive && css`
    border: 4px dashed ${colors.blue};
  `}
`

// Simulating a conversation
const placeholder = (
  <MessagesContainer>
    <MediaBlock color={colors.greyLight} rows={7} />
    <MediaBlock color={colors.greyLight} rows={6} />
    <MediaBlock color={colors.greyLight} rows={8} />
  </MessagesContainer>
)

export class ChatView extends React.Component {
  state = {
    lastRead: null,
    msgInput: ''
  }

  messagesListEl = null
  justReceivedNewMessage = false
  pollingTimeout = null

  componentWillMount() {
    this.pollForMessages()
  }

  componentWillUnmount() {
    this.stopPolling()
  }

  componentWillReceiveProps(next) {
    const msgsLenPath = 'conversation.messages.length'

    if (get(next, msgsLenPath, 0) !== get(this.props, msgsLenPath, 0)) {
      /*
         need to scroll to the bottom of the list when a new message is added,
         but componentWillReceiveProps is called before the new message is
         actually rendered. Mark a flag here to run the function in
         componentDidUpdate
       */
      this.justReceivedNewMessage = true
    }

    if (next.conversation && !next.conversation.wasRead) {
      const lastRead = next.conversation.readAt
      //this.props.onMarkConversationAsRead()

      this.setState({ lastRead })
    } else if (!next.conversation
               || Conversation.getId(next.conversation) !== (this.props.conversation && Conversation.getId(this.props.conversation))) {
      this.setState({ lastRead: null })
    }
  }

  componentDidUpdate() {
    if (this.justReceivedNewMessage) {
      this.scrollToBottom()
      this.justReceivedNewMessage = false
    }
  }

  pollForMessages = () => {
    this.props.onPollMessages()

    this.pollingTimeout = setTimeout(
      () => this.pollForMessages(),
      this.props.messagePollInterval
    )
  }

  stopPolling = () => {
    if (!this.pollingTimeout) {
      return
    }

    clearTimeout(this.pollingTimeout)
  }

  scrollToBottom = () => {
    if (!this.messagesListEl) {
      return
    }

    const node = ReactDOM.findDOMNode(this.messagesListEl)
    node.scrollTop = node.scrollHeight
  }

  onMsgInputKeyUp = evt => {
    if (evt.keyCode === 13) {
      this.props.onSendMessage(this.props.messageInputValue)
      this.props.onMessageInputChange('')
    }
  }

  setMessagesList = el => this.messagesListEl = el

  onDrop = acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      this.props.onPickImage(acceptedFiles[0]);
    }
  }

  render() {
    const {
      identity,
      composing,
      conversation,
      conversationTitle,
      contacts,
      loadingConversation,
      typing,
      fileContents,
      newMessageRecipients,
      sendingNewConversation,
      onSignOut,
      onPickImage,
      onTyping,
      sendBtc,
      setExpirationDate,
      onSetNewMessageRecipients,
      sidebar,
      infoSidebar,
      emojiPicker,
      onToggleEmojiPicker,
      messageInputValue,
      onMessageInputChange,
      onAcceptConversation,
      showConversationSidebar,
      showProfileSidebar
    } = this.props
    let messageContents = []
    let topbar = (
      <TopNav title={conversationTitle}
              toggleInfoSidebar={showConversationSidebar}
              showProfileSidebar={() => showProfileSidebar(identity && identity.username)}
              onSignOut={onSignOut}>
        { conversationTitle ? <Title>{conversationTitle}</Title> : null }
      </TopNav>
    )

    if (conversation && conversation.trusted) {
      let lastSender;
      messageContents = conversation.messages
        .reduce((threads, message) => {
          if (message.sender !== lastSender) {
            // Create thread
            threads.push({ sender: message.sender, sentAt: message.sentAt, messages: [] });
          }
          threads[threads.length - 1].messages.unshift(message);
          lastSender = message.sender;
          return threads;
        }, [])
        .map(({ sender, sentAt, messages }, i) => (
          <MessageGroup key={i}
                        direction={sender === identity.username ? 'right' : 'left'}
                        sender={contacts[sender]}
                        onShowSenderProfile={() => showProfileSidebar(sender)}
                        timestamp={sentAt}>
            { messages && messages.map(({ sender,
                                          content: rawContent,
                                          type,
                                          sentAt,
                                          ...other }, i) => {
              let content = rawContent
              if (type === ContentTypes.Image) {
                content = fileContents[rawContent]
              }
              return (
                <Message key={i}
                         {...other}
                         direction={sender === identity.username ? 'right' : 'left'}
                         contentType={type}
                         content={content} />
              );
            })}
          </MessageGroup>
        ))
    } else if (conversation && !conversation.trusted) {
      const others = chain(conversation.contacts)
        .filter(c => c !== identity.username)
        .map(c => contacts[c])
        .value()

      messageContents = (
        <NewConversationInvitation others={others}
                                   onAccept={onAcceptConversation}/>
      )
    } else if (composing) {
      messageContents = (
        <NewConversationIllustration>
          <div>Say hello! Start a conversation with someone to add them to your friends list</div>
          <img src="/contact.png" alt="" />
        </NewConversationIllustration>
      )

      if (!sendingNewConversation) {
        topbar = (
          <TopNav title={conversationTitle}
                  toggleInfoSidebar={showConversationSidebar}
                  onSignOut={onSignOut}>
            <AddUserToChat recipients={newMessageRecipients}
                        onChange={onSetNewMessageRecipients} />
          </TopNav>
        )
      }
    }

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
              <ReactPlaceholder customPlaceholder={placeholder}
                                showLoadingAnimation={true}
                                ready={!loadingConversation}>
                <MessagesContainer ref={this.setMessagesList}>
                  {messageContents}
                </MessagesContainer>
              </ReactPlaceholder>
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
  identity: PropTypes.object.isRequired,
  composing: PropTypes.bool,
  conversation: PropTypes.object,
  contacts: PropTypes.object.isRequired,
  fileContents: PropTypes.object.isRequired,
  newMessageRecipients: PropTypes.arrayOf(PropTypes.object).isRequired,
  sendingNewConversation: PropTypes.bool,
  messagePollInterval: PropTypes.number,
  onMarkConversationAsRead: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onPollMessages: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  sendBtc: PropTypes.func.isRequired,
  setExpirationDate: PropTypes.func.isRequired,
  onSetNewMessageRecipients: PropTypes.func.isRequired,
  sidebar: PropTypes.element.isRequired,
  infoSidebar: PropTypes.element.isRequired,
  emojiPicker: PropTypes.element.isRequired,
  conversationTitle: PropTypes.string.isRequired,
  onToggleEmojiPicker: PropTypes.func.isRequired,
  messageInputValue: PropTypes.string.isRequired,
  onMessageInputChange: PropTypes.func.isRequired,
  onAcceptConversation: PropTypes.func.isRequired,
  showConversationSidebar: PropTypes.func,
  showProfileSidebar: PropTypes.func
}
ChatView.defaultProps = {
  messagePollInterval: 5000
}
