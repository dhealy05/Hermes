import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Paper } from './Paper'

const Input = styled.input.attrs({
  type: 'text'
})`
  font-size: 1em;
  border: none;

  &:focus {
    outline: none;
  }
`

const Outer = styled.div`
  font-size: 1em;
  margin: 0.75rem 0;
`

const Inner = styled(Paper)`
  padding: 0.5rem;
`

const Label = styled.label`
  margin-bottom: 2px;
  font-size: 0.9rem;
  display: block;
`

export const TextInput = ({ layer, label, ...other }) => (
  <Outer>
    { label ? <Label>{label}</Label> : null }
    <Inner layer={layer}>
      <Input {...other}/>
    </Inner>
  </Outer>
)
TextInput.propTypes = {
  layer: Paper.propTypes.layer,
  block: PropTypes.bool
}
TextInput.defaultProps = {
  layer: 1
}
