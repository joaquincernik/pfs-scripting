const EventEmitter=require('events').EventEmitter

const logger=new EventEmitter()

logger.on('trace', msg=>{ console.log(`[TRACE] ${new Date().toISOString()}: ${msg} `) })
logger.on('debug', msg=>{ console.log(`[DEBUG] ${new Date().toISOString()}: ${msg} `) })
logger.on('error', msg=>{ console.log(`[ERROR] ${new Date().toISOString()}: ${msg} `) })

logger.emit('debug', new Date())
logger.emit('trace', JSON.stringify( {a:true, b:[1,false,[1,'a']]},4  ))
logger.emit('debug', 'Simple debug')