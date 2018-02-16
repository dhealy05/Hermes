import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Dropzone from 'react-dropzone'
import * as colors from '../colors'
import { AppView } from './AppView'

const DropzoneContainer = styled(Dropzone)`
  width: 100%;
  height: 100%;
  border: none;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

const DropzoneLayer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: auto;
  ${props => props.isDragActive && css`
border: 4px dashed ${colors.blue};
`}
`

export class ChatView extends React.Component {
  onDrop = acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      this.props.onPickImage(acceptedFiles[0]);
    }
  }

  render() {
    const {
      sidebar,
      infoSidebar,
      emojiPicker,
      topbar,
      messageOutlet,
      sendMessageInput
    } = this.props

    return (
      <AppView sidebar={sidebar}
               infoSidebar={infoSidebar}
               emojiPicker={emojiPicker}
               topbar={topbar}>
        <DropzoneContainer accept="image/gif,image/jpeg,image/png"
                           onDrop={this.onDrop}
                           disableClick
                           multiple={false}>
          {({ isDragActive, isDragReject }) => (
            <DropzoneLayer isDragActive={isDragActive} isDragRejected={isDragReject}>
              {messageOutlet}
            </DropzoneLayer>
          )}
        </DropzoneContainer>
        {sendMessageInput}
      </AppView>
    )
  }
}
ChatView.propTypes = {
  sidebar: PropTypes.element,
  infoSidebar: PropTypes.element,
  emojiPicker: PropTypes.element,
  topbar: PropTypes.element,
  messageOutlet: PropTypes.element,
  sendMessageInput: PropTypes.element
}
