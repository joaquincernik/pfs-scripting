import fs from "fs/promises";

const data = await fs.readFile("./auth/tokens.txt", "utf-8");
const tokensPosibles = data.split(",");

export function checkToken(token) {
  if (tokensPosibles.includes(token)) return true;
  return false;
}

export const cliName = (socket) => {
  return `${socket.remoteAddress}:${socket.remotePort}`;
};

export const sendServer = (socket, msg) => {
  const out = typeof msg === "string" ? msg : JSON.stringify(msg);
  socket.write(`\n>> SERVER: ${out}\n`);
};
