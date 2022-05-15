const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const listablanca = require("../../json/whitelisted.json");
const blacklist = require("../../database/blacklist");
module.exports = class BlacklistCommand extends BaseCommand {
  constructor() {
    super("blacklist", "administration", []);
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  async run(client, message, args) {
    if (!listablanca.id.includes(message.author.id))
      return message.channel.send("No estas en la whitelist.");

    const userId = args[0];
    if (!userId)
      return message.channel.send(
        "Debes proveer una ID. Uso: !blacklist <id usuario>"
      );

    try {
      const isBlacklisted = await blacklist.findOne({ id: userId });
      if (isBlacklisted) {
        return message.channel.send(
          `Este usuario ya esta en la lista negra desde: ${isBlacklisted.date}`
        );
      }

      var blacklistDate = `<t:${Math.round(
        message.createdTimestamp / 1000
      )}:d>`;

      const newBlacklist = new blacklist({
        id: userId,
        date: blacklistDate,
      });
      newBlacklist.save();

      client.blacklist.set(userId, blacklistDate);

      return message.channel.send(
        `Usuario '${userId}' fue añadido a la lista negra.`
      );
    } catch (err) {
      message.channel.send("Hubo un error: " + err.message);
      return;
    }
  }
};
