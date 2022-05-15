const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const listablanca = require("../../json/whitelisted.json");
const blacklist = require("../../database/blacklist");

module.exports = class DelblacklistCommand extends BaseCommand {
  constructor() {
    super("delblacklist", "administration", []);
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   * @returns
   */
  async run(client, message, args) {
    if (!listablanca.id.includes(message.author.id))
      return message.channel.send("No estas en la whitelist.");

    const userId = args[0];
    if (!userId)
      return message.channel.send(
        "Debes proveer una ID. Uso: !delblacklist <id usuario>"
      );

    const isBlacklisted = await blacklist.findOne({ id: userId });
    if (!isBlacklisted) {
      return message.channel.send(`Este usuario no esta en la lista negra`);
    }
    try {
      const filter = { id: userId };
      blacklist.deleteOne(filter, function (err, doc) {
        if (err) {
          return message.channel.send("Hubo un error: " + err.message);
        }
        client.blacklist.delete(userId);

        return message.channel.send(
          `Usuario '${userId}' fue eliminado de la lista negra.`
        );
      });
    } catch (err) {
      message.channel.send("Hubo un error: " + err.message);
      return;
    }
  }
};
