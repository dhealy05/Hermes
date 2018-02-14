import React from 'react'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { Avatar } from './Avatar'
import { timeAgo } from '../services/formatTime'

const Wrapper = styled.div`
  margin: 10px;
`;

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
  margin-top: 0.5em;
  white-space: nowrap;
  color: ${colors.greyDark};
  font-size: 0.7em;
`

export const InfoSidebarConversation = ({ contacts }) => {
  return (
    <Wrapper>
      {contacts.map(contact => (
        <ListItem key={contact.id}>
          <Avatar size={48}
                  image={contact.pic}/>

          <TextContainer>
            <Title>{contact.name || contact.id}</Title>
            <Date>{ contact.lastMessageTimestamp ? `Active ${timeAgo(contact.lastMessageTimestamp)}`: 'Unknown' }</Date>
          </TextContainer>
        </ListItem>
      ))}
    </Wrapper>
  )
}
