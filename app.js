const express = require("express");
const { AssemblyAI } = require("assemblyai");
const axios = require("axios");
const db = require("./models");
const Email = db.Email;
const app = express();
const aaiClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
const { OpenAI } = require("openai");
const twilio = require("twilio");
app.use(express.json());
const bcrypt = require("bcrypt");
const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_KEY,
});
const User = db.User;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const jwt = require("jsonwebtoken");

async function createMessage(summary, fromNumber, toNumber) {
  const message = await client.messages.create({
    body: summary,
    from: fromNumber,
    to: toNumber,
  });
}

const aircallAuth = {
  username: process.env.AIRCALL_API_ID,
  password: process.env.AIRCALL_API_TOKEN,
};

const axiosInstance = axios.create({
  baseURL: "https://api.aircall.io/v1/",
  auth: aircallAuth,
});

app.get("/", (req, res) => res.send("Welcome"));

app.post("/summarize", async (req, res) => {
  const { transcript, fromNumber, toNumber } = req.body;

  if (!transcript || transcript.length === 0) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  try {
    const prompt = `
    You are a helpful assistant. Below is a conversation between a customer and a salesperson in a retail setting. 
    Your task is to summarize the conversation and provide the key points in bullet list format:

    Conversation:
    ${transcript}

    Key points:
  `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes conversations and return the key points as bullet lists",
        },
        { role: "user", content: prompt },
      ],
    });

    const summary = response.choices[0].message.content.trim();
    // const summary =
    //   "- The customer is looking for a new laptop, and has certain specifications in mind:\n  - The laptop needs to be fast enough for work, and capable of handling light gaming.\n  - Battery life is important because the customer travels frequently.\n- The customer's preferred brands are Dell and Lenovo, with a budget under $1,500.\n- The salesperson recommended the Dell XPS 13 and Lenovo Legion 5, stating that both models have strong processors, good graphics, and long battery life.\n- The customer expressed interest in the Dell XPS 13, prioritizing display quality and keyboard comfort for presentations, media consumption, and extensive typing.\n- The salesperson reassured the customer that the XPS 13 has a high-quality display, a comfortable keyboard, and about 12 hours of battery life under normal use.\n- The customer decided to opt for the Dell XPS 13 and wanted to check it out in person. The salesperson agreed to fetch the laptop for the customer to inspect.";

    await createMessage(summary, fromNumber, toNumber);

    res.json({ summary: summary });
  } catch (error) {
    console.error("Error summarizing transcript:", error);
    res.status(500).json({ error: "Failed to summarize the transcript." });
  }
});

app.get("/token", async (req, res) => {
  try {
    console.log("stringgg");

    const token = await aaiClient.realtime.createTemporaryToken({
      expires_in: 3600,
    });
    console.log(token);

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

app.post("/register", async (request, response) => {
  bcrypt
    .hash(request.body.password, 10)
    .then(async (hashedPassword) => {
      try {
        const user = await User.create({
          email: request.body.email,
          password: hashedPassword,
        });

        response.status(201).send({
          message: "User Created Successfully",
          id: user.id,
        });
      } catch (error) {
        response.status(500).send({
          message: error.message || "Error creating user",
        });
      }
    })
    .catch((e) => {
      console.log(e);

      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/login", async (request, response) => {
  try {
    const user = await User.findOne({
      where: {
        email: request.body.email,
      },
    });

    bcrypt
      .compare(request.body.password, user.password)

      .then((passwordCheck) => {
        if (!passwordCheck) {
          return response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        }
        const token = jwt.sign(
          {
            userId: user._id,
            userEmail: user.email,
          },
          process.env.JWT_KEY,
          { expiresIn: "7d" }
        );

        response.status(200).send({
          token,
          id: user.id,
        });
      })
      .catch((error) => {
        response.status(400).send({
          message: "Passwords does not match",
          error,
        });
      });
  } catch (error) {
    response.status(404).send({
      message: "Email not found",
    });
  }
});

module.exports = app;
