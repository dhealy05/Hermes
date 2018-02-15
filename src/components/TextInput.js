import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { Paper } from './Paper'

const Input = styled.input.attrs({
  type: 'text'
})`
  background-color: white;
  font-size: 1em;
  border: 1px solid ${colors.grey};
  border-radius: 4px;
  width: 100%;
  padding: 0.5em 1em;
  flex-grow: 1;

  &:focus {
    outline: none;
  }
`

const Outer = styled.div`
  font-size: 1em;
  margin: 0.75rem 0;
`

const Inner = styled(Paper)`
  background-color: ${colors.white};
  ${props => props.fullWidth && css`
    display: flex;
    box-shadow: none;
  `}
`

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 0;
  padding: 0.5em 1em;
  color: ${colors.greyDark};
  background-color: white;
  right: 0px;
  bottom: 0px;

  button {
    width: 28px;
  }
`

const Label = styled.label`
  margin-bottom: 2px;
  font-size: 0.9rem;
  display: block;
`

export const TextInput = ({
  className,
  type = 'text',
  fullWidth,
  layer,
  label,
  unstyled,
  buttons,
  ...other
}) => (
  <Outer className={className} fullWidth={fullWidth}>
    { label ? <Label>{label}</Label> : null }
    <Inner layer={layer} fullWidth={fullWidth} unstyled={unstyled}>
      <Input type={type}
             fullWidth={fullWidth}
             {...other}/>
      { buttons
        ? <ButtonContainer>{buttons}</ButtonContainer>
        : null }
    </Inner>
  </Outer>
)
TextInput.propTypes = {
  type: PropTypes.string,
  layer: Paper.propTypes.layer,
  fullWidth: PropTypes.bool,
  block: PropTypes.bool,
  buttons: PropTypes.element
}
TextInput.defaultProps = {
  layer: 1
}
