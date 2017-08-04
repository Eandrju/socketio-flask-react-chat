import React, { Component } from 'react'
import './App.css'
import ControlBar from './components/ControlBar'
import Conversations from './components/Conversations'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      rooms: [],
      messages: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.joinRoom = this.joinRoom.bind(this)
    this.sendChat = this.sendChat.bind(this)
  }

  handleChange (event) {
    const {name, value} = event.target
    this.setState({ [name]: value })
  }

  componentDidMount () {
    socket.on('connect', () => {
      console.log('Client connected!')
    })
    socket.on('message', (data) => {
      console.log(data.message)
    })
    socket.on('chat_received', (data) => {
      console.log(data)
      this.setState({ messages: [...this.state.messages, data] })
    })
  }

  joinRoom (username, partner) {
    this.setState({username: username})
    const room = [username, partner].sort().join('|')
    socket.emit(
      'join_room',
      { username, room },
      () => this.setState({rooms: [...this.state.rooms, room]})
    )
  }

  sendChat (message, room) {
    socket.emit(
      'chat_sent',
      {
        room,
        from: this.state.username,
        body: message,
        timeStamp: Date.now()
      }
    )
  }

  render () {
    const {username, rooms, messages} = this.state
    return (
      <div className='App'>
        <h1>Chat Server</h1>
        <ControlBar joinRoom={this.joinRoom} />
        <Conversations
          rooms={rooms}
          messages={messages}
          username={username}
          sendChat={this.sendChat} />
      </div>
    )
  }
}

export default App
