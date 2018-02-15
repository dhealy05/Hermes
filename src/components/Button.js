import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Icon } from './Icon'
import { Paper } from './Paper'

const Wrapper = styled(Paper)`
  box-shadow: none;
`

export const BaseButton = styled.button`
  display: inline-block;
  font-size: 1em;
  background: ${colors.blue};
  color: ${colors.white};
  padding: 0.5rem;
  border: 0;
  border-radius: 4px;
  min-width: 5em;
  transition: 0.1s all;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${colors.blue};
  }

  &:active {
    background-color: ${colors.blue};
  }
`

export const LinkButton = BaseButton.extend`
  text-align: inherit;
  padding: 0;
  color: ${colors.black};
  background-color: initial;
  text-decoration: underline;
  min-width: initial;

  &:active, &:hover {
    background-color: initial;
  }
`

export const Button = ({
  className,
  layer,
  linkButton,
  children,
  icon,
  ...other
}) => {
  const unstyled = !!(linkButton || icon)
  const ActualButton = unstyled ? LinkButton : BaseButton
  const contents = icon ? <Icon icon={icon}/> : children

  return (
    <Wrapper unstyled={unstyled}
           layer={layer}
           popOnHover
           className={className}>
      <ActualButton {...other}>
        {contents}
      </ActualButton>
    </Wrapper>
  )
}
Button.propTypes = {
  onClick: PropTypes.func,
  layer: PropTypes.number,
  linkButton: PropTypes.bool,
  icon: PropTypes.string
}
