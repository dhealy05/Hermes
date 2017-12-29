import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment'
import * as faker from 'faker'
import { get } from 'lodash'
import { AppView } from './AppView'
import { Message } from './Message'
import { TextInput } from './TextInput'

const MessagesContainer = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  overflow-y: auto;
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

  componentWillReceiveProps(next, prev) {
    if (get(next, 'messages.length', 0) !== get(prev, 'messages.length', 0)) {
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

  scrollToBottom = () => {
    if (!this.messagesList) {
      return
    }

    const node = ReactDOM.findDOMNode(this.messagesList)
    node.scrollTop = node.scrollHeight
  }

  recvFakeMessage = () => {
    this.props.onRecvMessage({
      sender: {
        displayName: faker.name.findName(),
        avatar: {
          url: `https://lorempixel.com/${65 + this.senderIdx}/${65 + this.senderIdx}`
        }
      },
      timestamp: moment().toISOString(),
      text: faker.lorem.paragraph()
    })

    this.senderIdx++
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

  renderSidebar() {
    return (
      <p>
        hello from the other side
      </p>
    )
  }

  render() {
    const { messages, onSignOut } = this.props

    const messageEls = messages.map(({ text, sender, ...msg }, i) => (
      <Message key={i}
               direction={sender.isCurrentUser ? 'right' : 'left'}
               sender={sender}
               paragraphs={[{ text }]}
               {...msg}/>
    ))

    return (
      <AppView onSignOut={onSignOut}
               sidebarContent={this.renderSidebar()}>
        <MessagesContainer ref={this.setMessagesList}>
          {messageEls}
        </MessagesContainer>
        <MessageInput fullWidth
                      placeholder="type your message"
                      style={{width: '100%'}}
                      value={this.state.msgInput}
                      onChange={this.onMsgInputChange}
                      onKeyUp={this.onMsgInputKeyUp}/>
      </AppView>
    )
  }
}
ChatView.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    sender: PropTypes.shape({
      isCurrentUser: PropTypes.bool,
      avatar: PropTypes.shape({ url: PropTypes.string.isRequired }),
      displayName: PropTypes.string.isRequired
    }).isRequired,
    timestamp: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })),
  onRecvMessage: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired
}
