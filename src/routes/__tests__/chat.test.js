const request = require("supertest");
const io = require("socket.io-client")


//note that for-loops where avoided when initializing clients for clarity purposes
describe('Chat feature tests', () => {
  const clientA = {
    connection: null,
    ID: '10',
    message_history: []
  }

  const clientB = {
    connection: null,
    ID: '20',
    message_history: []
  }

  const clientC = {
    connection: null,
    ID: '30',
    message_history: []
  }
  
  beforeEach(() => { 
    clientA.connection = io('http://localhost:8001', {
      'force new connection' : true,
      query: {
        id: clientA.ID
      }
    })

    clientB.connection = io('http://localhost:8001', {
      'force new connection': true,
      query: {
        id: clientB.ID
      }
    })

    clientC.connection = io('http://localhost:8001', {
      'force new connection': true,
      query: {
        id: clientC.ID
      }
    })
    

    clientB.connection.on('receive-message', data => {
      clientB.message_history.push(data.message)
    })

    clientC.connection.on('receive-message', data => {
      clientC.message_history.push(data.message)
    })

  })

  afterEach((done) => {
    clientA.connection.disconnect()
    clientB.connection.disconnect()
    clientC.connection.disconnect()
    done()
  })

  test("Client-B will receive a message from Client-A through socket server", done => {
    clientA.connection.emit("send-message", {
      message: "hello client!",
      recipient: clientB.ID
    })

    setTimeout(() => {
      //client-B's message history will only be mutated upon receiving a "received-message" event from the server
      expect(clientB.message_history).toContain("hello client!")
      done()
    }, 100);
  })

  test("A message will only go to a specific user if more than 2 are online", done => {
    //A message will be sent from client-A to client-C. Therefore, client-B should not receive anything
    clientA.connection.emit("send-message", {
      message: "Only for clientC!",
      recipient: clientC.ID
    })

    setTimeout(() => {
      expect(clientC.message_history).toContain("Only for clientC!")
      expect(clientB.message_history).not.toContain("Only for clientC!")
      done()
    }, 100);
  })
})