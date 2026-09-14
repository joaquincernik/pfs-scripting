import net from "net";
import { comandos } from "./utils/comandos.mjs";
import { collector } from "./utils/dataCollector.mjs";
import fs from "fs/promises";

const puerto = process.env.PUERTO || 7777;

collector.start();
const data = await fs.readFile("./auth/tokens.txt", "utf-8");
const tokensPosibles = data.split(",");

function checkToken(token) {
  if (tokensPosibles.includes(token)) return true;
  return false;
}

const cliName = (socket) => {
  return `${socket.remoteAddress}:${socket.remotePort}`;
};

const sendServer = (socket, msg) => {
  const out = typeof msg === "string" ? msg : JSON.stringify(msg);
  socket.write(`\n>> SERVER: ${out}\n`);
};

const serverTCP = net.createServer((socketCliente) => {
  socketCliente.setEncoding("utf8");
  let tokenSession = null;
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
        tokenSession = tokenIngresado;
        sendServer(
          socketCliente,
          "Bienvenido, comandos disponibles\n1-getosinfo <seconds>\n2-watch <path> [time]\n3-getwatches <token>\n4-ps\n5-oscmd <command>\n6-snapshot\n7-quit\n",
        );
      } else {
        sendServer(
          socketCliente,
          "Token invalido, ingrese un token valido antes de comenzar a interactuar: token <token_valido>",
        );
      }
    } else if (tokenSession) {
      // comandos despues de login
      if (cmd[0] === "getosinfo") {
        console.log(`${cliName(socketCliente)} ejecuto el comando getosinfo`);
        const seconds = parseInt(cmd[1]) || 3600;
        const resultado = comandos.getOsInfo(seconds);
        sendServer(socketCliente, resultado);
      } else if (cmd[0] === "watch") {
        console.log(`${cliName(socketCliente)} ejecuto el comando watch`);

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
      } else if (cmd[0] === "getwatches") {
        console.log(`${cliName(socketCliente)} ejecuto el comando getwatches`);

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
      } else if (cmd[0] === "ps") {
        console.log(`${cliName(socketCliente)} ejecuto el comando ps`);
        sendServer(socketCliente, comandos.ps());
      } else if (cmd[0] === "oscmd") {
        console.log(
          `${cliName(socketCliente)} ejecuto el comando ${cmd[1]} mediante oscmd`,
        );

        const respComando = comandos.oscmd(cmd.slice(1));
        if (respComando == 1) {
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
      } else if (cmd[0] === "snapshot") {
        console.log(`${cliName(socketCliente)} ejecuto el comando snapshot`);
        comandos
          .snapshot()
          .then((resultado) => sendServer(socketCliente, resultado));
      } else if (cmd[0] === "quit") {
        sendServer(socketCliente, "Quiteando...");
        socketCliente.end();
      } else {
        sendServer(
          socketCliente,
          "Comando no reconocido. omandos disponibles\n1-getosinfo <seconds>\n2-watch <path> [time]\n3-getwatches <token>\n4-ps\n5-oscmd <command>\n6-snapshot\n7-quit\n",
        );
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
