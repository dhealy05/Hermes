import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { Avatar } from './Avatar'

const OuterContainer = styled.div`
  display: flex;
  margin-bottom: 14px;

  ${props => ((props.direction === 'right') && css`
flex-direction: row-reverse;

                     & ${SenderAvatar} {
                       margin-right: 0;
                       margin-left: 24px;
                     }

                     & ${SenderDetails} {
                       text-align: right;
                     }
`)}
`

const SenderAvatar = styled(Avatar)`
  margin-right: 24px;
`

const MessageText = styled.div`
  max-width: 66%;
`

const SenderDetails = styled.div`
  margin-bottom: 4px;
`

const SenderName = styled.span`
  font-weight: bold;
`

const Timestamp = styled.span`
  margin-left: 9px;
  color: ${colors.border};
`

const Paragraph = styled.div`
  text-align: justify;
`

const formatTime = date => {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'

  if (hours > 12) {
    hours -= 12
  }

  return `${hours}:${minutes}${period}`
}

export const Message = ({ direction = 'left', sender, timestamp, paragraphs }) => {
  const time = formatTime(timestamp)

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image={sender.avatar && sender.avatar.url}/>
      <MessageText>
        <SenderDetails>
          <SenderName>{sender.displayName}</SenderName>
          <Timestamp>{time}</Timestamp>
        </SenderDetails>
        {paragraphs.map((p, i) => (
          <Paragraph key={i}>{p.text}</Paragraph>
        ))}
      </MessageText>
    </OuterContainer>
  )
}
Message.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']),
  sender: PropTypes.shape({
    isIdentity: PropTypes.bool,
    avatar: PropTypes.shape({ url: PropTypes.string.isRequired }),
    displayName: PropTypes.string.isRequired
  }).isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired
  }))
}
Message.defaultProps = {
  direction: 'left'
}
