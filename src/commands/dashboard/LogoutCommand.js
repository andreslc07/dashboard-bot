const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const database = require("../../database/users");

module.exports = class LogoutCommand extends BaseCommand {
  constructor() {
    super("logout", "dashboard", []);
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  async run(client, message, args) {
    if (message.channel.type !== "DM") {
      return message.channel.send(
        "Para cerrar sesion debes utilizar este comando en mis mensajes privados."
      );
    }

    const checkIfLoggedIn = client.session.get(message.author.id, true);
    if (checkIfLoggedIn) {
      const userLoggedIn = await database.findOne({
        current: message.author.id,
      });
      if (!userLoggedIn) {
        return message.channel.send(
          "Al parecer no estas logueado en ninguna cuenta, intenta iniciando sesion de nuevo. Usa: !login <usuario> <contraseña>"
        );
      }
      try {
        client.session.delete(message.author.id);
        const filter = { current: message.author.id };
        const update = { current: null };
        await database.updateOne(filter, update);
        return message.channel.send("Cerrraste sesion correctamente.");
      } catch (err) {
        message.channel.send("Hubo un error: " + err.message);
        return;
      }
    }
  }
};
