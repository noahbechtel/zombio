import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Route } from 'react-router-dom'
import { Game } from './components'

/**
 * COMPONENT
 */
class Routes extends Component {
  render () {
    return (
      <div>
        <Route path='/' component={Game} />
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {}
}

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState)(Routes))
