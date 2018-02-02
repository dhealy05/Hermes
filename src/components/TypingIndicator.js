import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { formatListOfNames } from '../util'

const Container = styled.div`
  color: ${colors.greyDark};
  font-size: 12px;
  padding: 0.5rem 1rem;
`

export const TypingIndicator = ({ names }) => {
  if (names.length === 0) {
    return null
  }

  const verb = names.length === 1
             ? 'is'
             : 'are'

  return (
    <Container>
      {formatListOfNames(names)} {verb} typing...
    </Container>
  )
}
TypingIndicator.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired
}
