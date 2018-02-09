import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { chain, get } from 'lodash'
import * as colors from '../colors'
import { ContentTypes, Conversation } from '../models/conversation'
import { AppView } from './AppView'
import { Message } from './Message'
import { AddUserToChat } from './AddUserToChat'
import { NewMessageInput } from './NewMessageInput'
import { Loader } from './Loader'
import { TypingIndicator } from './TypingIndicator'
import { NewConversationInvitation } from './NewConversationInvitation'
import { TopNav } from './TopNav'

const MessagesContainer = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  display: flex;
  flex-direction: column-reverse;

  &::-webkit-scrollbar-track {
    width: 3px;
    background-color: ${colors.white};
  }
`

const MessageInputContainer = styled.div``

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
      this.props.onMarkConversationAsRead()

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

  render() {
    const {
      identity,
      composing,
      conversation,
      conversationTitle,
      contacts,
      typing,
      fileContents,
      newMessageRecipients,
      sendingNewConversation,
      onSignOut,
      onPickImage,
      onTyping,
      onSetNewMessageRecipients,
      sidebar,
      emojiPicker,
      onToggleEmojiPicker,
      messageInputValue,
      onMessageInputChange,
      onAcceptConversation
    } = this.props

    let messageContents = []
    let topbar = <TopNav title={conversationTitle} onSignOut={onSignOut}/>

    if (conversation && conversation.trusted) {
      messageContents = conversation.messages.map(({ sender,
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
                   sender={contacts[sender]}
                   timestamp={sentAt}
                   contentType={type}
                   content={content}/>
        )
      })
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
      messageContents = <Loader/>;
      if (!sendingNewConversation) {
        console.log('_-------')
        topbar = <AddUserToChat recipients={newMessageRecipients}
                                onChange={onSetNewMessageRecipients} />
      }
    }

    return (
      <AppView sidebar={sidebar}
               emojiPicker={emojiPicker}
               topbar={topbar}
      >
        <MessagesContainer ref={this.setMessagesList}>
          {messageContents}
        </MessagesContainer>
        <MessageInputContainer>
          <TypingIndicator names={typing}/>
          <NewMessageInput onPickImage={onPickImage}
                           onToggleEmojiPicker={onToggleEmojiPicker}
                           placeholder="type your message"
                           value={messageInputValue}
                           onTyping={onTyping}
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
  onSetNewMessageRecipients: PropTypes.func.isRequired,
  sidebar: PropTypes.element.isRequired,
  emojiPicker: PropTypes.element.isRequired,
  conversationTitle: PropTypes.string.isRequired,
  onToggleEmojiPicker: PropTypes.func.isRequired,
  messageInputValue: PropTypes.string.isRequired,
  onMessageInputChange: PropTypes.func.isRequired,
  onAcceptConversation: PropTypes.func.isRequired
}
ChatView.defaultProps = {
  messagePollInterval: 5000
}
