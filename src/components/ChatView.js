import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { get } from 'lodash'
import { AppView } from './AppView'
import { Message } from './Message'
import { TextInput } from './TextInput'
import { AddUserToChat } from './AddUserToChat'

const MessagesContainer = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
`

const MessageInput = styled(TextInput).attrs({
  layer: 2
})`
  margin: 24px;
  margin-top: 0;
`

export class ChatView extends React.Component {
  state = {
    msgInput: ''
  }

  senderIdx = 1
  messagesList = null
  justReceivedNewMessage = false

  pollingTimeout = null

  componentWillMount() {
    this.pollForMessages()
  }

  componentWillUnmount() {
    this.stopPolling()
  }

  componentWillReceiveProps(next, prev) {
    const path = 'conversation.messages.length'

    if (get(next, path, 0) !== get(prev, path, 0)) {
      /*
         need to scroll to the bottom of the list when a new message is added,
         but componentWillReceiveProps is called before the new message is
         actually rendered. Mark a flag here to run the function in
         componentDidUpdate
       */
      this.justReceivedNewMessage = true
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
    if (!this.messagesList) {
      return
    }

    const node = ReactDOM.findDOMNode(this.messagesList)
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

  setMessagesList = el => this.messagesList = el

  render() {
    const {
      identity,
      composing,
      conversation,
      contacts,
      newMessageRecipients,
      onSignOut,
      onSetNewMessageRecipients,
      sidebar
    } = this.props

    let messageContents = []

    if (conversation) {
      messageContents = conversation.messages.map(({ sender, content, sentAt }, i) => (
        // TODO figure out proper way to tell if the sender is the current user
        <Message key={i}
                 direction={sender === identity.username ? 'right' : 'left'}
                 sender={contacts[sender]}
                 timestamp={sentAt}
                 content={content}/>
      ))
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
        <MessageInput fullWidth
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
  newMessageRecipients: PropTypes.arrayOf(PropTypes.object).isRequired,
  messagePollInterval: PropTypes.number,
  onSendMessage: PropTypes.func.isRequired,
  onPollMessages: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onSetNewMessageRecipients: PropTypes.func.isRequired,
  sidebar: PropTypes.element.isRequired
}
ChatView.defaultProps = {
  messagePollInterval: 5000
}
