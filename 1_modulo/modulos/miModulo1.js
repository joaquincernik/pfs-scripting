let a,b=0;
const setA=(v)=>{a=v;}
const setB=(v)=>{b=v;}
const sumaNumeros=()=>{return a+b;}
const potenciaA=()=>{return a*a;}
module.exports={
    setA:setA,
    setB:setB,
    suma:sumaNumeros,
    potenciaA:potenciaA,
    toString:()=>{ return `a=${a}, b=${b}`}
}