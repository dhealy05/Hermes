import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

export const FileMessage = styled.img`
  max-width: 66%;
  padding: 2px;
  margin-top: 3px;
  border-radius: 2px 8px 8px 2px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.2) 0 1px 1px 0;
  float: left;

  ${props => ((props.direction === 'right') && css`
border-radius: 8px 2px 2px 8px;
float: right;
`)}
`
