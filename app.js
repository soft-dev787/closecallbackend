const express = require("express");
const { AssemblyAI } = require("assemblyai");
const axios = require("axios");
const db = require("./models");

const Email = db.Email;
const app = express();
const aaiClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

app.use(express.json());

const aircallAuth = {
  username: process.env.AIRCALL_API_ID,
  password: process.env.AIRCALL_API_TOKEN,
};

const axiosInstance = axios.create({
  baseURL: "https://api.aircall.io/v1/",
  auth: aircallAuth,
});

app.get("/", (req, res) => res.send("Welcome"));

app.get("/token", async (req, res) => {
  try {
    const token = await aaiClient.realtime.createTemporaryToken({
      expires_in: 3600,
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/finduser", async (req, res) => {
  const emailToFind = req.body.email;

  if (!emailToFind) {
    return res.status(400).json({ error: "Please provide an email address." });
  }

  try {
    let nextPageUrl = "https://api.aircall.io/v1/users?per_page=50"; // Initial URL for users
    let userFound = null;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, { auth: aircallAuth });

      userFound = response.data.users.find((u) => u.email === emailToFind);

      if (userFound) {
        break;
      }

      nextPageUrl = response.data.meta.next_page_link || null;
    }

    if (userFound) {
      await Email.create({
        email: emailToFind,
        verified: true,
      });
      res.json({ user: userFound }); // Send the found user data
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users from Aircall." });
  }
});

app.get("/health", async (req, res) => {
  res.json({ test: "test" });
});

module.exports = app;
