import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export const BaseButton = styled.button`
  display: inline-block;
`

export const Button = ({ onClick, children }) => (
  <BaseButton onClick={onClick}>
    {children}
  </BaseButton>
)

Button.propTypes = {
  onClick: PropTypes.func
}
