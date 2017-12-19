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

export const Avatar = props => {
  // TODO proper default image
  const image = props.image

  return (
    <Circle layer={3}
            popOnHover
            background={image}
            onClick={props.onClick}/>
  )
}
Avatar.propTypes = {
  image: PropTypes.string,
  onClick: PropTypes.func
}
Avatar.defaultProps = {
  onClick: () => {}
}
