var http = require('http');
var https = require('https');
var crypto = require('crypto');
var querystring = require("querystring");
var dao = require("./../dao/dao")
var log = require("./loginfo").getInstand;
var gameInfo = require('./../class/game').getInstand;

var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }

    console.log(ip)
    if(ip.split(':').length>0){
        ip = ip.split(':')[3]
    }
    return ip;
};

function md53(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex");
}


var Post = {};
Post.postExchange = function(_info,callback){
	//callback(true);
	var md5string = _info.Account + _info.PhoneNo + _info.OrderId + _info.Key;
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	_info.Sign = md5_sign.digest('hex');

	var reqData = querystring.stringify({
 		Type:_info.Type,
 		Account:_info.Account,
 		PhoneNo:_info.PhoneNo,
 		OrderId:_info.OrderId,
 		CardNum:_info.CardNum,
 		Sign:_info.Sign
	});
 
	var url = "http://www.bosengame.com:8088/BoSenWebServer.aspx?" + reqData;

	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
				if (htmldata.Result.Status == 0){
					callback(true);
				}else{
					callback(false);
				}
			}
			catch(e){
			  console.log('post BoSenWebServer error..');
			}

	        //console.log(htmldata)
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			callback(false);
	});
}

Post.postExchangeCoin = function(_info,callback){
	console.log("111");
	var md5string = _info.out_biz_no + _info.payee_account + _info.amount + _info.payee_real_name +  _info.Key;
	_info.Sign = md53(md5string);

	var reqData = querystring.stringify({
 		out_biz_no:_info.out_biz_no,
 		payee_account:_info.payee_account,
 		amount:_info.amount,
 		payee_real_name:_info.payee_real_name,
 		sign:_info.Sign
	});

	var appstore_optios = {
		hostname: 'localhost',
		port: 80,
		path: '/ali/index.php',
		method: 'POST',
		headers:{
		'Content-Type' : 'application/x-www-form-urlencoded',
		'Content-Length':reqData.length
		}
	};
	var req = http.request(appstore_optios,function(res){
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			//try{
				console.log(data.toString());
				var htmldata = JSON.parse(data.toString());
				if (!htmldata.code){
					//成功
					callback(1,htmldata.message);
					
				}else{
					log.info(htmldata.message)
					callback(0,htmldata.message);
				}
			//}
			//catch(e){
			//	console.log('post /ali/index error..');
			//}


		});
	});
	req.write(reqData);
	req.end();
}

Post.postCheckZhifubo = function(_info,callback){
	var md5string = _info.out_biz_no + _info.payee_account + _info.amount + _info.payee_real_name +  _info.Key;
	_info.Sign = md53(md5string);

	var reqData = querystring.stringify({
 		out_biz_no:_info.out_biz_no,
 		payee_account:_info.payee_account,
 		amount:_info.amount,
 		payee_real_name:_info.payee_real_name,
 		sign:_info.Sign
	});

	var appstore_optios = {
		hostname: 'localhost',
		port: 80,
		path: '/ali/index.php',
		method: 'POST',
		headers:{
		'Content-Type' : 'application/x-www-form-urlencoded',
		'Content-Length':reqData.length
		}
	};
	var req = http.request(appstore_optios,function(res){
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			//try{
				console.log(data.toString());
				var htmldata = JSON.parse(data.toString());
				if (!htmldata.code){
					//成功
					callback(1);
					
				}else{
					log.info(htmldata.message)
					callback(0);
				}
			//}
			//catch(e){
			//	console.log('post /ali/index error..');
			//}


		});
	});
	req.write(reqData);
	req.end();
}

Post.postbindPhone = function(_info,callback){
	console.log(_info)
	var md5string = _info.Account +  _info.PhoneNo +  _info.Key;
	console.log(md5string)
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	_info.Sign = md5_sign.digest('hex');

	var reqData = querystring.stringify({
 		Type:_info.Type,
 		Account:_info.Account,
 		PhoneNo:_info.PhoneNo,
 		Messages:_info.checkNo,
 		Sign:_info.Sign
	});
 
	var url = "http://www.bosengame.com:8088/BoSenWebServer.aspx?" + reqData;
	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
				if (htmldata.Result.Status == 0){
					callback(true);
				}else{
					callback(false);
				}
			}
			catch(e){
			  console.log('post BoSenWebServer error..');
			}
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			callback(false);
	});
}

Post.sendApi = function(userid){
	var md5string = userid + "87bb72342a3344c2";
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	var Sign = md5_sign.digest('hex');


	var reqData = querystring.stringify({
 		merid:userid,
 		keycode:Sign
	});

	var url = "http://120.76.200.182:3210/qureyU.aspx?" + reqData;
	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
			}
			catch(e){
			  console.log('post qureyU error..');
			}
	        //console.log(htmldata)
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			//callback(false);
	});
}





Post.rechargeRfupay = function(info,callback){

	if (!info.userId){
		callback(0,"",'{"status":1,"msg":"用户ID未传入!"}');
		return;
	}

	// if (!info.totalFee || info.totalFee < 1000){
	// 	callback(0,"",'{"status":2,"msg":"充值金额不符合规定"}');
	// 	return;
	// }

	if (!info.totalFee){
		callback(0,"",'{"status":2,"msg":"充值金额不符合规定"}');
		return;
	}

	// if (!(info.payType == "2000" || info.payType == "2001")){
	// 	callback(0,"",'{"status":3,"msg":"充值类型无法识别"}')
	// 	return;
	// }


	// if (!info.platform){
	// 	info.platform = 0;
	// }


	if (!info.Account){
		info.Account = "";
	}
	
	//生成订单号
	var myDate = new Date();
	var out_trade_no = String(myDate.getFullYear()) + String(myDate.getMonth() + 1) + String(myDate.getDate()) + String(myDate.getTime()) + todayId;
	if (todayId > 10000){
		todayId = 0;
	}

	todayId++;
	var userInfo = {userId:info.userId,Account:info.Account,total_fee:info.totalFee,out_trade_no:out_trade_no,goodsid:0};
	var self = this;
	//直接操作数据库
	dao.create_rechargeSDK(userInfo,function(Rusult){
		if (Rusult){
				var url = "https://payment.rfupayadv.com/prod/commgr/control/inPayService";
				//商户
				var partyId = "gateway_HARFT001392";
				//类型
				var accountId = "gateway_HARFT001392001";
				var appType = "ALIPAY";
				var orderNo = out_trade_no;
				var orderAmount = 2;
				var goods = "1";
				var returnUrl = "84a2d81cece00769f82c0ab26d224ff2";
				var checkUrl = "http://www.baidu.com";
				var cardType = "";
				var bank = "";
				var encodeType = "Md5";
				var refCode = "";
				var signMD5 = "";
				var key = "03636fbed3269041648f7e754ae7265e08c60316845bc58c605992f816f877799d461d218e06b42850e3ae839d51da8f4ddce5cb6cd46e3796d435944ee4632f10cef1ee01aeef338bd5caad86a44b5e";
				var signConten = "orderNo"+out_trade_no+"appType"+appType+"orderAmount"+orderAmount+ "encodeType" + encodeType + key;
				//console.log(signConten)
				var md5_sign = crypto.createHash('md5');
				md5_sign.update(signConten);
				signMD5 = md5_sign.digest('hex');
				var postdata = "partyId=" + partyId + "&accountId=" + accountId + "&appType=" + appType + "&orderNo=" + orderNo + "&orderAmount=" + orderAmount + "&goods=" + goods + "&returnUrl=" + returnUrl + "&checkUrl=" + checkUrl + "&cardType=" + cardType + "&bank=" + bank + "&encodeType=" + encodeType + "&refCode=" + refCode + "&signMD5=" + signMD5;

				//var url2 = url+"?appId="+appId+"&partnerId="+partnerId+"&imsi="+imsi+"&deviceCode="+deviceCode+"&channelOrderId="+channelOrderId+"&platform="+platform+"&body="+body+"&detail="+detail+"&totalFee="+totalFee+"&attach="+attach+"&payType="+payType+"&timeStamp="+timeStamp+"&sign="+sign+"&notifyUrl="+notifyUrl+"&returnUrl="+returnUrl+"&clientIp="+clientIp;
			    var appstore_optios = {
						hostname: 'payment.rfupayadv.com',
						port: 443,
						path: '/prod/commgr/control/inPayService',
						method: 'POST',
						headers:{
						'Content-Type' : 'application/x-www-form-urlencoded',
						'Content-Length':postdata.length
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
							console.log(data.toString());
							callback(1,"",data.toString());
							//var htmldata = JSON.parse(data.toString());

							// switch(htmldata.status){
							// case 0:
								
							// 	if (htmldata.receipt.in_app.length > 0){
							// 		product_id = htmldata.receipt.in_app[0].product_id;
							// 	}
							// 	console.log(htmldata.receipt.in_app);
							// 	break;
							// case 21000 :
							// 	callback("App Store无法读取你提供的JSON数据")
							// 	break;
							// case 21002 :
							// 	callback("收据数据不符合格式")
							// 	break;
							// case 21003:
							// 	callback("收据无法被验证")
							// 	break;
							// case 21004 :
							// 	callback("你提供的共享密钥和账户的共享密钥不一致 ")
							// 	break;
							// case 21005 :
							// 	callback("收据服务器当前不可用")
							// 	break;
							// case 21006 :
							// 	callback("收据是有效的，但订阅服务已经过期。当收到这个信息时，解码后的收据信息也包含在返回内容中 ")
							// 	break;
							// case 21007 :
							// 	callback("收据信息是测试用（sandbox），但却被发送到产品环境中验证")
							// 	break;
							// case 21008 :
							// 	callback("收据信息是产品环境中使用，但却被发送到测试环境中验证")
							// 	break;
							//}
						}
						catch(e){
							console.log('post BoSenWebServer error..');
						}

					   //      var userInfo = {};
					   //      switch(product_id){
					   //          case '6':
					   //          	userInfo = {sendUserId:userid,sendCoin:60000,change_type:0};
								// 	break;
								// case '18':
								// 	userInfo = {sendUserId:userid,sendCoin:180000,change_type:0};
								// 	break;
								// case '50':
								// 	userInfo = {sendUserId:userid,sendCoin:500000,change_type:0};
								// 	break;
								// case '2':
								// 	userInfo = {sendUserId:userid,sendCoin:1000000,change_type:0};
								// 	break;
								// case '198':
								// 	userInfo = {sendUserId:userid,sendCoin:2000000,change_type:0};
								// 	break;
					   //      }
					   //      console.log(userInfo);
					   //      if (userInfo.sendCoin && userInfo.sendCoin > 0){
					   //      	gameInfo.GameBalance(userInfo);
					   //      	callback("充值成功");
					   //      }else{
					   //      	callback("充值失败");
					   //      }

					});
				});
				//console.log(postdata)
				req.write(postdata); 
				req.end();
				// http.get(url2, function(res) {
				// var size = 0;
				// var chunks = [];

				// res.on('data', function(chunk){
				//   size += chunk.length;
				//   chunks.push(chunk);
				// });

				// res.on('end', function(){
				//   var data = Buffer.concat(chunks, size);
				//   try{
				//       var htmldata = JSON.parse(data.toString());
				//       if (!htmldata.return_code){
				//       	callback(1,htmldata.payParam.pay_info,"");
				//       }
				//       else{
				//       	console.log(htmldata)
				//       	callback(0,"",'{"status":6,"msg":"'+ htmldata.return_msg +'"}');
				//       }
				//   }
				//   catch(e){
				//     console.log('post rechargeZhifuBao error..');
				//     callback(0,"",'{"status":4,"msg":"充值接口异常"}');
				//   }
				//       //console.log(htmldata)
				// });

				// }).on('error', function(e) {
				//   console.log("Got error: " + e.message);
				//   callback(0,"",'{"status":5,"msg":"充值接口异常"}');
				// });
		}
		else{
		//失败
			callback(0,"",'{"status":4,"msg":"创建订单失败"}');
		}
	});
}

Post.outCoin = function(info,callback){

		var url = "https://portal.rfupay.com/Main/api_paidout/submitPaidout";
		var partyId = "gateway_HARFT001392";
		//类型
		var accountId = "gateway_HARFT001392001";
		var directPaidout = 1
		var paidoutPassword = "NAIaklPX0p";
		var content = "json";
		var orderNo = 2;
		var bankName = "招商银行";
		var provice = "";
		var data = '{"partyId":"gateway_D00029","accountId":"gateway_D00029001","note":"DEMO TESTING","directPaidout":"1","paidoutPassword":"QETadgZCB","content":[{"orderNo":"ZZZ20170214115936","bankName":"招商银行","provice":"广东","city":"深圳","branch":"深圳罗湖支行","payee_name":"陳大文","payee_card":"6214837830927483","amount":"10.00","refCode":"00000000","remark":"","signMd5":"1d37dcd8506d2a1980005ac21ee7bc71"}]}';
		// var returnUrl = "84a2d81cece00769f82c0ab26d224ff2";
		// var checkUrl = "www.baidu.com";
		// var cardType = "";
		// var bank = "";
		// var encodeType = "Md5";
		// var refCode = "";
		// var signMD5 = "";
		// var key = "03636fbed3269041648f7e754ae7265e08c60316845bc58c605992f816f877799d461d218e06b42850e3ae839d51da8f4ddce5cb6cd46e3796d435944ee4632f10cef1ee01aeef338bd5caad86a44b5e";
		// var signConten = "orderNo"+out_trade_no+"appType"+appType+"orderAmount"+orderAmount+ "encodeType" + encodeType + key;
		// //console.log(signConten)
		// var md5_sign = crypto.createHash('md5');
		// md5_sign.update(signConten);
		// signMD5 = md5_sign.digest('hex');
		// var postdata = "partyId=" + partyId + "&accountId=" + accountId + "&appType=" + appType + "&orderNo=" + orderNo + "&orderAmount=" + orderAmount + "&goods=" + goods + "&returnUrl=" + returnUrl + "&checkUrl=" + checkUrl + "&cardType=" + cardType + "&bank=" + bank + "&encodeType=" + encodeType + "&refCode=" + refCode + "&signMD5=" + signMD5;

		// //var url2 = url+"?appId="+appId+"&partnerId="+partnerId+"&imsi="+imsi+"&deviceCode="+deviceCode+"&channelOrderId="+channelOrderId+"&platform="+platform+"&body="+body+"&detail="+detail+"&totalFee="+totalFee+"&attach="+attach+"&payType="+payType+"&timeStamp="+timeStamp+"&sign="+sign+"&notifyUrl="+notifyUrl+"&returnUrl="+returnUrl+"&clientIp="+clientIp;
	 //    var appstore_optios = {
		// 		hostname: 'payment.rfupayadv.com',
		// 		port: 443,
		// 		path: '/prod/commgr/control/inPayService',
		// 		method: 'POST',
		// 		headers:{
		// 		'Content-Type' : 'application/x-www-form-urlencoded',
		// 		'Content-Length':postdata.length
		// 	}
	 //    };
		// var req = https.request(appstore_optios,function(res){
		// 	var size = 0;
		// 	var chunks = [];

		// 	res.on('data', function(chunk){
		// 		size += chunk.length;
		// 		chunks.push(chunk);
		// 	});

		// 	res.on('end', function(){
		// 		var data = Buffer.concat(chunks, size);
		// 		try{
		// 			var product_id = 0;
		// 			console.log(data.toString());
		// 			callback(1,"",data.toString());
		// 			//var htmldata = JSON.parse(data.toString());
		// 		}
		// 		catch(e){
		// 			console.log('post BoSenWebServer error..');
		// 		}



		// 	});
		// });
		// //console.log(postdata)
		// req.write(postdata); 
		// req.end();
}

module.exports = Post;



