import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { IconButton } from './IconButton'
import { Paper } from './Paper'
import { TextInput } from './TextInput'

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

  setFileInputEl = ref => this.fileInputEl = ref

  render() {
    const {
      ...other
    } = this.props

    return (
      <Container>
        <input type="file"
               accept="image/*"
               style={{display: 'none'}}
               onChange={this.onFileInputChange}
               ref={this.setFileInputEl}/>
        <Input fullWidth
               placeholder="type your message"
               {...other}/>
        <ButtonContainer>
          <IconButton icon="insert_photo"
                      onClick={this.pickImage}/>
        </ButtonContainer>
      </Container>
    )
  }
}
NewMessageInput.propTypes = {
  onPickImage: PropTypes.func.isRequired
}
