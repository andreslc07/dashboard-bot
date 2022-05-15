const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const bcrypt = require("bcrypt");
const database = require("../../database/users");
const { v4: uuidv4 } = require("uuid");
module.exports = class RegisterCommand extends BaseCommand {
  constructor() {
    super("register", "dashboard", []);
  }
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  async run(client, message, args) {
    const saltRounds = 10;
    const user = args[0];
    const textPassword = args[1];

    if (message.channel.type !== "DM")
      return message.channel.send(
        "Para registrarte debes utilizar el comando en mensajes privados."
      );

    const loggedIn = client.session.get(message.author.id);

    if (loggedIn)
      return message.channel.send(
        "Estas logueado en una cuenta, para salir de esta usa: !logout"
      );
    if (!textPassword || !user)
      return message.channel.send(
        "Uso del comando: !register <usuario> <contraseña>"
      );
    if (user.length > 12)
      return message.channel.send(
        "El usuario es muy largo, intenta con algo mas corto."
      );
    if (user.length < 3)
      return message.channel.send(
        "El usuario tiene que tener 3 o mas caracteres."
      );
    if (textPassword.length > 64)
      return message.channel.send(
        "Entendemos que quieras hacer tu contraseña segura, pero no podemos tener una contraseña con mas de 64 caracteres en nuestra base de datos."
      );
    const checkIfUserExists = await database.findOne({ username: user });

    if (checkIfUserExists)
      return message.channel.send(
        "Usuario ya existe, por favor inicia sesion."
      );
    try {
      bcrypt.hash(textPassword, saltRounds, async function (err, hash) {
        if (err) {
          message.channel.send("Hubo un error: " + err.message);
          return console.error(err);
        }

        await register(user, hash);
        return message.channel.send(
          "Registrado exitosamente, inicia sesion con: !login <usuario> <contraseña>"
        );
      });
    } catch (err) {
      message.channel.send("Hubo un error: " + err.message);
      console.error(err);
    }

    async function register(username, password) {
      const newUser = new database({
        uuid: uuidv4(),
        username: username,
        password: password,
        lastLogin: null,
        current: null,
        owner: message.author.id,
      });
      newUser.save();
    }
  }
};
