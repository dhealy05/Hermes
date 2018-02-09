import React from 'react'
import { connect } from 'react-redux'
import { actions } from '../store'
import { InfoSidebar } from '../components/InfoSidebar'

const PopulatedSidebar = ({
  visible,
  sidebarContent = {}
}) => {
  if (!visible) {
    return null
  }

  let content = null

  return (
    <InfoSidebar>
      {content}
    </InfoSidebar>
  )
}

export const InfoSidebarContainer = connect(
  state => ({
    visible: state.sidebar.visible
  })
)(PopulatedSidebar)
