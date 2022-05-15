const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message, MessageEmbed } = require("discord.js");
const database = require("../../database/users");

module.exports = class PanelCommand extends BaseCommand {
  constructor() {
    super("panel", "dashboard", []);
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  async run(client, message, args) {
    if (message.channel.type !== "DM")
      return message.channel.send(
        "Para ver el panel debes usar utilizar el comando en mensajes privados."
      );

    const loggedIn = client.session.get(message.author.id);

    const userLoggedIn = await database.findOne({
      current: message.author.id,
    });
    if (!userLoggedIn) {
      return message.channel.send(
        "Al parecer no estas logueado en ninguna cuenta, intenta iniciando sesion de nuevo. Usa: !login <usuario> <contraseña>"
      );
    }
    if (loggedIn) {
      const embed = new MessageEmbed()
        .setColor("BLUE")
        .setAuthor({ name: userLoggedIn.username })
        .setDescription(
          `**Ultimo inicio de sesion:** ${
            userLoggedIn.lastLogin
          }\n**UUID:** \`${userLoggedIn.uuid}\`\n**Email: **${
            userLoggedIn.email
              ? userLoggedIn.email
              : "Debes poner un email para poder recupear el acceso a tu cuenta en caso de perdida, usa: !setemail <correo electronico>"
          }`
        );
      return message.channel.send({ embeds: [embed] });
    }
  }
};
