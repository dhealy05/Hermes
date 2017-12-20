import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Avatar } from '../../components/Avatar'

storiesOf('People/Avatar', module)
  .add('with default image', () => (
    <Avatar onClick={action('clicked avatar')}/>
  ))
  .add('with a user\'s image', () => (
    <Avatar image="http://lorempixel.com/64/64/"
            onClick={action('clicked avatar')}/>
  ))
