var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');


function md53(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex");
}

var key = "42dfcb34fb02d8cd";

//var Newtime =Date.parse(new Date())/1000;

var webGetUser = function(req,callback){
	var sendStr = '0';
	
	if (req.body.act == "webGetUser"){
		//获取用户
		
		if (req.body.account && req.body.time && req.body.sign)
		{
			//验证md5
			var content = req.body.act + req.body.account + req.body.time + key;	
			if (md53(content) != req.body.sign){
				sendStr = '{"status":1,"msg":"参数不正确!"}'
				callback(sendStr);
				return;
			}
			
			gameInfo.webGetUser(req.body.account,function(result){
				if (result.code){
					sendStr = '{"status":0,"msg":"","data":{"account":"'+ req.body.account +'","ticket":'+result.ticket+',"nickname":"'+result.nickname+'","userId":"'+result.userId+'"}}'
					callback(sendStr);
					return
				}else{
					sendStr = '{"status":1,"msg":"查询错误"}'
					callback(sendStr);
					return
				}
			})
		}else{
			sendStr = '{"status":4,"msg":"参数不正确!"}'
			
			callback(sendStr);
			return
		}
	}else if(req.body.act == "webShopBuy"){
		//验证md5
		var content = req.body.act + req.body.userId + req.body.productId + req.body.count + req.body.time + key;	
		if (md53(content) != req.body.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}
		//验证成功
		gameInfo.shopBuy(req.body.userId,parseInt(req.body.productId),parseInt(req.body.count),function(result){
			sendStr = '{"status":1,"msg":"购买失败,未知原因"}';

			switch(result){
				case 0:
					sendStr = '{"status":0,"msg":"购买成功"}';
					break;
				case 1:
					sendStr = '{"status":2,"msg":"购买失败,礼品券不足"}';
					break;
				case 2:
					sendStr = '{"status":3,"msg":"购买失败,商品ID不存在"}';
					break;
				case 3:
					sendStr = '{"status":4,"msg":"购买失败,所货地址不存在"}';
					break;
				case 4:
					sendStr = '{"status":5,"msg":"数据库操作失败"}';
					break;	
				case 5:
					sendStr = '{"status":6,"msg":"用户ID错误"}';
					break;
			}
			callback(sendStr);
		});
		
		
	}else{
		sendStr = '{"status":3,"msg":"参数不正确!"}'
		callback(sendStr);
		return
	}
}


module.exports = webGetUser;