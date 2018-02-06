import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { omit } from 'lodash'
import * as colors from '../colors'
import { IconButton } from './IconButton'
import { Paper } from './Paper'
import { TextInput } from './TextInput'
import { EmojiPicker } from './EmojiPicker'

const Container = styled(Paper)`
  width: 100%;
`

const ButtonContainer = styled.div`
  padding: 0.5em 1em;
  color: ${colors.greyDark}
`

const Input = styled(TextInput).attrs({
  unstyled: true
})`
  margin: 0;
  margin-top: 0;
`

export class NewMessageInput extends React.Component {
  fileInputEl = null

  pickImage = () => this.fileInputEl.click()

  onFileInputChange = evt => {
    const [file] = evt.target.files

    if (!file) {
      return
    }

    this.props.onPickImage(file)
    evt.target.value = null
  }

  onTextChange = evt => {
    this.props.onTyping()

    if (this.props.onChange) {
      this.props.onChange(evt)
    }
  }

  setFileInputEl = ref => this.fileInputEl = ref

  render() {
    let {
      onToggleEmojiPicker,
      ...other
    } = this.props

    other = omit(other, 'onChange')

    return (
      <Container>
        <input type="file"
               accept="image/*"
               style={{display: 'none'}}
               onChange={this.onFileInputChange}
               ref={this.setFileInputEl}/>
        <Input fullWidth
               placeholder="type your message"
               onChange={this.onTextChange}
               {...other}/>
        <ButtonContainer>
          <IconButton icon="tag_faces"
                      onClick={onToggleEmojiPicker}/>
          <IconButton icon="insert_photo"
                      onClick={this.pickImage}/>
        </ButtonContainer>
      </Container>
    )
  }
}
NewMessageInput.propTypes = {
  onToggleEmojiPicker: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  onChange: PropTypes.func
}
