import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Sidebar } from './Sidebar'

const Layout = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  background-color: ${colors.white};
`

const MainOutletContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const MessageContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`

const MainOutlet = styled.div`
  flex-grow: 5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

export const AppView = ({
  infoSidebar,
  topbar,
  sidebar,
  emojiPicker,
  children
}) => (
  <Layout>
    {sidebar ? sidebar : <Sidebar title="hermes"/>}
    {emojiPicker ? emojiPicker : null}
    <MainOutletContainer>
      {topbar}
      <MessageContainer>
        <MainOutlet>
          {children}
        </MainOutlet>
        {infoSidebar || null}
      </MessageContainer>
    </MainOutletContainer>
  </Layout>
)

AppView.propTypes = {
  topbar: PropTypes.element,
  infoSidebar: PropTypes.element,
  sidebar: PropTypes.element,
  emojiPicker: PropTypes.element
}
