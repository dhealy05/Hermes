import React from 'react'
import { Route } from 'react-router'
import { Home } from './Home'

export const Routes = () => (
  <div>
    <Route exact path="/" component={Home}/>
  </div>
)
