require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http"); // Import the HTTP module to create the server
const socketIo = require("socket.io"); // Import Socket.IO
const { sampleData } = require("./sampleData");
const app = express();
const server = http.createServer(app); // Create a server with Expre

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const port = process.env.PORT || 3000;
const appRoutes = require("./app");
const db = require("./models");

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
  socket.on("clientMessage", (data) => {
    console.log("Message from client:", data);
    socket.emit("serverMessage", "Hello from the server!");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
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

  if (
    // singleEvent.event == "call.created" ||
    singleEvent.event == "call.answered" ||
    singleEvent.event == "call.hungup"
  ) {
    const userExist = await db.Email.findOne({
      where: {
        email: singleEvent.data.user.email,
      },
    });

    if (userExist) {
      io.emit("callEvent", {
        type: singleEvent.event,
        data: {
          id: singleEvent.data.id,
          call_uuid: singleEvent.data.call_uuid,
          user: singleEvent.data.user,
        },
      });

      res.status(200).json(singleEvent);
    } else {
      return res.status(200).send("ok");
    }
  } else {
    return res.status(200).send("ok");
  }
});

server.listen(port, () => console.log(`App listening on port ${port}!`));
