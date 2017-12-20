import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Paper } from './Paper'

export const Circle = styled(Paper).attrs({
  circle: true
})`
  width: 64px;
  height: 64px;

  ${props => props.background && css`
    background-image: url('${props.background}');
  `}
`

// TODO default image
export const Avatar = ({ image, onClick, ...other }) => (
  <Circle layer={3}
          popOnHover
          background={image}
          onClick={onClick}
          {...other}/>
)
Avatar.propTypes = {
  image: PropTypes.string,
  onClick: PropTypes.func
}
Avatar.defaultProps = {
  onClick: () => {}
}
