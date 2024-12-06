require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http"); // Import the HTTP module to create the server
const socketIo = require("socket.io"); // Import Socket.IO
const { sampleData } = require("./sampleData");
const app = express();
const server = http.createServer(app); // Create a server with Expre
let userSocketMap = {};
// const User = db.User;
const io = socketIo(server, {
  cors: {
    origin: "*", // Accepts requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: "*",
  },
});

const port = process.env.PORT || 3000;
const appRoutes = require("./app");
const db = require("./models");

app.use(
  cors({
    origin: "*", // Allow any origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: "*",
  })
);

db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

io.on("connection", (socket) => {
  socket.on("user-login", (userId) => {
    console.log(`User logged in: ${userId}, Socket ID: ${socket.id}`);
    userSocketMap[userId] = socket.id;
  });

  socket.on("user-logout", (userId) => {
    console.log(`User logged out: ${userId}`);
    delete userSocketMap[userId];
  });

  socket.on("clientMessage", (data) => {
    console.log("Message from client:", data);
    socket.emit("serverMessage", "Hello from the server!");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

app.use(appRoutes);

app.post("/webhook", async (req, res) => {
  const singleEvent = req.body;

  if (singleEvent.resource != "call") {
    return res.status(200).send("ok");
  }

  if (singleEvent.data.direction == "inbound") {
    return res.status(200).send("ok");
  }

  const randomVal = Math.floor(Math.random() * 999);
  console.log(`eventtt startttt ${randomVal} `);
  console.log(singleEvent);
  console.log(`eventtt enddddd ${randomVal + 100} `);

  console.log("executingggggggg");

  if (
    // singleEvent.event == "call.created" ||
    singleEvent.event == "call.answered" ||
    singleEvent.event == "call.hungup" ||
    singleEvent.event == "call.transferred" ||
    singleEvent.event == "call.unsuccessful_transfer"
  ) {
    // const userExist = await db.Email.findOne({
    //   where: {
    //     email: singleEvent.data.user.email,
    //   },
    // });

    // if (userExist) {
    const userInDB = await db.User.findOne({
      where: {
        email: singleEvent.data.user.email,
      },
    });
    if (userInDB) {
      const userId = userInDB.id;
      const userSocketId = userSocketMap[userId];

      // io.to(userSocketId).emit("notification", "notification");

      io.to(userSocketId).emit("callEvent", {
        type: singleEvent.event,
        data: {
          id: singleEvent.data.id,
          call_uuid: singleEvent.data.call_uuid,
          user: singleEvent.data.user,
        },
      });

      // io.emit("callEvent", {
      //   type: singleEvent.event,
      //   data: {
      //     id: singleEvent.data.id,
      //     call_uuid: singleEvent.data.call_uuid,
      //     user: singleEvent.data.user,
      //   },
      // });

      res.status(200).json("ok");
    } else {
      res.status(200).json("ok");
    }
    // } else {
    //   return res.status(200).send("ok");
    // }
  } else {
    return res.status(200).send("ok");
  }
});

// app.get("/check", async (req, res) => {
//   // io.emit("send-notification", "d94ddc2f-8085-4f4c-be48-9aec68d06a16");
//   const userEmail = "jawadah303@gmail.com";
//   const userInDB = await User.findOne({
//     where: {
//       email: userEmail,
//     },
//   });
//   if (userInDB) {
//     const userId = userInDB.id;
//     const userSocketId = userSocketMap[userId];
//     console.log(userSocketId);

//     if (userSocketId) {
//       // Emit notification to the user's socket
//       io.to(userSocketId).emit("notification", "notification");
//       return res
//         .status(200)
//         .json({ message: "Notification sent successfully" });
//     } else {
//       return res.status(404).json({ message: "User not connected" });
//     }
//   } else {
//     return res.status(200).send("ok");
//   }
// });

server.listen(port, () => console.log(`App listening on port ${port}!`));
