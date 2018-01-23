import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Paper } from './Paper'

export const Circle = styled(Paper).attrs({
  circle: true
})`
  ${props => css`
    width: ${props.size}px;
    height: ${props.size}px;
  `}

  ${props => props.background && css`
    background-image: url('${props.background}');
    background-size: cover;
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
  size: PropTypes.number,
  onClick: PropTypes.func
}
Avatar.defaultProps = {
  size: 64,
  onClick: () => {}
}
