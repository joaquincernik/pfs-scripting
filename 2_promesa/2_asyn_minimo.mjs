import fetch from 'node-fetch';


const cantidad=1





const fetchUserData=async (cantidad=1)=>{
    const url=`https://randomuser.me/api/?results=${cantidad}`;
    console.log('Pidiendo datos a: \n'+url)
    const respuesta=await fetch(url);
    const datosJson= await respuesta.json()
    return datosJson;
} 

const resultado= await fetchUserData(3);
console.log("datos --------------------------------------------------------")
console.log(JSON.stringify(resultado,null,2))