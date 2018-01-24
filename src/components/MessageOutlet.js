import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

export const MessageOutlet = ({ messages, contacts }) => {
  return (
    <div>
      whops
    </div>
  )
}
MessageOutlet.propTypes = {
  contacts: PropTypes.objectOf(PropTypes.object),
  messages: PropTypes.arrayOf(PropTypes.object)
}

function* messagesByTime(initialMessages) {
  const messages = [...initialMessages]
  let previousTimestamp = null

  while (messages.length) {
    const now = moment()
    const msg = messages.pop
    const timestamp = moment(msg.sentAt)

    if (!previousTimestamp) {
      yield msg
    } else if (timestamp.isBefore(previousTimestamp, 'days')) {
      yield {boundary: true}
      yield msg
    }

    previousTimestamp = timestamp
  }
}

const chunkByTime = messages => {
  const now = moment()
  let previous = moment(messages[messages.length -1].sentAt)
  let chunks = []
  let currentChunk = []

  for (let i = messages.length - 1; i > 0; i--) {
    const message = messages[i]
    const timestamp = moment(messages.sentAt)

    previous = timestamp
  }

  return chunks
}
