const io = require("socket.io-client");
const db = require("../../../db/helper");
require("dotenv").config();
const PORT = process.env.PORT || 8001;

//note that for-loops where avoided when initializing clients for clarity purposes
describe('Chat feature tests', () => {
  
  //note that the ID's correspond to the actual user_id in the users' table
  const clientA = {
    connection: null,
    ID: '1',
    message_history: []
  };

  const clientB = {
    connection: null,
    ID: '2',
    message_history: []
  };

  const clientC = {
    connection: null,
    ID: '3',
    message_history: []
  };
  
  beforeEach(() => {
    clientA.connection = io(`http://localhost:${PORT}`, {
      'force new connection' : true,
      query: {
        id: clientA.ID
      }
    });

    clientB.connection = io(`http://localhost:${PORT}`, {
      'force new connection': true,
      query: {
        id: clientB.ID
      }
    });

    clientC.connection = io(`http://localhost:${PORT}`, {
      'force new connection': true,
      query: {
        id: clientC.ID
      }
    });
    
    clientB.connection.on('receive-message', data => {
      clientB.message_history.push(data.message);
    });

    clientC.connection.on('receive-message', data => {
      clientC.message_history.push(data.message);
    });

  });

  afterEach((done) => {
    clientA.connection.disconnect();
    clientB.connection.disconnect();
    clientC.connection.disconnect();
    done();
  });

  afterAll(async() => {
    await db.closeConnection();
  });

  test("Client-B will receive a message from Client-A through socket server", done => {
    clientA.connection.emit("send-message", {
      message: "hello client!",
      recipient: clientB.ID
    });

    setTimeout(() => {
      //client-B's message history will only be mutated upon receiving a "received-message" event from the server
      expect(clientB.message_history).toContain("hello client!");
      done();
    }, 500);
  });

  test("A message will only go to a specific user if more than 2 are online", done => {
    //A message will be sent from client-A to client-C. Therefore, client-B should not receive anything
    clientA.connection.emit("send-message", {
      message: "Only for clientC!",
      recipient: clientC.ID
    });

    setTimeout(() => {
      expect(clientC.message_history).toContain("Only for clientC!");
      expect(clientB.message_history).not.toContain("Only for clientC!");
      done();
    }, 500);
  });

  test("should persist messages between clients to the database", async() => {
    //since client A sent messages to client-B and client-C, only those will be checked
    await db.getSpecificMessage(clientB.message_history[0], clientA.ID, clientB.ID)
      .then(data => {
        expect(data).toBeDefined();
      });

    await db.getSpecificMessage(clientC.message_history[0], clientA.ID, clientC.ID)
      .then(data => {
        expect(data).toBeDefined();
      });
  });
});