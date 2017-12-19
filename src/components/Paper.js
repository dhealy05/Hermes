import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const layersToBlurSize = {
  1: 2,
  2: 5,
  3: 8,
  4: 13 // extra layer for popOnHover
}

export const Paper = styled.div`
  display: inline-block;
  transition: 0.2s all;

  ${props => props.layer && css`
    box-shadow: rgba(0, 0, 0, 0.4) 0 1px ${layersToBlurSize[props.layer]}px 0;
  `}

  ${props => props.popOnHover && css`
    &:hover {
      transform: translateY(-1px);
      box-shadow: rgba(0, 0, 0, 0.4) 0 1px ${layersToBlurSize[props.layer + 1]}px 0;
    }
  `}

  ${props => props.circle && css`
    border-radius: 50%;
  `}
`
Paper.propTypes = {
  layer: PropTypes.oneOf([1, 2, 3]),
  popOnHover: PropTypes.bool,
  circle: PropTypes.bool
}
Paper.defaultProps = {
  layer: 2,
  circle: false
}
Paper.MAX_LAYER = 3
