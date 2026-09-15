import mqtt from 'mqtt';
import fs from 'fs'
import path from 'path';

const host = process.env.MQTT_HOST || 'localhost';
const port = process.env.MQTT_PORT || 1883;
const topic = process.env.TOPIC || "camara/snapshot";
const cred = {
    username: process.env.MQTTUSERNAME || 'ubuntu',
    password: process.env.MQTTPASSWORD || 'ubuntu'
}

const clientId=`mqtt_${Math.random().toString(16).slice(2)}`
const connectUrl=`mqtt://${host}:${port}`
const clientConfig = {
    ...cred,
    clientId: clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
}
console.log(`Conectando a ${connectUrl}....`)

function guardarImagenBase64(base64Data) {
    try {
        const imageBuffer = Buffer.from(base64Data, 'base64'); //convertimos a byffer
        let nombreCarpeta = new Date().toISOString()
        let nombreArchivo = `${nombreCarpeta}.jpg`
        fs.mkdirSync(nombreCarpeta, { recursive: true });
        fs.writeFileSync(path.join(nombreCarpeta, nombreArchivo), imageBuffer);
        console.log(`Imagen guardada exitosamente en: ${nombreCarpeta}`);
        return true;
    } catch (error) {
        console.error("Error al guardar la imagen:", error);
        return false;
    }
}


const client = mqtt.connect(connectUrl, clientConfig)
client.on('connect', ()=> {
    console.log(`Connectado exitosamente a ${connectUrl}!!!`)
    client.subscribe([topic],()=>{
        console.log(`Suscrito a ${topic}`)
    })
})

client.on('message',(topic, payload)=>{
    //console.log(`Mensaje recibido ${payload.toString()} - ${topic}`)
    guardarImagenBase64(payload)
})
