require("dotenv").config();
const { Client, Intents } = require("discord.js");
const mongoose = require("mongoose");
const config = require("../slappey.json");
const { registerCommands, registerEvents } = require("./utils/registry");
const database = require("./database/blacklist");
const client = new Client({
  partials: ["CHANNEL"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});

client.commands = new Map();
client.events = new Map();
client.session = new Map();
client.blacklist = new Map();
client.prefix = config.prefix;

loadThings(client);
client.login(process.env.token);

async function loadThings(client) {
  client.once("ready", async () => {
    mongoose.connect(process.env.DATABASE_URI, () => {
      console.log("Connected to Database.");
    });
    const blacklist = await database.find();
    if (blacklist) {
      for (let user of blacklist) {
        client.blacklist.set(user.id, user.date);
      }
    }

    await registerCommands(client, "../commands");
    await registerEvents(client, "../events");

    console.log(client.user.tag + " has logged in.");
  });
}
