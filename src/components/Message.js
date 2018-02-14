import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { ContentTypes } from '../models'
import { Loader } from './Loader'

const Content = styled.div`
  text-align: justify;
  padding: 0.7em;
  margin-top: 3px;
  background-color: ${colors.blue};
  color: white;
  font-size: 14px;
  border-radius: 0 6px 6px 0;

  ${props => ((props.direction === 'right') && css`
    border-radius: 6px 0 0 6px;
    background-color: ${colors.greyLight};
    color: black;
  `)}
`

const ImageMessage = styled.img`
  max-width: 66%;
  padding: 2px;
  margin-top: 3px;
  border-radius: 2px 8px 8px 2px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.2) 0 1px 1px 0;
  float: left;

  ${props => ((props.direction === 'right') && css`
    border-radius: 8px 2px 2px 8px;
    float: right;
  `)}
`

const PaidMessageValue = Content.extend`
`

const MessageContent = ({ contentType, content, direction }) => {
  if (contentType === ContentTypes.Text) {
    return <Content direction={direction}>{content}</Content>
  }

  if (contentType === ContentTypes.Image && (!content || content.loading)) {
    return <Loader inline/>
  } else if (contentType === ContentTypes.Image) {
    return <ImageMessage direction={direction} src={content.data}/>
  }

  return null
}
MessageContent.propTypes = {
  contentType: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(['left', 'right']),
}

export const Message = ({
  direction = 'left',
  content,
  contentType,
  paymentStatus,
  value
}) => {
  return (
    <div>
      { paymentStatus === 'unpaid'
      ? <MessageContent contentType={contentType}
                        content={content}
                        direction={direction}/>
      : <PaidMessageValue>{value} BTC sent</PaidMessageValue> }
    </div>
  )
}
Message.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']),
  contentType: MessageContent.propTypes.contentType,
  content: MessageContent.propTypes.content,
  paymentStatus: PropTypes.oneOf(['unpaid', 'paid']).isRequired,
  value: PropTypes.string.isRequired
}
Message.defaultProps = {
  direction: 'left'
}
