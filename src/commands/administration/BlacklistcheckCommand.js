const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message, MessageEmbed } = require("discord.js");
const blacklist = require("../../database/blacklist");
const listablanca = require("../../json/whitelisted.json");
module.exports = class BlacklistcheckCommand extends BaseCommand {
  constructor() {
    super("blacklistcheck", "administration", []);
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

    const users = await blacklist.find();

    const blacklistedUsers = users
      .map((u) => `**ID:** ${u.id} **FECHA:** ${u.date}`)
      .join("\n");
    const embed = new MessageEmbed()
      .setColor("RED")
      .setDescription(blacklistedUsers)
      .setFooter({ text: "Usuarios en la lista negra" });
    message.channel.send({ embeds: [embed] });
  }
};
