import fetch from 'node-fetch';


const cantidad=1





const fetchUserData=(cantidad=1)=>{
    const url=`https://randomuser.me/api/?results=${cantidad}`;
    console.log('Pidiendo datos a: \n'+url)
    return fetch(url)
        .then(respuesta=>respuesta.json())
        .then(datosJson=>{return datosJson})
        .catch(e=>{return e})
} 

const resultado= await fetchUserData(3);
console.log("datos --------------------------------------------------------")
console.log(JSON.stringify(resultado,null,2))