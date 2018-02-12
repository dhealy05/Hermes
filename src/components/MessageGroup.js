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
  margin-right: 12px;
  background-color: ${colors.white};
`

const MessageText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 66%;

  ${props => ((props.direction === 'right') && css`
    align-items: flex-end;
  `)}
`

const SenderDetails = styled.div`
  font-size: 10px;
  margin-bottom: 4px;
`

export const MessageGroup = ({
  direction = 'left',
  sender,
  onShowSenderProfile,
  timestamp,
  children
}) => {
  const name = (sender && sender.name) || (sender && sender.id) || 'Anonymous'
  const time = formatTime(timestamp)
  const avatar = sender && sender.pic

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image={avatar}
                    onClick={onShowSenderProfile}
                    size={40} />
      <MessageText direction={direction}>
        <SenderDetails>{name}, {time}</SenderDetails>
        {children}
      </MessageText>
    </OuterContainer>
  )
}
MessageGroup.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']),
  sender: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  onShowSenderProfile: PropTypes.func,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment)
  ]).isRequired,
}
MessageGroup.defaultProps = {
  direction: 'left'
}
