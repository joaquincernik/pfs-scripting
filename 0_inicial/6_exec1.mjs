import {spawn as procExterno} from 'child_process'


const ls=procExterno('ls', ['-lsh'])

ls.stdout.setEncoding('utf-8')

ls.stdout.on('data',data=>{ console.log(data) })

ls.on('close', errorLevel=>{
    console.log(`Fin del proceso, errorLevel=${errorLevel}`)
})