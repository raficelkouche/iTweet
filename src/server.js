const PORT = process.env.PORT || 8001;
const app = require('./application');
const server = require('http').createServer(app);
const wss = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const activeConnections = {}; //This is to keep track of all connected clients

wss.on('connection', socket => {
  const clientID = socket.handshake.query.id || uuidv4()  //expect client to pass their ID
  const clientName = socket.handshake.query.username || "username" //expect client to pass their username
  const userInfo = { clientID, clientName }

  console.log("new connection: ", clientID)

  socket.join(clientID); //put the client in a room so they can be reached

  //add the current client to the active connections in case they were not added before
  if(!activeConnections[clientID]) {
    activeConnections[clientID] = userInfo
  }

  //create a list with all the connected clients except the current one, to be used to track online friends
  const updatedList = {};
  Object.keys(activeConnections).forEach(userID => {
    if (userID !== clientID) {
      updatedList[userID] = activeConnections[userID]
    }
  })

  //send this to the client that just joined to update their online friends list
  socket.emit('updated-friends-list', updatedList)

  //send this to all the clients except the current one to update their friends list
  socket.broadcast.emit('updated-friends-list', { ...userInfo })

  //this listener will be called once the client sends a message to another
  socket.on('send-message', ({ recipient, message }) => {
    socket.to(recipient).emit('receive-message', {
      message,
      sender: clientID
    })
  })

  socket.on('disconnect', () => {
    delete activeConnections[clientID];
    console.log("user disconnected: ", clientID)
    socket.broadcast.emit('remove-user', { ...userInfo }) //to have clients update their online friends list
  })
})


//start the server
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
})
