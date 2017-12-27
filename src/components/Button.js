import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import * as colors from '../colors'
import { Icon } from './Icon'
import { Paper } from './Paper'

export const BaseButton = styled.button`
  display: inline-block;
  font-size: 1em;
  background: ${colors.brand.light};
  color: ${colors.white};
  padding: 0.5rem;
  border: 0;
  min-width: 5em;
  transition: 0.1s all;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${colors.brand.medium};
  }

  &:active {
    background-color: ${colors.brand.dark};
  }

  ${props => props.icon && css`
    min-width: initial;
  `}
`

export const LinkButton = BaseButton.extend`
  text-align: inherit;
  padding: 0;
  color: ${colors.black};
  background-color: initial;
  text-decoration: underline;

  &:active, &:hover {
    background-color: initial;
  }
`

export const Button = ({
  layer,
  linkButton,
  children,
  icon,
  ...other
}) => {
  const ActualButton = linkButton ? LinkButton : BaseButton
  const contents = icon ? <Icon icon={icon}/> : children

  return (
    <Paper unstyled={linkButton}
           layer={layer}
           popOnHover>
      <ActualButton icon={icon}
                    {...other}>
        {contents}
      </ActualButton>
    </Paper>
  )
}
Button.propTypes = {
  onClick: PropTypes.func,
  layer: PropTypes.number,
  linkButton: PropTypes.bool,
  icon: PropTypes.string
}
