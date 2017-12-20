import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Paper } from './Paper'

export const BaseButton = styled.button`
  display: inline-block;
  font-size: 1em;
  background: white;
  padding: 0.5rem;
  border: 1px solid #e5e5e5;
  min-width: 5em;
  transition: 0.1s all;

  &:focus {
    outline: none;
  }

  &:active {
    background-color: #fafafa;
  }
`

export const Button = ({ className, layer, onClick, children }) => (
  <Paper layer={layer} popOnHover>
    <BaseButton className={className} onClick={onClick}>
      {children}
    </BaseButton>
  </Paper>
)
Button.propTypes = {
  onClick: PropTypes.func,
  layer: PropTypes.number
}
