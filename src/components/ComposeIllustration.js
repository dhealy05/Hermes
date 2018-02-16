import React from 'react'
import styled from 'styled-components'
import { MessagesContainerDiv } from './MessageOutlet'

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 700px;
  height: 317px;
  margin-top: -200px; /* Half the height */
  margin-left: -350px; /* Half the width */
  div {
    text-align: center;
  }
  img {
    width: 500px;
    margin: 10px 100px;
  }
`

export const ComposeIllustration = () => (
  <MessagesContainerDiv>
    <Container>
      <div>
        Say hello! Start a conversation with someone to add them to your friends list.
      </div>
      <img src="/contact.png" alt=""/>
    </Container>
  </MessagesContainerDiv>
)
