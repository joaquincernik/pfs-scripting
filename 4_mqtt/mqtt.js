import mqtt from 'mqtt';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 1883;

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

const client = mqtt.connect(connectUrl, clientConfig)

const topic = 'test'

client.on('connect', ()=> {
    console.log(`Connectado exitosamente a ${connectUrl}!!!`)
    client.subscribe([topic],()=>{
        console.log(`Suscrito a ${topic}`)
    })
})

client.on('message',(topic, payload)=>{
    console.log(`Mensaje recibido ${payload.toString()} - ${topic}`)
})

const idInterval = setInterval( 
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

)