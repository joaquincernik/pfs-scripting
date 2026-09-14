import fs from "node:fs/promises";
import path from "node:path";
import axios from "axios";
export const fetchDB = {
  ptf: null,
  fd: null,
  cantidad: 1,
  setPaginaCantidad(num) {
    this.cantidad = num;
  },
  async setFile(pathToFile) {
    this.ptf = pathToFile;
    try {
      const fileExistente = await fs.readFile(pathToFile);
      let jsonExistente = JSON.parse(fileExistente);
    } catch (error) {
      this.fd = await fs.writeFile(
        pathToFile,
        JSON.stringify([], null, 2),
        "utf-8",
      );
    }
  },
  async fetch(pathToFile, cantidad) {
    try {
      await this.setFile(pathToFile);
      this.setPaginaCantidad(cantidad);
      let callApi = await axios.get(
        `https://randomuser.me/api/?results=${this.cantidad}`,
      );
      const nuevosUsuarios = callApi.data.results;
      const contenidoActual = await fs.readFile(this.ptf, "utf-8");
      const jsonExistente = JSON.parse(contenidoActual);

      jsonExistente.push(...nuevosUsuarios);

      // 4. Sobrescribir el archivo con el JSON formateado y actualizado
      await fs.writeFile(
        this.ptf,
        JSON.stringify(jsonExistente, null, 2),
        "utf-8",
      );
    } catch (e) {
      console.log("====================================");
      console.log(e);
      console.log("====================================");
    }
  },
};
