const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const database = require("../../database/users");
const bcrypt = require("bcrypt");
module.exports = class LoginCommand extends BaseCommand {
  constructor() {
    super("login", "dashboard", []);
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
        "Para iniciar sesion debes utilizar el comando en mensajes privados."
      );
    }

    const loggedIn = client.session.get(message.author.id);

    if (loggedIn)
      return message.channel.send(
        "Ya estas logueado en una cuenta, para salir de esta usa: !logout"
      );

    const user = args[0];
    const password = args[1];

    if (!password || !user)
      return message.channel.send(
        "Uso del comando: !login <usuario> <contraseña>"
      );
    try {
      checkUser(user, password);
    } catch (err) {
      console.error(err);
      return message.channel.send("Hubo un error: " + err.message);
    }

    async function checkUser(username, password) {
      const userData = await database.findOne({ username: username });
      if (!userData)
        return message.channel.send("Usuario y/o contraseña incorrecta.");
        
      const match = await bcrypt.compare(password, userData.password);

      if (match) {
        if (userData.current !== null) return message.channel.send("Al parecer hay alguien dentro de la cuenta. Si no eres tu deberias contactar al soporte.");
        const filter = { username: username };
        const update = {
          lastLogin: `${message.author.tag} (${
            message.author.id
          }) <t:${Math.round(message.createdTimestamp / 1000)}:R>`,
          current: message.author.id,
        };
        await database.updateOne(filter, update);
        
        client.session.set(message.author.id, true);
        return message.channel.send("Iniciaste sesion correctamente.");
      }
      return message.channel.send("Usuario y/o contraseña incorrecta.");
    }
  }
};
