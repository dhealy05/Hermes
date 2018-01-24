import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import moment from 'moment'
import * as colors from '../colors'
import { formatTime } from '../services/formatTime'
import { Avatar } from './Avatar'

const OuterContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-top: 14px;

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
  color: ${colors.greyDark};
`

const Content = styled.div`
  text-align: justify;
`

export const Message = ({ direction = 'left', sender, timestamp, content }) => {
  const time = formatTime(timestamp)
  const avatar = sender && sender.pic
  const name = (sender && sender.name) || 'anon'

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image={avatar}/>
      <MessageText>
        <SenderDetails>
          <SenderName>{name}</SenderName>
          <Timestamp>{time}</Timestamp>
        </SenderDetails>
        <Content>{content}</Content>
      </MessageText>
    </OuterContainer>
  )
}
Message.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']),
  sender: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment)
  ]).isRequired,
  content: PropTypes.string.isRequired
}
Message.defaultProps = {
  direction: 'left'
}
