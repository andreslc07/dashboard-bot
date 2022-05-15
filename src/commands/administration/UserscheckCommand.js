const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message, MessageEmbed } = require("discord.js");
const users = require("../../database/users");
const listablanca = require("../../json/whitelisted.json");
const blacklist = require("../../database/blacklist");
module.exports = class UserscheckCommand extends BaseCommand {
  constructor() {
    super("userscheck", "administration", []);
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

    const user = args[0];

    const searchUser = await users.findOne({ username: user });

    if (searchUser) {
      async function isB() {
        const isBlacklisted = await blacklist.findOne({ id: searchUser.owner });
        if (isBlacklisted) {
          return "Esta en la lista negra";
        }
        return "No esta en la lista negra";
      }

      const userEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setDescription(
          `**UUID:** ${searchUser.uuid}\n**Usuario:** ${
            searchUser.username
          }\n**Ultimo inicio de sesion:** ${
            searchUser.lastLogin ? searchUser.lastLogin : "Ninguno"
          }\n**Actualmente:** ${
            searchUser.current ? searchUser.current : "Ninguno"
          }\n**Email:** ${
            searchUser.email ? searchUser.email : "No tiene un email."
          }\n**Blacklisted:** ${await isB()}\n**Dueño:** ${searchUser.owner}`
        );
      return message.channel.send({ embeds: [userEmbed] });
    }

    const allUsers = await users.find();
    if (allUsers.length > 5) {
      const embed = new MessageEmbed()
        .setColor("BLUE")
        .setDescription(
          `${allUsers
            .map((x) => `**UUID:** ${x.uuid}\n**Usuario:** ${x.username}\n`)
            .join("")}`
        )
        .setFooter({ text: "hola k ase" });
      return message.channel.send({ embeds: [embed] });
    } else {
      const embed = new MessageEmbed()
        .setColor("BLUE")
        .setDescription(
          `${allUsers
            .map((x) => `**UUID:** ${x.uuid}\n**Usuario:** ${x.username}`)
            .join("\n")}`
        )
        .setFooter({ text: "hola k ase" });
      return message.channel.send({ embeds: [embed] });
    }
  }
};
