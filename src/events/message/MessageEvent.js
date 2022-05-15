const BaseEvent = require("../../utils/structures/BaseEvent");
const { Client, Message } = require("discord.js");
module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @returns
   */
  async run(client, message) {
    if (message.author.bot) return;
    if (message.content.startsWith(client.prefix)) {
      const isBlacklisted = client.blacklist.get(message.author.id);
      if (isBlacklisted) {
        return message.channel.send(
          "No puedes usar ninguno comando, estas en la lista negra. Si crees que es un error contacta con el soporte "
        );
      }
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
};
