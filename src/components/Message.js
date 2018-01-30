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

const MessageContent = ({ contentType, content }) => {
  if (contentType === ContentTypes.Text) {
    return <Content>{content}</Content>
  }

  if (contentType === ContentTypes.Image && (!content || content.loading)) {
    return <Loader/>
  } else if (contentType === ContentTypes.Image) {
    return <img src={content.data}/>
  }

  return null
}
MessageContent.propTypes = {
  contentType: PropTypes.any.isRequired,
  content: PropTypes.string.isRequired
}

export const Message = ({
  direction = 'left',
  sender,
  timestamp,
  content,
  contentType
}) => {
  const time = formatTime(timestamp)
  const avatar = sender && sender.pic
  const name = (sender && sender.name) || (sender && sender.id) || 'Anonymous'

  return (
    <OuterContainer direction={direction}>
      <SenderAvatar image={avatar}/>
      <MessageText>
        <SenderDetails>
          <SenderName>{name}</SenderName>
          <Timestamp>{time}</Timestamp>
        </SenderDetails>
        <MessageContent contentType={contentType} content={content}/>
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
  contentType: MessageContent.propTypes.contentType,
  content: MessageContent.propTypes.content
}
Message.defaultProps = {
  direction: 'left'
}
