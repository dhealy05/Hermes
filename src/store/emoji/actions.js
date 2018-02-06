import { payloadAction } from '../util'

export const SET_EMOJI_PICKER_ACTIVE = 'ACTIVATE_EMOJI_PICKER'
export const setPickerActive = payloadAction(SET_EMOJI_PICKER_ACTIVE)

export const PICK_EMOJI = 'PICK_EMOJI'
export const pickEmoji = payloadAction(PICK_EMOJI)
