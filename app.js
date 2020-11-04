require("dotenv").config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_BASE_URL = process.env.DISCORD_BASE_URL;
const DISCORD_VERSION_NUMBER = process.env.DISCORD_VERSION_NUMBER;
const guildID = "773090778741211146";
const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/members", (req, res) => {
  axios({
    method: "get",
    url: `${DISCORD_BASE_URL}/guilds/${guildID}/members?limit=100`,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "User-Agent": `DiscordBot (${DISCORD_BASE_URL}, ${DISCORD_VERSION_NUMBER})`,
    },
  })
    .then(({ data }) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.listen(3000, () => {
  console.log("discord connected");
});
