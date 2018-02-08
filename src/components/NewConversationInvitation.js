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

  return <Text>{names} {verb} to start a conversation.</Text>
}

export const NewConversationInvitation = ({
  others,
  onAccept = () => {},
  onDecline = () => {}
}) => (
  <div>
    {formatDescription(others)}
    <ButtonsContainer>
    <Button onClick={onDecline}>Decline</Button>
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
