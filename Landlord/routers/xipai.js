Carcd={}


Carcd.Shuff=function (data){
    //获取数组长度
    var arrlen = data.length;
    //创建数组 存放下标数
    var try1 = new Array();
    for(var i = 0;i < arrlen; i++){
        try1[i] = i;
    }
    //创建数组 生成随机下标数
    var try2 = new Array();
    for(var i = 0;i < arrlen; i++){
        try2[i] = try1.splice(Math.floor(Math.random() * try1.length),1);
    }
    //创建数组，生成对应随机下标数的数组
    var try3 = new Array();
    for(var i = 0; i < arrlen; i++){
        try3[i] = data[try2[i]];
    }
    return try3;
}

//分牌
Carcd.tocarcd=function(pai){
	var Arrary= new Array();
	
	for(var k=0;k<4;k++){
		Arrary[k]=new Array();
	}
	
	for(var i=0;i<pai.length;i++){
		if(i<17){
			Arrary[0].push(pai[i]);
		}
		if(i>=17&&i<34){
			Arrary[1].push(pai[i]);
		}
		if(i>=34&&i<51){
			Arrary[2].push(pai[i]);
		}
		if(i>=51&&i<54){
			Arrary[3].push(pai[i]);
		}
	}
	return Arrary;
}

module.exports=Carcd;