import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { omit } from 'lodash'
import moment from 'moment'
import * as colors from '../colors'
import { IconButton } from './IconButton'
import { TextInput } from './TextInput'
import { SendBTCModal } from './SendBTCModal'
import { ExpiringMessageModal } from './ExpiringMessageModal'

const Container = styled.div`
  width: 100%;
  position: relative;
`

const Input = styled(TextInput).attrs({
  unstyled: true
})`
  margin: 0;
  margin-top: 0;
  border: 2px solid ${colors.grey};
  border-radius: 5px;

  input {
    border: none;
    padding: 0.7em 1em;
  }
`

export class NewMessageInput extends React.Component {
  state = {
    sendBtcModalOpen: false,
    sendExpiringMessageModalOpen: false,
    sendBtcValue: 0.1,
    numberOfHours: 1
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
    //alert(`sending ${amt} BTC now! 💸`)
    this.props.sendBtc(amt)
    this.closeBtcModal()
  }

  onSetHours = evt => this.setState({ numberOfHours: evt.target.value })

  setExpirationDate = num => {
    const expirationDate = moment().add(num, 'hours')
    //expirationDate.setMinutes(expirationDate.getMinutes() + num);
    this.props.setExpirationDate(expirationDate.toISOString())
    this.closeExpiringMessageModal()
  }

  setFileInputEl = ref => this.fileInputEl = ref

  openExpiringMessageModal = () => this.setState({ sendExpiringMessageModalOpen: true })

  closeExpiringMessageModal = () => this.setState({ sendExpiringMessageModalOpen: false })

  render() {
    let {
      onToggleEmojiPicker,
      ...other
    } = this.props

    other = omit(other, 'onChange')

    const inputButtons = <React.Fragment>
      <IconButton icon="tag_faces"
                  onClick={onToggleEmojiPicker}/>
      <IconButton icon="insert_photo"
                  onClick={this.pickImage}/>
      <IconButton onClick={this.openBtcModal}>
        <img src="/Bitcoin.svg" alt="bitcoins" />
      </IconButton>
      <IconButton icon="timer"
                  onClick={this.openExpiringMessageModal}/>
    </React.Fragment>

    return (
      <Container>
        <input type="file"
               accept="image/*"
               style={{display: 'none'}}
               onChange={this.onFileInputChange}
               ref={this.setFileInputEl}/>
        <Input fullWidth
               placeholder="Type your message"
               onChange={this.onTextChange}
               buttons={inputButtons}
               {...other}/>
        <SendBTCModal isOpen={this.state.sendBtcModalOpen}
                      onRequestClose={this.closeBtcModal}
                      btcToSend={this.state.sendBtcValue}
                      onBtcValueChange={this.onBtcValueChange}
                      onSend={this.onSendBtc}/>
        <ExpiringMessageModal isOpen={this.state.sendExpiringMessageModalOpen}
                      onRequestClose={this.closeExpiringMessageModal}
                      onSetHours={this.onSetHours}
                      numberOfHours={this.state.numberOfHours}
                      setExpirationDate={this.setExpirationDate}/>
      </Container>
    )
  }
}
NewMessageInput.propTypes = {
  onToggleEmojiPicker: PropTypes.func.isRequired,
  onPickImage: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  sendBtc: PropTypes.func.isRequired,
  setExpirationDate: PropTypes.func.isRequired,
  onChange: PropTypes.func
}
