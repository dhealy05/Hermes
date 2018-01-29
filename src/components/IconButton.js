import React from 'react'
import styled from 'styled-components'
import { Icon } from './Icon'

const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;

  &:focus {
    outline: none;
  }
`

export const IconButton = ({ className, icon, ...other }) => (
  <Button className={className} {...other}>
    <Icon icon={icon}/>
  </Button>
)
