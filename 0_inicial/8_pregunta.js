const readLine=require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)
readLine.question('Ingrese la edad ', dato => {
    console.log(`
        Edad: ${dato}
        bal bla bla
    `);
    readLine.close()
})