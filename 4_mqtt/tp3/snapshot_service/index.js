import mqtt from 'mqtt';
import net from 'net'
import {exec} from 'child_process'
import fs from 'fs'
const host = process.env.HOST || 'mqtt_pfs';
const mqtt_port = process.env.MQTT_PORT || 1883 
const port = process.env.PORT || 5000;
const topic = process.env.TOPIC || 'camara/snapshot'
const cred = {
    username: process.env.MQTTUSERNAME || 'ubuntu',
    password: process.env.MQTTPASSWORD || 'ubuntu'
}

const clientId=`mqtt_${Math.random().toString(16).slice(2)}`

const connectUrl=`mqtt://${host}:${mqtt_port}`

const clientConfig = {
    ...cred,
    clientId: clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
}

const client = mqtt.connect(connectUrl, clientConfig)

client.on('connect', ()=> {
    //console.log(`Connectado exitosamente a ${connectUrl}!!!`)
    client.subscribe([topic],()=>{
      console.log(`Suscrito a ${topic}`)
    })
})
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const command = data.toString().trim();
    if (command === 'snapshot') {
      const ffmpegCmd = 'ffmpeg -f v4l2 -i /dev/video0 -vf "select=gte(n\\,30)" -frames:v 1 -y foto.jpg';
      
      exec(ffmpegCmd, (err) => {
        if (err) {
          console.error('Error al tomar la foto:', err);
          socket.write('ERROR: No se pudo capturar la imagen\n');
          return;
        }

        const imageBuffer = fs.readFileSync('foto.jpg');
        const base64Image = imageBuffer.toString('base64');

        client.publish(topic, base64Image, () => {
          console.log(`Foto publicada en el tópico ${topic}`);
          socket.write('OK\n');
        });
      });
    } else {
      socket.write('Comando no reconocido\n');
    }
  });
});

server.listen(port, () => console.log(`Servidor TCP listo en el puerto ${port}`));

/*const idInterval = setInterval( 
    () => {
        client.publish(topic,
            `Mensaje emitido en ${new Date().toISOString()}`,
            {qos:0, retain:false},
            (err)=>{
                if (err) {
                    console.log(err)
                }
            }
        )
    }
    , 2000
)*/