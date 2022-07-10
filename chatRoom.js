const blessed = require('blessed')
const chalk = require('chalk')

module.exports = ({ screen, socket, username, room }) => {
   socket.emit('join', { name: username, room })

   if (!socket.connected) {
      console.log('Socket is not connected')
      setTimeout(() => {
         return process.exit(1)
      }, 1000)
   }







   const chatBox = blessed.box({
      label: ` Chat | Room: ${room} `,
      width: '100%-20',
      height: '100%-3',
      left: '0',
      border: {
         type: 'line',
      },
   })

   const chatLog = blessed.log({
      parent: chatBox,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
         ch: '',
         inverse: true,
      },
      mouse: true,
   })

   const usersBox = blessed.list({
      label: ` Users `,
      height: '100%',
      width: 20,
      scrollable: true,
      right: '0',
      border: {
         type: 'line',
      },
   })

   const inputBox = blessed.box({
      label: ' Type your message (press enter to send) ',
      bottom: '0',
      width: '100%-20',
      height: 3,
      border: {
         type: 'line',
      },
   })

   const input = blessed.textbox({
      parent: inputBox,
      inputOnFocus: true,
   })







   let usersCount = 0
   let usersList
   socket.on('roomData', ({ users }) => {
      usersList = users.map((user) => user.name)
      usersBox.setItems(usersList)

      usersCount = users.length
      usersBox.setLabel(` Users (${chalk.green(usersCount)}) `)

      screen.render()
   })

   socket.on('message', (message) => {
      chatLog.log(`-> ${chalk.yellow(message.user)}: ${message.text}`)
   })

   socket.on('error', (error) => {
      chatLog.log(chalk.red(error))

      if (error === 'Username is taken.') {
         setTimeout(() => {
            screen.destroy()
            process.exit(0)
         }, 2000)
      }
   })

   socket.on('allInformations', ({ rooms, users, usersInRoom }) => {
      chatLog.log(`-> ${chalk.yellow('SYSTEM')}: There are ${rooms} rooms, ${users} users and ${usersInRoom} users in the room.`)
   })








   input.key('enter', () => {
      const text = input.getValue()
      input.clearValue()
      if (!text || text === '') {
         chatLog.log(`-> ${chalk.red("Error: Can't send empty message.")}`)
      } else {
         if (text.startsWith('$') && text.length > 1) {
            const command = text.substring(1)
            if (command === 'clear') {
               chatLog.log('\n\n\n\n\n\n\n\n\n\n\n')
            } else if (command === 'help') {
               chatLog.log('')
               chatLog.log(`-> ${chalk.cyan('Available commands:')}`)
               chatLog.log(`-> ${chalk.cyan('$help')} - Shows this help message.`)
               chatLog.log(`-> ${chalk.cyan('$server')} - Shows actual server address (can change in server.json file).`)
               chatLog.log(`-> ${chalk.cyan('$clear')} - Clears the chat log.`)
               chatLog.log(`-> ${chalk.cyan('$exit')} - Exits app.`)
               chatLog.log(`-> ${chalk.cyan('$users')} - Shows users in room.`)
               chatLog.log(`-> ${chalk.cyan('$update')} - Update screen.`)
               chatLog.log('')
            } else if (command === 'exit') {
               process.exit(0)
            } else if (command === 'users') {
               chatLog.log(`-> ${chalk.yellow('SYSTEM')}: There are ${chalk.bold.yellow(usersList)} in the room.`)
            } else if (command === 'update') {
               screen.render()
            } else if (command === 'server') {
               chatLog.log(`-> ${chalk.yellow('SYSTEM')}: Server address is ${chalk.bold.yellow(socket.io.uri)}`)
            }
         } else {
            if (text.length > 400) {
               chatLog.log(`-> ${chalk.red('Error: Message is too long.')}`)
            } else {
               socket.emit('sendMessage', {
                  text: text,
               })
            }
         }
      }
      input.focus()
   })

   input.key('up', () => {
      chatLog.scroll(-3)
      screen.render()
   })
   input.key('down', () => {
      chatLog.scroll(3)
      screen.render()
   })





   

   screen.append(chatBox)
   screen.append(usersBox)
   screen.append(inputBox)

   screen.render()

   input.focus()
}
