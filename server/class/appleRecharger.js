var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');
var log = require("./loginfo").getInstand;
var https=require('https');

var key = "42dfcb34fb02d8cd";

var appleRecharge = function(req,callback){
    var bit= req.body.receipt_key;
    var userid = req.body.userid;
    var verify= JSON.stringify({ 'receipt-data':bit});
    //log.info(verify);
    var appstore_optios = {
			hostname: 'sandbox.itunes.apple.com',
			port: 443,
			path: '/verifyReceipt',
			method: 'POST',
			headers:{
			'Content-Type' : 'Keep-Alive',
			'Content-Length':verify.length
		}
    };
	var req = https.request(appstore_optios,function(res){
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
				var product_id = 0;
				var htmldata = JSON.parse(data.toString());

				switch(htmldata.status){
				case 0:
					
					if (htmldata.receipt.in_app.length > 0){
						product_id = htmldata.receipt.in_app[0].product_id;
					}
					console.log(htmldata.receipt.in_app);
					break;
				case 21000 :
					callback("App Store无法读取你提供的JSON数据")
					break;
				case 21002 :
					callback("收据数据不符合格式")
					break;
				case 21003:
					callback("收据无法被验证")
					break;
				case 21004 :
					callback("你提供的共享密钥和账户的共享密钥不一致 ")
					break;
				case 21005 :
					callback("收据服务器当前不可用")
					break;
				case 21006 :
					callback("收据是有效的，但订阅服务已经过期。当收到这个信息时，解码后的收据信息也包含在返回内容中 ")
					break;
				case 21007 :
					callback("收据信息是测试用（sandbox），但却被发送到产品环境中验证")
					break;
				case 21008 :
					callback("收据信息是产品环境中使用，但却被发送到测试环境中验证")
					break;
				}
			}
			catch(e){
				console.log('post BoSenWebServer error..');
			}

		        var userInfo = {};
		        switch(product_id){
		            case '06':
		            	userInfo = {sendUserId:userid,sendCoin:600,change_type:0};
						break;
					case '018':
						userInfo = {sendUserId:userid,sendCoin:1800,change_type:0};
						break;
					case '050':
						userInfo = {sendUserId:userid,sendCoin:5000,change_type:0};
						break;
					case '02':
						userInfo = {sendUserId:userid,sendCoin:9800,change_type:0};
						break;
					case '0198':
						userInfo = {sendUserId:userid,sendCoin:19800,change_type:0};
						break;
		        }
		        console.log(userInfo);
		        if (userInfo.sendCoin && userInfo.sendCoin > 0){
		        	gameInfo.GameBalance(userInfo);
		        	callback("充值成功");
		        }else{
		        	callback("充值失败");
		        }

		});
	});
	req.write(verify); 
	req.end();
}



module.exports = appleRecharge;