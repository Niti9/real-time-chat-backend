import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['https://real-time-chat-frontend-iota.vercel.app',
    'http://localhost:5173',
  ], // Replace with your actual frontend domain
  methods: ['GET', 'POST'],
  credentials: true
}
)); // Enable CORS for all origins

const server = createServer(app);
const io = new Server(server, {
//   cors: {
//     origin: '*', // Allow all origins for simplicity
//     methods: ['GET', 'POST'],
//   },
// });



cors: {
  origin: ['https://real-time-chat-frontend-iota.vercel.app',
    'http://localhost:5173',
  ], // Replace with your actual frontend domain
  methods: ['GET', 'POST'],
  credentials: true
},
transports: ['websocket', 'polling'], // Allow both websocket and polling as transports
});



//api to test backend so i can see that it is hosted successfully on vercel
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from the server!' });
});



let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins the chat
  socket.on('joinChat', (username) => {
    const user = { id: socket.id, username };
    users.push(user);

    // Notify the user about successful connection
    socket.emit('joined', user);

    // Broadcast to all other users that a new user has joined
    socket.broadcast.emit('userJoined', user);

    // Send the list of active users to the client
    io.emit('activeUsers', users);
  });

  // User sends a message
  socket.on('sendMessage', (messageData) => {
    console.log(messageData);
    io.emit('receiveMessage', messageData);
  });


    // When a user starts typing
    socket.on('userTyping', (username) => {
      console.log('usertyping',username);
      socket.broadcast.emit('typing', username); // Notify other users that this user is typing
    });
  
    // When a user stops typing
    socket.on('userStopTyping', (username) => {
      console.log('userStoptyping',username);
      socket.broadcast.emit('stopTyping', username); // Notify others that this user stopped typing
    });
  

  // User disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);

      // Notify all users that someone has left
      io.emit('userLeft', user);

      // Update the list of active users
      io.emit('activeUsers', users);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
