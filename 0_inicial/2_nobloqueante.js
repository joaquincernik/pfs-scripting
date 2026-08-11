const fs=require('fs');
fs.readFile('/etc/hosts', (err, contenido)=>{
    if (!err) 
        console.log(contenido.toString())
    else
        console.log(`Error leyendo archivo ${err}`)
} );
console.log('Otra cosa....')