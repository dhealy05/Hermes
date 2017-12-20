import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Paper } from './Paper'

export const BaseButton = styled.button`
  display: inline-block;
  font-size: 1em;
  background: white;
  padding: 0.5rem;
  border: 0;
  min-width: 5em;
  transition: 0.1s all;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:active {
    background-color: #fafafa;
  }
`

export const LinkButton = BaseButton.extend`
  text-decoration: underline;

  &:active {
    background-color: initial;
  }
`

export const Button = ({
  className,
  layer,
  onClick,
  linkButton,
  children
}) => {
  const ActualButton = linkButton ? LinkButton : BaseButton

  return (
    <Paper unstyled={linkButton}
           layer={layer}
           popOnHover>
      <ActualButton className={className}
                    onClick={onClick}>
        {children}
      </ActualButton>
    </Paper>
  )
}
Button.propTypes = {
  onClick: PropTypes.func,
  layer: PropTypes.number,
  linkButton: PropTypes.bool
}
