import fs from 'fs';
const archivo="salida.json"
fs.writeFileSync(archivo, "[");
for (let i=0; i<10; i++) {
    let coma= i<9 ? ',' : '';
    fs.appendFileSync(archivo, `{"i":${i}}${coma}`)
}

fs.appendFileSync(archivo, "]");
