import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import moment from 'moment'
import * as colors from '../colors'
import { Avatar } from './Avatar'

const OuterContainer = styled.div`
  display: flex;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

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

const formatTime = isostring => moment(isostring).format('h:mma')

export const Message = ({ direction = 'left', sender, timestamp, content }) => {
  const time = formatTime(timestamp)

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image="https://lorempixel.com/64/64"/>
      <MessageText>
        <SenderDetails>
          <SenderName>{sender.name}</SenderName>
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
  timestamp: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired
}
Message.defaultProps = {
  direction: 'left'
}
