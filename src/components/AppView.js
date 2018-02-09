import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import * as colors from '../colors'
import { Sidebar } from './Sidebar'
import { InfoSidebar } from './InfoSidebar'
import { TopNav } from './TopNav'

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
  onSignOut,
  toggleInfoSidebar,
  showingInfoSidebar,
  sidebar,
  emojiPicker,
  title,
  children
}) => (
  <Layout>
    {sidebar ? sidebar : <Sidebar title="hermes"/>}
    {emojiPicker ? emojiPicker : null}
    <MainOutletContainer>
      <TopNav title={title} onSignOut={onSignOut} showingInfoSidebar={showingInfoSidebar} toggleInfoSidebar={toggleInfoSidebar} />
      <MessageContainer>
        <MainOutlet>
          {children}
        </MainOutlet>
        {showingInfoSidebar && <InfoSidebar />}
      </MessageContainer>
    </MainOutletContainer>
  </Layout>
)

AppView.propTypes = {
  title: PropTypes.string,
  sidebar: PropTypes.element,
  emojiPicker: PropTypes.element,
  onSignOut: PropTypes.func,
  showingInfoSidebar: PropTypes.bool,
  toggleInfoSidebar: PropTypes.func,
}
