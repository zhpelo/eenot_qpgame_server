var http = require('http');
var https = require('https');
var crypto = require('crypto');
var querystring = require("querystring");
var dao = require("./../dao/dao")
var log = require("./loginfo").getInstand;
var gameInfo = require('./../class/game').getInstand;
var updateConfig = require('./updateConfig').getInstand;

var get_client_ip = function(req) {
	if (req && req.connection && req.socket){
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
	}else{
		return "127.0.0.1";
	}
    
};

function md53(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex");
}


var tw_api = {};

var todayId = 0;

function pay1(out_trade_no,platform,totalFee,payType,ip,callback){
	var url = "http://tscand01.3qpay.net/thirdPay/pay/gateway";
	//商户
	var appId = "";
	//类型
	var partnerId = "100274";
	var imsi = "1";
	var deviceCode = "1";
	var channelOrderId = out_trade_no;
	var platform = platform;
	var body = "1";
	var totalFee = totalFee;
	var timeStamp = Date.parse(new Date());
	var notifyUrl = encodeURI("http://www.f18886.com:13000/rechargeZhifuBaoReturn");
	var returnUrl = "http://www.f18886.com:13000";
	var clientIp = ip;
	var attach = "";
	var detail = "";
	var key = "";
	if (payType == "2000"){
		key = "84a2d81cece00769f82c0ab26d224ff2";
		appId = "1002";
	}else{
		key = "320d4e950f9a20eb2768d4b3fe1a00e1";
		appId = "1001";
	}

	var signConten = "appId="+appId+"&timeStamp="+timeStamp+"&totalFee="+totalFee+"&key="+key;

	var md5_sign = crypto.createHash('md5');
	md5_sign.update(signConten);
	var sign = md5_sign.digest('hex');

	var url2 = url+"?appId="+appId+"&partnerId="+partnerId+"&imsi="+imsi+"&deviceCode="+deviceCode+"&channelOrderId="+channelOrderId+"&platform="+platform+"&body="+body+"&detail="+detail+"&totalFee="+totalFee+"&attach="+attach+"&payType="+payType+"&timeStamp="+timeStamp+"&sign="+sign+"&notifyUrl="+notifyUrl+"&returnUrl="+returnUrl+"&clientIp="+clientIp;
	//console.log(url2);
	http.get(url2, function(res) {
	var size = 0;
	var chunks = [];
	var result = {};
	res.on('data', function(chunk){
	  size += chunk.length;
	  chunks.push(chunk);
	});

	res.on('end', function(){
	  var data = Buffer.concat(chunks, size);
	  try{
	      var htmldata = JSON.parse(data.toString());
	      if (!htmldata.return_code){
	      	result.state = 1;
	      	result.url = htmldata.payParam.pay_info;
	      	result.msg = '';
	      	callback(result);
	      }
	      else{
	      	result.state = 0;
	      	result.url = "";
	      	result.msg = '{"status":6,"msg":"'+ htmldata.return_msg +'"}';
	      	callback(result);
	      }
	  }
	  catch(e){
	    console.log('tw_api rechargeZhifuBao error..');
	    result.state = 0;
      	result.url = "";
      	result.msg = '{"status":4,"msg":"充值接口异常"}';
      	callback(result);
	  }
	});

	}).on('error', function(e) {
	  	console.log("Got error: " + e.message);
  	    result.state = 0;
      	result.url = "";
      	result.msg = '{"status":5,"msg":"充值接口异常"}';
      	callback(result);
	});
}

function pay2(userId,out_trade_no,platform,totalFee,payType,ip,callback){

	//var url = "http://119.23.161.142:4500/api/game/dpay?";
	var url = "http://119.23.161.142:8899/dpay/cashiPC.php?";
	//商户
	var key = "s3ja39q890247uq092@#";
	var time = new Date().getTime();
	var sign = md53(userId + out_trade_no + totalFee + 0 + time + key);

	var reqData = querystring.stringify({
					userId:userId,
					out_trade_no:out_trade_no,
					total_fee:totalFee,
					goodsid:0,
					time:time,
					sign:sign
				});



	var url2 = url + reqData;
	var result = {};
	result.state = 1;
  	result.url = url2;
  	result.msg = '';
  	callback(result);

	// console.log(url2);
	// http.get(url2, function(res) {
	// var size = 0;
	// var chunks = [];
	// var result = {};
	// res.on('data', function(chunk){
	//   size += chunk.length;
	//   chunks.push(chunk);
	// });

	// res.on('end', function(){
	//   var data = Buffer.concat(chunks, size);
	//   console.log(data.toString());
	//   try{
	//       var htmldata = JSON.parse(data.toString());
	//       //console.log(htmldata);
	//       if (!htmldata.state){
	//       	result.state = 1;
	//       	result.url = htmldata.url;
	//       	result.msg = '';
	//       	callback(result);
	//       }
	//       else{
	//       	result.state = 0;
	//       	result.url = "";
	//       	result.msg = '{"status":100,"msg":"'+ htmldata.msg +'"}';
	//       	callback(result);
	//       }
	//   }
	//   catch(e){
	//     console.log('tw_api rechargeZhifuBao error..');
	//     result.state = 0;
 //      	result.url = "";
 //      	result.msg = '{"status":4,"msg":"充值接口异常"}';
 //      	callback(result);
	//   }
	// });

	// }).on('error', function(e) {
	//   	console.log("Got error: " + e.message);
 //  	    result.state = 0;
 //      	result.url = "";
 //      	result.msg = '{"status":5,"msg":"充值接口异常"}';
 //      	callback(result);
	// });
}



tw_api.rechargeZhifuBao = function(req,callback){
	var info = req.query

	var payconfig = updateConfig.getPayConfig();

	//判断使用接口编号

	if (!info.userId){
		callback(0,"",'{"status":1,"msg":"用户ID未传入!"}');
		return;
	}

	if (!info.totalFee || info.totalFee < 1000){
		//callback(0,"",'{"status":2,"msg":"充值金额不符合规定"}');
		//return;
	}
	
	//2000 支付宝, 1300 微信
	if (!(info.payType == "2000" || info.payType == "1300")){
		callback(0,"",'{"status":3,"msg":"充值类型无法识别"}')
		return;
	}


	console.log(payconfig)
	var go = 1;
	if (info.payType == "2000"){
		//支付宝
		go = payconfig.zhifubao_pay;
	}else{
		//微信
		go = payconfig.weixin_pay;
	}

	console.log("go" + go);


	if (!info.platform){
		//ios,android
		info.platform = 0;
	}


	if (!info.Account){
		//游戏账号
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
	//console.log(userInfo)
	var self = this;
	//直接操作数据库
	dao.create_rechargeSDK(userInfo,function(Rusult){
		if (Rusult){
			if (go == 1){
				var ip = get_client_ip(req);
				pay1(out_trade_no,info.platform,info.totalFee,info.payType,ip,function(result){
					callback(result.state,result.url,result.msg)
				});
			}else if(go == 2){
				pay2(userInfo.userId,out_trade_no,info.platform,info.totalFee,info.payType,ip,function(result){
					callback(result.state,result.url,result.msg)
				});
			}
		}
		else{
		//失败
			callback(0,"",'{"status":4,"msg":"创建订单失败"}')
		}

	});

}

tw_api.rechargeZhifuBaoReturn = function(info,callback){

	console.log(info)
	if (!info.return_code){
		log.warn('返回结果支付码不存在')
		callback(0);
		return;
	}

	if (!info.totalFee){
		log.warn('返回结果支付金额不存在');
		callback(0);
		return;
	}

	if (!info.channelOrderId){
		log.warn('返回结果支付订单不存在');
		callback(0);
		return;
	}


	if (!info.timeStamp){
		log.warn('返回结果支付时间戳不存在');
		callback(0);
		return;
	}

	var key = "ffd6a237365692bd30d79d6737a6a19a";

	var signConten = "channelOrderId="+info.channelOrderId+"&key="+key+"&orderId="+info.orderId+"&timeStamp="+info.timeStamp+"&totalFee="+info.totalFee;

	console.log(signConten)
	var md5_sign = crypto.createHash('md5');
	md5_sign.update(signConten);
	var sign = md5_sign.digest('hex');

	if (sign != info.sign){
		log.warn('返回结果签名错误');
		callback(0);
		return;
	}

	//更新充值
	dao.updateRecharge(info.channelOrderId,function(Rusult,rows){
		if (Rusult){
			//成功
			var goldnum = info.totalFee;

			if (rows.userId > 0 && rows.total_fee > 0){
				var userInfo = {sendUserId:rows.userId,sendCoin:rows.total_fee,change_type:0};
				gameInfo.GameBalance(userInfo);
			}
			callback(1);
		}
		else{
			//失败
			log.warn('返回结果操作数据库失败');
			callback(0);
		}
		
	})
}


tw_api.rechargeRfupay = function(info,callback){

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
				var tw_apidata = "partyId=" + partyId + "&accountId=" + accountId + "&appType=" + appType + "&orderNo=" + orderNo + "&orderAmount=" + orderAmount + "&goods=" + goods + "&returnUrl=" + returnUrl + "&checkUrl=" + checkUrl + "&cardType=" + cardType + "&bank=" + bank + "&encodeType=" + encodeType + "&refCode=" + refCode + "&signMD5=" + signMD5;

				//var url2 = url+"?appId="+appId+"&partnerId="+partnerId+"&imsi="+imsi+"&deviceCode="+deviceCode+"&channelOrderId="+channelOrderId+"&platform="+platform+"&body="+body+"&detail="+detail+"&totalFee="+totalFee+"&attach="+attach+"&payType="+payType+"&timeStamp="+timeStamp+"&sign="+sign+"&notifyUrl="+notifyUrl+"&returnUrl="+returnUrl+"&clientIp="+clientIp;
			    var appstore_optios = {
						hostname: 'payment.rfupayadv.com',
						port: 443,
						path: '/prod/commgr/control/inPayService',
						method: 'tw_api',
						headers:{
						'Content-Type' : 'application/x-www-form-urlencoded',
						'Content-Length':tw_apidata.length
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
							console.log('tw_api BoSenWebServer error..');
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
				//console.log(tw_apidata)
				req.write(tw_apidata); 
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
				//     console.log('tw_api rechargeZhifuBao error..');
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

tw_api.outCoin = function(info,callback){

		var url = "https://portal.rfupay.com/Main/api_paidout/submitPaidout";
		var partyId = "gateway_HARFT001392";
		//类型
		var accountId = "gateway_HARFT001392001";
		var directPaidout = 1
		var paidoutPassword = "NAIaklPX0p";
		var content = "json";
		var orderNo = "ZZZ20170214115936";
		var bankName = "招商银行";
		var provice = "";
		var amount = "10.00";
		var branch = "";
		var city = "";
		var payee_card = "6214837830927483";
		var payee_name = "陳大文";
		var provice = "";
		var refCode = "00000000";
		var note = "test";
		var key = "03636fbed3269041648f7e754ae7265e08c60316845bc58c605992f816f877799d461d218e06b42850e3ae839d51da8f4ddce5cb6cd46e3796d435944ee4632f10cef1ee01aeef338bd5caad86a44b5e";
		var content = 'amount=' + amount + '&bankName='+bankName+'&branch=' + branch + '&city='+city+'&orderNo='+orderNo+'&payee_card='+payee_card+'&payee_name='+payee_name+'&provice='+provice+'&refCode='+refCode+'&remark=&'+key;


		var signMd5 = md53(content);

		var objdata = {
			partyId:"gateway_HARFT001392",
			accountId:"gateway_HARFT001392001",
			note:note,
			directPaidout:"1",
			paidoutPassword:"NAIaklPX0p",
			content:[{
				orderNo:orderNo,
				bankName:bankName,
				provice:provice,
				city:city,
				branch:branch,
				payee_name:payee_name,
				payee_card:payee_card,
				amount:amount,
				refCode:refCode,
				remark:"",
				signMd5:signMd5
			}]
		};
		//var tw_apidata = JSON.stringify(objdata);

		var tw_apidata = 'payData={"partyId":"gateway_D00029","accountId":"gateway_D00029001","note":"DEMO TESTING","directPaidout":"1","paidoutPassword":"QETadgZCB","content":[{"orderNo":"ZZZ20170214115936","bankName":"招商银行","provice":"广东","city":"深圳","branch":"深圳罗湖支行","payee_name":"陳大文","payee_card":"6214837830927483","amount":"10.00","refCode":"00000000","remark":"","signMd5":"1d37dcd8506d2a1980005ac21ee7bc71"}]}'
		tw_apidata = encodeURI(tw_apidata,"utf-8")
		console.log(tw_apidata)

	    var appstore_optios = {
			hostname: 'portal.rfupay.com',
			port: 443,
			path: '/Main/api_paidout/submitPaidout',
			method: 'POST',
			headers:{
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length':tw_apidata.length
			}
	    };

	    //console.log(tw_apidata);
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
					//callback(1,"",data.toString());
					//var htmldata = JSON.parse(data.toString());
				}
				catch(e){
					console.log('tw_api BoSenWebServer error..');
				}
			});
		});
		//console.log(tw_apidata)
		req.write(tw_apidata); 
		req.end();
}

module.exports = tw_api;



