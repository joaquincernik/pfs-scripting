import net from "net";
import { comandos } from "./utils/comandos.mjs";
import { collector } from "./utils/dataCollector.mjs";
import { checkToken, sendServer, cliName } from "./utils/utils.js";

const puerto = process.env.PUERTO || 7777;
collector.start();

const serverTCP = net.createServer((socketCliente) => {
  socketCliente.setEncoding("utf8");
  socketCliente.tokenSession = null;
  console.log(`Se conectó el cliente ${cliName(socketCliente)}`);
  sendServer(
    socketCliente,
    "Hola, ingrese un token valido antes de comenzar a interactuar: token <token_valido>",
  );

  socketCliente.on("data", (datos) => {
    const cmd = datos.trim().split(" ");

    if (cmd[0] === "token") {
      let tokenIngresado = cmd[1];
      if (checkToken(tokenIngresado)) {
        console.log(
          `${cliName(socketCliente)} logged con el token ${tokenIngresado}`,
        );
        socketCliente.tokenSession = tokenIngresado;
        sendServer(
          socketCliente,
          "Bienvenido, comandos disponibles\n1-getosinfo <seconds>\n2-watch <path> [time]\n3-getwatches <token>\n4-ps\n5-oscmd <command>\n6-snapshot <seconds>\n7-quit\n8-help\n",
        );
      } else {
        sendServer(
          socketCliente,
          "Token invalido, ingrese un token valido antes de comenzar a interactuar: token <token_valido>",
        );
      }
    } else if (socketCliente.tokenSession) {
      // comandos despues de login
      console.log(`${cliName(socketCliente)} ejecuto el comando ${cmd[0]}`);
      switch (cmd[0]) {
        case "getosinfo":
          const seconds = parseInt(cmd[1]) || 3600;
          const resultado = comandos.getOsInfo(seconds);
          sendServer(socketCliente, resultado);
          break;

        case "watch":
          const path = cmd[1];
          if (!path) {
            sendServer(socketCliente, {
              err: true,
              command: "watch",
              content: "uso: watch <path> [time]",
            });
            return;
          }
          const time = parseInt(cmd[2]);
          sendServer(socketCliente, comandos.watch(path, time));
          break;

        case "getwatches":
          const token = cmd[1];
          if (!token) {
            sendServer(socketCliente, {
              err: true,
              command: "getwatches",
              content: "uso: getwatches <token>",
            });
            return;
          }
          sendServer(socketCliente, comandos.getWatches(token));
          break;

        case "ps":
          sendServer(socketCliente, comandos.ps());
          break;

        case "oscmd":
          const respComando = comandos.oscmd(cmd.slice(1));
          if (!respComando) {
            sendServer(
              socketCliente,
              "Quisiste ejecutar un comando no permitido, por seguridad seras expulsado de la conexon",
            );
            console.log(
              `${cliName(socketCliente)} ejecuto comando ${cmd[1]} mediante oscmd`,
            );
            socketCliente.end();
          } else {
            sendServer(socketCliente, respComando);
          }
          break;

        case "snapshot":
          let interval = parseInt(cmd[1]) || 3600;
          comandos
            .snapshot(interval)
            .then((resultado) => sendServer(socketCliente, resultado));

          // bucle
          const timerId = setInterval(() => {
            console.log(
              `Ejecutando snapshot automático para ${cliName(socketCliente)}...`,
            );
            comandos
              .snapshot(interval)
              .then((resultado) => sendServer(socketCliente, resultado))
              .catch((err) => console.error(err));
          }, interval * 1000);

          // timerId en el socket para poder detenerlo después
          socketCliente.snapshotTimer = timerId;
          break;

        case "quit":
          sendServer(socketCliente, "Quiteando...");
          socketCliente.end();
          break;

        case "help":
          sendServer(
            socketCliente,
            "Bienvenido, comandos disponibles\n1-getosinfo <seconds>\n2-watch <path> [time]\n3-getwatches <token>\n4-ps\n5-oscmd <command>\n6-snapshot <seconds>\n7-quit\n8-help\n",
          );
          break;

        default:
          sendServer(
            socketCliente,
            "Comando no reconocido. Comandos disponibles\n1-getosinfo <seconds>\n2-watch <path> [time]\n3-getwatches <token>\n4-ps\n5-oscmd <command>\n6-snapshot <seconds>\n7-quit\n8-help\n",
          );
          break;
      }
    } else {
      sendServer(
        socketCliente,
        "Hola, ingrese un token valido antes de comenzar a interactuar: token <token_valido>",
      );
    }
  });
});

serverTCP.listen(puerto, () => {
  console.log(`Server Agent escuchando en el puerto ${puerto}`);
});
