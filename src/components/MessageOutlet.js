import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import ReactPlaceholder from 'react-placeholder'
import { MediaBlock } from 'react-placeholder/lib/placeholders';
import styled from 'styled-components'
import { get } from 'lodash'
import 'react-placeholder/lib/reactPlaceholder.css'
import { ContentTypes, Conversation } from '../models/conversation'
import * as colors from '../colors'
import { MessageGroup } from './MessageGroup'
import { Message } from './Message'

export const MessagesContainerDiv = styled.div`
  // use padding because margin cuts off shadows at the edge
  padding: 24px;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;

  &::-webkit-scrollbar-track {
    width: 3px;
    background-color: ${colors.white};
  }
`

const Placeholder = styled(ReactPlaceholder).attrs({
  customPlaceholder: (
    <MessagesContainerDiv>
      <MediaBlock color={colors.greyLight} rows={7} />
      <MediaBlock color={colors.greyLight} rows={6} />
      <MediaBlock color={colors.greyLight} rows={8} />
    </MessagesContainerDiv>
  ),
  showLoadingAnimation: true
})``

export class MessageOutlet extends React.Component {
  messagesListEl = null
  justReceivedNewMessage = false
  pollingTimeout = null

  setMessagesList = el => this.messagesListEl = el

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

  render() {
    const {
      contactsById,
      conversation,
      fileContentsById,
      showProfileSidebar,
      identity
    } = this.props

    let lastSender

    const contents = (conversation.messages || [])
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
                      sender={contactsById[sender]}
                      onShowSenderProfile={() => showProfileSidebar(sender)}
                      timestamp={sentAt}>
          { messages && messages.map(({ sender, content: rawContent, type, sentAt, ...other }, i) => {
              let content = rawContent
              if (type === ContentTypes.Image) {
                content = fileContentsById[rawContent]
              }
              return (
                <Message key={i}
                         {...other}
                         direction={sender === identity.username ? 'right' : 'left'}
                         contentType={type}
                         content={content} />
              )
          })}
        </MessageGroup>
      ))

    return (
      <Placeholder ready={!conversation.loading}>
        <MessagesContainerDiv ref={this.setMessagesList}>
          {contents}
        </MessagesContainerDiv>
      </Placeholder>
    )
  }
}
MessageOutlet.propTypes = {
  identity: PropTypes.object.isRequired,
  contactsById: PropTypes.object.isRequired,
  conversation: PropTypes.object.isRequired,
  fileContentsById: PropTypes.object.isRequired,
  showProfileSidebar: PropTypes.func.isRequired,
  onPollMessages: PropTypes.func.isRequired,
  messagePollInterval: PropTypes.number
}
MessageOutlet.defaultProps = {
  messagePollInterval: 5000
}
