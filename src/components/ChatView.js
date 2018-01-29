import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { get } from 'lodash'
import * as colors from '../colors'
import { ContentTypes, Conversation } from '../models/conversation'
import { AppView } from './AppView'
import { Message } from './Message'
import { AddUserToChat } from './AddUserToChat'
import { NewMessageInput } from './NewMessageInput'

const MessagesContainer = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;

  &::-webkit-scrollbar-track {
    width: 3px;
    background-color: ${colors.white};
  }
`

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

  onMsgInputChange = evt => {
    this.setState({ msgInput: evt.target.value })
  }

  onMsgInputKeyUp = evt => {
    if (evt.keyCode === 13) {
      this.props.onSendMessage(this.state.msgInput)
      this.setState({
        msgInput: ''
      })
    }
  }

  setMessagesList = el => this.messagesListEl = el

  render() {
    const {
      identity,
      composing,
      conversation,
      contacts,
      fileContents,
      newMessageRecipients,
      onSignOut,
      onPickImage,
      onSetNewMessageRecipients,
      sidebar
    } = this.props

    let messageContents = []

    if (conversation) {
      messageContents = conversation.messages.map(({ sender, content: rawContent, type, sentAt }, i) => {
        let content = rawContent

        if (type === ContentTypes.Image) {
          content = fileContents[rawContent]
        }

        return (
          <Message key={i}
                   direction={sender === identity.username ? 'right' : 'left'}
                   sender={contacts[sender]}
                   timestamp={sentAt}
                   contentType={type}
                   content={content}/>
        )
      })
    } else if (composing) {
      messageContents = (
        <AddUserToChat recipients={newMessageRecipients}
                       onChange={onSetNewMessageRecipients}/>
      )
    }

    return (
      <AppView onSignOut={onSignOut}
               sidebar={sidebar}>
        <MessagesContainer ref={this.setMessagesList}>
          {messageContents}
        </MessagesContainer>
        <NewMessageInput onPickImage={onPickImage}
                         placeholder="type your message"
                         value={this.state.msgInput}
                         onChange={this.onMsgInputChange}
                         onKeyUp={this.onMsgInputKeyUp}/>
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
  messagePollInterval: PropTypes.number,
  onMarkConversationAsRead: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onPollMessages: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onSetNewMessageRecipients: PropTypes.func.isRequired,
  sidebar: PropTypes.element.isRequired
}
ChatView.defaultProps = {
  messagePollInterval: 5000
}
