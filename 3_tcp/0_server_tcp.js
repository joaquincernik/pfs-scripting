const net =require('net');

const puerto=process.env.PUERTO || 7777;

const clitName=(socket) => { return `${socket.remoteAddress}:${socket.remotePort}` }

const serverTCP = net.createServer(
    socketCliente => {
        console.log(`Se conectó el cliente ${clitName(socketCliente)}`)
        socketCliente.write("Hola Cliente!\n")
        socketCliente.on('data', datos=>{
            console.log(`${clitName(socketCliente)}: ${datos}`)
            socketCliente.write(`Echo: ${datos}`)
        })
        // establecer las tareas de los escuchadores y eventualmente emitir eventos
    }
)

serverTCP.listen(puerto)

console.log(`Server escuchando en puerto ${puerto}`)


/*
while(true) {
    Socket soc=ServerSocket.accept(); <---- bloqueante 
    // atencion al cliente
    // --------->
    // <---------
    Atencion atencion=new Atencion(soc);
    atencion.start(); // de extends Thread
    new Thread(atencion).start() // de implements Runnable
}
class Atencion extends Thread or implements Runnable{
    ....
}
*/



