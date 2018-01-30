import React from 'react'
import styled from 'styled-components'

export const SystemMessage = ({ timestamp, content, contentType }) => (
  <div>
    SYSTEM: {content}
  </div>
)
