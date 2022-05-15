const BaseCommand = require("../../utils/structures/BaseCommand");
const { Client, Message } = require("discord.js");
const database = require("../../database/users");
var randomstring = require("randomstring");
var nodemailer = require("nodemailer");
module.exports = class DeleteaccountCommand extends BaseCommand {
  constructor() {
    super("deleteaccount", "dashboard", []);
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
        "Para eliminar tu cuenta, debes utilizar este comando en mis mensajes privados"
      );

    const checkIfLoggedIn = client.session.get(message.author.id);
    if (checkIfLoggedIn) {
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
        subject: "Codigo de eliminacion de cuenta | LR v1",
        text: `Tu codigo de verificacion es: ${verificationCode}\n\n**ADVERTENCIA** Si tu no haz solicitado eliminar tu cuenta, contacta con el soporte lo antes posible.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          message.channel.send("Hubo un error: " + err.message);
          return;
        } else {
          message.channel.send(
            `He enviado un email a: ${userLoggedIn.email} con un codigo de verificacion para confirmar la eliminacion de cuenta debes enviarlo aqui. Si no te aparece revisa la bandeja de spam/no deseados.`
          );

          const filter = (m) => m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector({
            filter,
            max: 3,
            time: 35000,
          });

          collector.on("collect", (code) => {
            if (verificationCode.toString() == code.toString()) {
              const filter = { uuid: userLoggedIn.uuid };
              database.findOneAndDelete(filter, function (err, doc) {
                client.session.delete(message.author.id);
                if (err) {
                  message.channel.send("Hubo un error: " + err.message);
                  return console.log(err);
                }
                var path = __dirname + "../../../cache";
                var document = JSON.stringify(doc, null, 4);
                var fs = require("fs");

                fs.writeFile(
                  `${path}/${doc.uuid}.json`,
                  document,
                  function (err, result) {
                    if (err)
                      console.log(
                        `Hubo un error guardando el documento '${doc.uuid}' \n${err.stack}`
                      );
                  }
                );

                return message.channel.send("Cuenta eliminada");
              });
            }
          });
        }
      });
    }
  }
};
