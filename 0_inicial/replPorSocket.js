const PORT=1234; 
const repl=require('repl');
const net=require('net');
const server=net.createServer(
    (socket)=>{
        repl.start('vía socket> ',socket);
    }
);
console.log(`Servidor REPL escuchando en ${PORT}`);
server.listen(PORT);


// P1 |socket| -------------------------------------------------> P2
//    |      | <-------------------------------------------------