import fetch from 'node-fetch'

const cantidad=1
const url=`https://randomuser.me/api/?results=${cantidad}`

console.log('Pidiendo datos a: \n'+url)

fetch(url)
    .then(respuesta=>respuesta.json())
    .then(datosJson=>{
        resultado=datosJson
        console.log("Datos -------------------------------------------------------------")
        console.log(JSON.stringify(resultado,null,2))
    })
    .catch(e=>{err=e})

