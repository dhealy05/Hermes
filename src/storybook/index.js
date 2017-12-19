import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Avatar } from '../components/Avatar'
import { Paper } from '../components/Paper'

class PaperStory extends React.Component {
  constructor() {
    super()
    this.state = {
      layer: 2
    }
  }

  nextLayer = () => {
    this.setState({
      layer: this.state.layer === Paper.MAX_LAYER
           ? 1
           : this.state.layer + 1
    })
  }

  render() {
    return (
      <div>
        <Paper onClick={this.nextLayer}
               layer={this.state.layer}
               style={{padding: '1rem', display: 'block'}}>
          <h1>Paper</h1>
          <p>
            Paper is the substance all other UI elements are built on. It's
            basically a div with a box shadow. It comes on different layers.
          </p>
          <p>
            Click this paper to cycle through the available layers! Current
            layer: {this.state.layer}
          </p>
        </Paper>
      </div>
    )
  }
}

storiesOf('Paper', module)
  .add('paper', () => <PaperStory/>)
  .add('circle', () => <Paper circle style={{padding: '1rem'}}>Hello from the circle!</Paper>)

storiesOf('People/Avatar', module)
  .add('with default image', () => (
    <Avatar onClick={action('clicked avatar')}/>
  ))
  .add('with a user\'s image', () => (
    <Avatar image="http://lorempixel.com/64/64/"
            onClick={action('clicked avatar')}/>
  ))

storiesOf('Forms/Button', module)
  .add('with text', () => (
    <button onClick={action('clicked')}>Hello</button>
  ))
  .add('with emojis', () => (
    <button onClick={action('clicked 😎')}>👻</button>
  ))

storiesOf('Forms/Text Input', module)
  .add('with placeholder', () => (
    <input type="text"/>
  ))
  .add('multiline', () => (
    <input type="text"/>
  ))
