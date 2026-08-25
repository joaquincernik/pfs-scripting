const net = require('net');
const fs = require('fs');
const fileStream = fs.createReadStream('/etc/hosts');
const puerto = process.env.PUERTO;

const cliName=(socket) => {
    return `${socket.remoteAddress}:${socket.remotePort}`;
}

const serverTCP=net.createServer(
    socketCliente => {
        socketCliente.setEncoding('utf8');
        console.log(`Se conectó el cliente ${cliName(socketCliente)}`);
        socketCliente.write("Hola, comandos disponibles:\n-getfile\n");

        socketCliente.on('data', datos=>{
            console.log(`${cliName(socketCliente)}: ${datos}`);
            if(datos.trim()=='getfile') {
                console.log('Comando get file');
                fileStream.pipe(socketCliente, {end:false});
                fileStream.on('end',()=>{
                    socketCliente.write('\n');
                })
            } else {
                socketCliente.write("Hola, comandos disponibles:\n-getfile\n");
            }
        })
    }
)
serverTCP.listen(puerto);

console.log(`Server escuchando en puerto ${puerto}`);

/*
/etc/hosts =======> +
                    |
cliente <========== +

*/