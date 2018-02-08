import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { map } from 'lodash'
import { formatListOfNames } from '../util'
import { Button } from './Button'

const Text = styled.p`
  text-align: center;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 2em 20%;
`

const formatDescription = others => {
  const names = formatListOfNames(map(others, 'name'))
  const verb = others.length === 1
             ? 'wants'
             : 'want'

  return <Text>
    {names} {verb} to start a conversation. Respond or click 'accept' to connect
    with them.
  </Text>
}

export const NewConversationInvitation = ({
  others,
  onAccept = () => {},
}) => (
  <div>
    {formatDescription(others)}
    <ButtonsContainer>
    <Button onClick={onAccept}>Accept</Button>
    </ButtonsContainer>
  </div>
)
NewConversationInvitation.propTypes = {
  others: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func
}
