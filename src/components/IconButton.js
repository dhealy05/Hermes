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

  img {
    margin-bottom: 2px;
    width: 20px;
  }
`

export const IconButton = ({ className, icon, children, ...other }) => (
  <Button className={className} {...other}>
    { children || <Icon icon={icon}/> }
  </Button>
)
