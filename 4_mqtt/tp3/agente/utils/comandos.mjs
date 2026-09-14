import { collector } from "./dataCollector.mjs";
import { watcherManager } from "./watcherManager.mjs";
import { execSync } from "child_process";
import { connect } from "net";

const COMANDOS_PERMITIDOS = ["df", "uptime", "free", "ls", "touch", "mkdir", "pwd"];
export const comandos = {
  getOsInfo(seconds = 3600) {
    const data = collector.getData(seconds);
    return {
      err: false,
      command: "getosinfo",
      content: data,
    };
  },

  watch(path, time) {
    const token = watcherManager.watch(path, time);
    if (!token) {
      return {
        err: true,
        command: "watch",
        content: "ruta inválida o no es un directorio",
      };
    }
    return { err: false, command: "watch", content: { token } };
  },

  getWatches(token) {
    const events = watcherManager.getWatches(token);
    if (events === null) {
      return {
        err: true,
        command: "getwatches",
        content: "token de seguimiento inválido",
      };
    }
    return { err: false, command: "getwatches", content: events };
  },
  ps() {
    try {
      const stdout = execSync("ps", { encoding: "utf8" });
      return { err: false, command: "ps", content: stdout };
    } catch (error) {
      return { err: true, command: "ps", content: error.message };
    }
  },
  oscmd(command) {
    if (!COMANDOS_PERMITIDOS.includes(command[0])) {
      return 1;
    }
    try {
      const stdout = execSync(command.join(" "), { encoding: "utf8" });
      return { err: false, command: "oscmd", content: stdout };
    } catch (error) {
      return { err: true, command: "oscmd", content: error.message };
    }
  },
  snapshot() {
    return new Promise((resolve) => {
      const host = process.env.SNAPSHOT_HOST || "127.0.0.1";
      const port = parseInt(process.env.SNAPSHOT_PORT || "5000", 10);
      const socket = connect({ host, port });
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ err: true, command: "snapshot", content: "timeout: el contenedor snapshot no respondio" });
      }, 30000);

      socket.on("connect", () => socket.write("snapshot\n"));
      socket.on("data", (data) => {
        const resp = data.toString().trim();
        clearTimeout(timeout);
        socket.destroy();
        if (resp.toUpperCase().startsWith("OK")) {
          resolve({ err: false, command: "snapshot", content: "foto tomada y publicada en camara/snapshot" });
        } else {
          resolve({ err: true, command: "snapshot", content: resp });
        }
      });
      socket.on("error", (e) => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({ err: true, command: "snapshot", content: e.message });
      });
    });
  },
};
