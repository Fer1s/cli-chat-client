const blessed = require('blessed')
const io = require('socket.io-client')

const wsAddress = require('./server.json').webAddress || 'http://localhost:8081';

const socket = io(wsAddress)

const chatRoom = require('./chatRoom')

const screen = blessed.screen({
   smartCSR: true,
   title: 'FerisTech chat. 🚀',
})

const usernameBox = blessed.box({
   label: ' Please input your username ',
   top: 'center',
   left: 'center',
   width: '50%',
   height: 3,
   border: {
      type: 'line',
   },
})
const usernameInput = blessed.textbox({
   parent: usernameBox,
   inputOnFocus: true,
})

const roomNameBox = blessed.box({
   label: ' Please input your room name ',
   top: 'center',
   left: 'center',
   width: '50%',
   height: 3,
   border: {
      type: 'line',
   },
})
const roomNameInput = blessed.textbox({
   parent: roomNameBox,
   inputOnFocus: true,
})

usernameInput.key('enter', () => {
   let username = usernameInput.getValue()
   if (!username) username = `guest${randomTag()}`

   screen.remove(usernameBox)
   screen.append(roomNameBox)
   screen.render()
   roomNameInput.focus()

   roomNameInput.key('enter', () => {
      let room = roomNameInput.getValue()
      if (!room) room = `default-room`

      screen.remove(roomNameBox)

      chatRoom({
         screen,
         socket,
         username,
         room,
      })
   })
   roomNameInput.key(['C-c'], () => process.exit(0))
})

usernameInput.key(['C-c'], () => process.exit(0))

screen.append(usernameBox)
screen.render()
usernameInput.focus()

function randomTag() {
   return Math.floor(Math.random() * 90000) + 10000
}
