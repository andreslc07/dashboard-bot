const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const database = require("../../database/users");
var nodemailer = require("nodemailer");
var randomstring = require("randomstring");
module.exports = class ResetpasswordCommand extends BaseCommand {
  constructor() {
    super("resetpassword", "dashboard", []);
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
        "Para restablecer tu contraseña, debes utilizar este comando en mis mensajes privados."
      );

    const verifiLogin = client.session.get(message.author.id);
    if (verifiLogin) {
      const userLoggedIn = await database.findOne({
        current: message.author.id,
      });
      if (!userLoggedIn) {
        return message.channel.send(
          "Al parecer no estas logueado en ninguna cuenta, intenta iniciando sesion de nuevo. Usa: !login <usuario> <contraseña>"
        );
      }

      if (!userLoggedIn.email)
        return message.channel.send(
          "Para poder cambiar tu contraseña debes tener un email verificado, usa: !setemail <correo electronico>"
        );

      const password = args[0];
      if (!password)
        return message.channel.send(
          "Provee una contraseña para cambiar, uso: !resetpassword <nuevacontraseña>"
        );

      var verificationCode = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });
      var transporter = nodemailer.createTransport({
        service: "gmail", //Servicio que se va a usar mas informacion: https://npmjs.com/package/nodemailer
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      var mailOptions = {
        from: "Remitente",
        to: userLoggedIn.email,
        subject: "Codigo para cambio de contraseña | LR v1",
        text: `Tu codigo de verificacion es: ${verificationCode}\n\n¿No eres tu? Contacta con el soporte.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          message.channel.send("Hubo un error: " + err.message);
          return;
        } else {
          message.channel.send(
            `He enviado un email a: ${email} con un codigo para cambio de contraseña, debes enviar el codigo aqui. Si no te aparece revisa la bandeja de spam/no deseados.`
          );

          const filter = (m) => m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector({
            filter,
            max: 3,
            time: 15000,
          });

          collector.on("collect", async (m) => {
            if (m.content.toString() == verificationCode.toString()) {
              const hash = bcrypt.hashSync(password, 10);

              const filter = { current: message.author.id };
              const update = { password: hash };
              await database.updateOne(filter, update);
              message.channel.send("Cambio de contraseña exitoso.");
              collector.stop();
            } else {
              message.channel.send("Codigo invalido, intenta de nuevo.");
              return;
            }
          });
        }
      });
    }
  }
};
