var Gameconfig=require('../config/gameConfig.js');

var xipai = require('./xipai.js');




var xixi=xipai.Shuff(Gameconfig.carcd);

//console.log(xixi)
var Array=xipai.tocarcd(xixi)

console.log(Array[0],Array[1],Array[2],Array[3])