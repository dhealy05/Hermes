import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { Paper } from './Paper'

const Input = styled.input.attrs({
  type: 'text'
})`
  font-size: 1em;
  border: none;
  background-color: ${colors.white};

  &:focus {
    outline: none;
  }

  ${props => props.fullWidth && css`
    width: 100%;
  `}
`

const Outer = styled.div`
  font-size: 1em;
  margin: 0.75rem 0;

  ${props => props.fullWidth && css`
    width: 100%;
  `}
`

const Inner = styled(Paper)`
  padding: 0.5rem;

  ${props => props.fullWidth && css`
    display: flex;
    width: 100%;
  `}
`

const Label = styled.label`
  margin-bottom: 2px;
  font-size: 0.9rem;
  display: block;
`

export const TextInput = ({
  className,
  fullWidth,
  layer,
  label,
  ...other
}) => (
  <Outer className={className} fullWidth={fullWidth}>
    { label ? <Label>{label}</Label> : null }
    <Inner layer={layer} fullWidth={fullWidth}>
      <Input fullWidth={fullWidth} {...other}/>
    </Inner>
  </Outer>
)
TextInput.propTypes = {
  layer: Paper.propTypes.layer,
  fullWidth: PropTypes.bool,
  block: PropTypes.bool
}
TextInput.defaultProps = {
  layer: 1
}
