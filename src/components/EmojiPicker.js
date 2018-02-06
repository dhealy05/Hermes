import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

const ClickShield = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`

const pickerStyle = {
  position: 'absolute',
  right: '1em',
  bottom: '1em',
  zIndex: 9999
}

export const EmojiPicker = ({
  active = true,
  onPickEmoji = () => {},
  onDeactivate,
  className,
  ...other
}) => {
  if (!active) {
    return null
  }

  return (
    <div>
      <ClickShield onClick={onDeactivate}/>
      <Picker style={pickerStyle}
              onClick={onPickEmoji}
              {...other}/>
    </div>
  )
}
EmojiPicker.propTypes = {
  active: PropTypes.bool,
  onDeactivate: PropTypes.func,
  onPickEmoji: PropTypes.func
}
