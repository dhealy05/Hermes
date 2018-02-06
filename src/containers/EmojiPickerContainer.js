import { connect } from 'react-redux'
import { actions } from '../store'
import { EmojiPicker } from '../components/EmojiPicker'

export const EmojiPickerContainer = connect(
  state => ({
    active: state.emoji.emojiPickerActive
  }),
  dispatch => ({
    onPickEmoji: emoji => dispatch(actions.emoji.pickEmoji(emoji)),
    onDeactivate: () => dispatch(actions.emoji.setPickerActive(false))
  })
)(EmojiPicker)
