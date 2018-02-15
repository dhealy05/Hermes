import React, { Component } from 'react'
import styled from 'styled-components'
import { TextInput } from './TextInput'

const SearchInputWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`

const SearchInput = styled(TextInput)`
  margin: 6px;
`

export class Search extends Component {
  render() {
    return (
      <SearchInputWrapper>
        <SearchInput
          fullWidth
          placeholder="Search Conversations"
          {...this.props}
        />
      </SearchInputWrapper>
    )
  }
}
