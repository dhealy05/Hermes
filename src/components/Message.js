import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import moment from 'moment'
import * as colors from '../colors'
import { ContentTypes } from '../models'
import { formatTime } from '../services/formatTime'
import { Avatar } from './Avatar'
import { Loader } from './Loader'

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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 66%;

  ${props => ((props.direction === 'right') && css`
    align-items: flex-end;
  `)}
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

const ImageMessage = styled.img`
  max-width: 66%;
`

const PaidMessageValue = styled.div`
  background-color: ${colors.greyLight};
  font-size: 14px;
  padding: 0.5em;
`

const MessageContent = ({ contentType, content }) => {
  if (contentType === ContentTypes.Text) {
    return <Content>{content}</Content>
  }

  if (contentType === ContentTypes.Image && (!content || content.loading)) {
    return <Loader/>
  } else if (contentType === ContentTypes.Image) {
    return <ImageMessage src={content.data}/>
  }

  return null
}
MessageContent.propTypes = {
  contentType: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired
}

export const Message = ({
  direction = 'left',
  sender,
  onShowSenderProfile,
  timestamp,
  content,
  contentType,
  paymentStatus,
  value
}) => {
  const time = formatTime(timestamp)
  const avatar = sender && sender.pic
  const name = (sender && sender.name) || (sender && sender.id) || 'Anonymous'

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image={avatar}
                    onClick={onShowSenderProfile}/>
      <MessageText direction={direction}>
        <SenderDetails>
          <SenderName>{name}</SenderName>
          <Timestamp>{time}</Timestamp>
        </SenderDetails>
        <MessageContent contentType={contentType} content={content}/>
        { paymentStatus !== 'unpaid'
          ? <PaidMessageValue>{value} BTC sent</PaidMessageValue>
          : null }
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
  onShowSenderProfile: PropTypes.func,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment)
  ]).isRequired,
  contentType: MessageContent.propTypes.contentType,
  content: MessageContent.propTypes.content,
  paymentStatus: PropTypes.oneOf(['unpaid', 'paid']).isRequired,
  value: PropTypes.string.isRequired
}
Message.defaultProps = {
  direction: 'left'
}
