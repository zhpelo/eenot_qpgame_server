var http = require('http');
var https = require('https');
var crypto = require('crypto');
var querystring = require("querystring");
var dao = require("./../dao/dao")
var log = require("./loginfo").getInstand;
var gameInfo = require('./../class/game').getInstand;

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


var guanfang_api = {};

var todayId = 0;



guanfang_api.rechargeZhifuBao = function(req,callback){

	var info = req.query
	if (!info.userId){
		callback(0,"",'{"status":1,"msg":"用户ID未传入!"}');
		return;
	}


	if (!info.Account){
		info.Account = "";
	}

	var goodsid = 0;
	if (!info.goodsId){
		callback(0,"",'{"status":2,"msg":"商品ID未传入!"}');
		return;
	}

	goodsid = info.goodsId;

	var total_fee = 6;
	var amount = 600;
	switch(goodsid){
		case '0':
			total_fee = 600;
			amount = 600;
			break;
		case '1':
			total_fee = 1800;
			amount = 2000;
			break;
		case '2':
			total_fee = 5000;
			amount = 5800;
			break;
		case '3':
			total_fee = 10000;
			amount = 12000;
			break;
		case '4':
			total_fee = 20000;
			amount = 25000;
			break;
	}
	
	//生成订单号
	var myDate = new Date();
	var out_trade_no = String(myDate.getFullYear()) + String(myDate.getMonth() + 1) + String(myDate.getDate()) + String(myDate.getTime()) + todayId;
	if (todayId > 10000){
		todayId = 0;
	}



	todayId++;
	var userInfo = {userId:info.userId,Account:info.Account,total_fee:total_fee,out_trade_no:out_trade_no,goodsid:goodsid};
	var self = this;

	var key = "s3ja39q890247uq092@#";
	var time = new Date().getTime();
	var sign = md53(userInfo.userId + out_trade_no + total_fee + goodsid + time + key);
	//直接操作数据库
	dao.create_rechargeSDK(userInfo,function(Rusult){
		if (Rusult){
			var reqData = querystring.stringify({
				userId:userInfo.userId,
				out_trade_no:out_trade_no,
				total_fee:total_fee,
				goodsid:goodsid,
				amount:amount,
				time:time,
				sign:sign
			});

			//console.log(reqData)
			
			var url2 = "http://py.bosengame.com?" + reqData;
			console.log(url2)
			callback(1,url2,'{"status":0,"msg":""}')

		}
		else{
		//失败
			callback(0,"",'{"status":4,"msg":"创建订单失败"}')
		}
	});
}

guanfang_api.rechargeZhifuBaoReturn = function(info,callback){

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



module.exports = guanfang_api;



