import React, { Component } from 'react'
import { CirclePicker } from 'react-color'
import { Game } from '.'

const colors = [
  '#16A5A5',
  '#009CE0',
  '#7B64FF',
  '#FA28FF',
  '#000000',
  '#666666',
  '#B3B3B3',
  '#9F0500',
  '#C45100',
  '#FB9E00',
  '#808900',
  '#194D33',
  '#0C797D',
  '#0062B1',
  '#653294',
  '#AB149E',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',

  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
  '#C1E1C5',
  '#BEDADC',
  '#C4DEF6',
  '#BED3F3',
  '#D4C4FB'
]

export class Login extends Component {
  constructor () {
    super()
    this.state = {
      name: '',
      color: '#000',
      launch: false
    }
  }
  handleChangeComplete = color => {
    this.setState({ color: color.hex })
  }
  handleChange = evt => {
    this.setState({ [evt.target.name]: evt.target.value })
  }
  handleSubmit = evt => {
    evt.preventDefault()
    const { name, color } = this.state
    if (name !== '') {
      this.setState({ launch: true })
      this.render()
    }
  }
  render () {
    const { color, name, launch } = this.state
    return (
      <div>
        {launch ? (
          <Game name={name} color={color} />
        ) : (
          <div className='window'>
            <div className='box'>
              <div className='designer'>
                <div className='preview'>
                  <h2>Get Ready!</h2>
                  <br />
                  <img className='player' src='./player.png' />

                  <input
                    type='text'
                    value={name}
                    name='name'
                    onChange={evt => this.handleChange(evt)}
                    placeholder='Name'
                  />
                </div>
              </div>
              <button onClick={evt => this.handleSubmit(evt)}>Launch</button>
            </div>
          </div>
        )}
      </div>
    )
  }
}
export default Login
