let variable=0;
const setVariable=(v)=>{variable=v;}
const getVariable=()=>{return variable;}
module.exports={
    setVariable:setVariable,
    getVariable:getVariable,
    setV:setVariable
}