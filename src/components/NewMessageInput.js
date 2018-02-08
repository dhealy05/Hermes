import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { omit } from 'lodash'
import * as colors from '../colors'
import { IconButton } from './IconButton'
import { Paper } from './Paper'
import { TextInput } from './TextInput'
import { EmojiPicker } from './EmojiPicker'
import { SendBTCModal } from './SendBTCModal'

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
  state = {
    sendBtcModalOpen: false,
    sendBtcValue: 0.00012
  }

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

  openBtcModal = () => this.setState({ sendBtcModalOpen: true })

  closeBtcModal = () => this.setState({ sendBtcModalOpen: false })

  onBtcValueChange = evt => this.setState({ sendBtcValue: evt.target.value })

  onSendBtc = amt => {
    alert(`sending ${amt} BTC now! 💸`)
    this.closeBtcModal()
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
          <IconButton icon="attach_money"
                      onClick={this.openBtcModal}/>
        </ButtonContainer>
        <SendBTCModal isOpen={this.state.sendBtcModalOpen}
                      onRequestClose={this.closeBtcModal}
                      btcToSend={this.state.sendBtcValue}
                      onBtcValueChange={this.onBtcValueChange}
                      onSend={this.onSendBtc}/>
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
