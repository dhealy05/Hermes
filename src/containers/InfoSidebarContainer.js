import React from 'react'
import { connect } from 'react-redux'
import { actions } from '../store'
import { SidebarContentTypes } from '../store/sidebar/contentTypes'
import { InfoSidebar } from '../components/InfoSidebar'

const PopulatedSidebar = ({
  visible,
  content = {}
}) => {
  if (!visible) {
    return null
  }

  let renderedContent = null

  switch(content.type) {
    case SidebarContentTypes.Conversation:
      renderedContent = (
        <p>
          This is a conversation. The message: {content.conversation.message}
        </p>
      )
      break
    case SidebarContentTypes.Profile:
      renderedContent = (
        <p>
          This is a profile. The thing: {content.profile.name}
        </p>
      )
      break
  }

  return (
    <InfoSidebar>
      {renderedContent}
    </InfoSidebar>
  )
}

export const InfoSidebarContainer = connect(
  state => ({
    visible: state.sidebar.visible,
    content: state.sidebar.content
  })
)(PopulatedSidebar)
