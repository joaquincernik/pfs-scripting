import { collector } from "./dataCollector.mjs";
import { watcherManager } from "./watcherManager.mjs";
import { execSync } from "child_process";

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
};
