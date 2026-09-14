import { fetchDB } from "./fetchDB.mjs";
const fileToPath = process.argv[2]
const cantidad = process.argv[3]
await fetchDB.fetch(fileToPath,cantidad)