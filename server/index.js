const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors({
  origin:  [
    "http://localhost:5173",
    "https://code-together-bay.vercel.app"
  ], 
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Routes
const codeBlocksRoute = require("./routes/codeblocks");
app.use("/api/codeblocks", codeBlocksRoute);

// Handle sending updated student list
function sendUpdatedStudentList(roomId) {
  const room = activeRooms[roomId];
  if (!room) return;

  const list = room.studentIds.map(id => ({
    name: room.studentNames[id],
    solved: !!room.solved[id],
  }));

  io.to(roomId).emit("studentList", list); 
}

// Handle mentor disconnect
function handleMentorDisconnect(roomId) {
  io.to(roomId).emit("roomClosed");
  delete activeRooms[roomId];
  console.log(`🧹 Mentor left, room ${roomId} cleared`);
}

// Handle student disconnect
function handleStudentDisconnect(roomId, socketId) {
  const room = activeRooms[roomId];
  if (!room) return;

  // Remove from student list
  room.studentIds = room.studentIds.filter(id => id !== socketId);
  delete room.studentNames[socketId];

  // Emit updated count and list
  io.to(roomId).emit("studentCount", room.studentIds.length);
  const studentList = room.studentIds.map(id => ({
    name: room.studentNames[id],
    solved: room.solved[id]
  }));
  io.to(roomId).emit("studentList", studentList);

  console.log(`Student ${socketId} left room ${roomId}`);
}



// MongoDB connection
mongoose.connect("mongodb+srv://tsachmaya:Maya6516313%21@codetogethercluster.yawpdvd.mongodb.net/codetogether?retryWrites=true&w=majority&appName=CodeTogetherCluster")
  .then(() => {
    console.log("✅ Connected to MongoDB");

    const PORT = 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Active rooms tracker
const activeRooms = {};

io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("joinRoom", ({ roomId, name }) => {
    socket.join(roomId);
  
    if (!activeRooms[roomId]) { // First user in the room- mentor
      activeRooms[roomId] = {
        mentorId: socket.id,
        studentIds: [],
        studentNames: {}, 
        solved: {} 
      };
      socket.emit("roleAssigned", "mentor");
    } 
    
    else { // Room already exists- student
      socket.emit("roleAssigned", "student");
      activeRooms[roomId].studentIds.push(socket.id);
      activeRooms[roomId].studentNames[socket.id] = name;
  
      const names = Object.values(activeRooms[roomId].studentNames);
      io.to(roomId).emit("studentList", names);

      io.to(roomId).emit("studentCount", activeRooms[roomId].studentIds.length);
    }
  
    socket.on("disconnect", () => {
      for (const roomId in activeRooms) {
        const room = activeRooms[roomId];
        if (!room) continue;
    
        if (room.mentorId === socket.id) {
          handleMentorDisconnect(roomId);
        } else if (room.studentIds.includes(socket.id)) {
          handleStudentDisconnect(roomId, socket.id);
        }
      }
    });
      
  });
  
  // Receive code from student, broadcast to others
  socket.on("codeChange", ({ roomId, newCode }) => {
    socket.to(roomId).emit("codeUpdate", newCode);
  });

  // Handle code solved- notify all
  socket.on("solved", ({ roomId }) => {
    const room = activeRooms[roomId];
    if (room) {
      room.solved[socket.id] = true;
      sendUpdatedStudentList(roomId); 
    }
  }); 
  
  // Handle code unsolved- notify all
  socket.on("unsolved", ({ roomId }) => {
    const room = activeRooms[roomId];
    if (room) {
      room.solved[socket.id] = false;
      sendUpdatedStudentList(roomId);  
    }
  });

  // Handle message from mentor to students
  socket.on("mentorMessage", ({ roomId, message }) => {
    io.to(roomId).emit("mentorMessage", message);
  });
  

});
