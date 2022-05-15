const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const database = require("../../database/users");
var nodemailer = require("nodemailer");
var randomstring = require("randomstring");
module.exports = class SetemailCommand extends BaseCommand {
  constructor() {
    super("setemail", "dashboard", []);
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
        "Para poner tu email, debes utilizar este comando en mis mensajes privados."
      );
    }

    const userLoggedIn = await database.findOne({
      current: message.author.id,
    });
    if (!userLoggedIn) {
      return message.channel.send(
        "Al parecer no estas logueado en ninguna cuenta, intenta iniciando sesion de nuevo. Usa: !login <usuario> <contraseña>"
      );
    }

    var email = args[0];
    if (!email) return message.reply("Provee un email");

    function validateEmail(email) {
      var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

      if (!pattern.test(email)) {
        return false;
      }
      return true;
    }
    if (validateEmail(email)) {
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
        to: email,
        subject: "Codigo de verificacion | LR v1",
        text: `Tu codigo de verificacion es: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          message.channel.send("Hubo un error: " + err.message);
          return;
        } else {
          message.channel.send(
            `He enviado un email a: ${email} con un codigo de verificacion para confirmar el email debes enviarlo aqui. Si no te aparece revisa la bandeja de spam/no deseados.`
          );

          const filter = (m) => m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector({
            filter,
            max: 3,
            time: 15000,
          });

          collector.on("collect", async (m) => {
            if (m.content.toString() == verificationCode.toString()) {
              const filter = { current: message.author.id };
              const update = { email: email };
              await database.updateOne(filter, update);

              message.channel.send("Email verificado correctamente.");
              collector.stop();
            } else {
              message.channel.send("Codigo invalido, intenta de nuevo.");
              return;
            }
          });
        }
      });
    } else {
      return message.channel.send("Email invalido.");
    }
  }
};
