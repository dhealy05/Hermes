import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { ContentTypes } from '../models'
import { formatTime } from '../services/formatTime'
import { Avatar } from './Avatar'

const List = styled.ul`
  font-size: 14px;
  list-style: none;
  padding: 0;
`

const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5em 1em;

  &:hover {
    cursor: pointer;
    background-color: ${colors.greyLight};
  }
`

const TextContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-left: 1em;
`

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const Title = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: font-weight 0.2s;

  ${props => props.unread && css`
    font-weight: bold;
  `}
`

const Date = styled.div`
  margin-left: 1em;
  white-space: nowrap;
  color: ${colors.greyDark};
`

const TextPreview = styled.div`
  color: ${colors.greyDark};
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const ThumbnailsList = props => {
  const items = props.thumbnails.map(t => {
    let preview = null

    if (t.trusted === false) {
      preview = <TextPreview>{t.lastSenderName} wants to connect</TextPreview>
    } else if (t.contentType === ContentTypes.Text) {
      preview = <TextPreview>{t.lastSenderName}: {t.content}</TextPreview>
    }

    return (
      <ListItem key={t.id}
                onClick={() => props.onSelectConversation(t.id)}>
        <Avatar size={48}
                image={t.pic}/>
        <TextContainer>
          <TitleContainer>
            <Title unread={!t.wasRead}>{t.title}</Title>
            <Date>{formatTime(t.timestamp)}</Date>
          </TitleContainer>
          {preview}
        </TextContainer>
      </ListItem>
    )
  })

  return (
    <List>
      {items}
    </List>
  )
}
ThumbnailsList.propTypes = {
  thumbnails: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    lastSenderName: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    trusted: PropTypes.bool
  })).isRequired,
  onSelectConversation: PropTypes.func.isRequired
}
