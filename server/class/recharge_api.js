var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');
var log = require("./loginfo").getInstand;

var key = "42dfcb34fb02d8cd";


var recharge_api = function(req,callback){
	var sendStr = '0';

	if (req.query.act == "createRecharge"){

		//创建充值
		if (req.query.openid && req.query.total_fee && req.query.out_trade_no && req.query.goodsId && req.query.sign)
		{

			//验证md5
			var content = req.query.openid + req.query.total_fee + req.query.out_trade_no + req.query.goodsId + key;
			var md5 = crypto.createHash('md5');
			md5.update(content);
			//console.log(md5.digest('hex'))
			if (md5.digest('hex') != req.query.sign){
				sendStr = '{"status":1,"msg":"参数不正确!"}'
				callback(sendStr);
				return;
			}
			var userInfo = {Account:req.query.openid,total_fee:parseInt(req.query.total_fee),out_trade_no:req.query.out_trade_no,goodsid:parseInt(req.query.goodsId)};
			//直接操作数据库
			dao.create_recharge(userInfo,function(Rusult){
				if (Rusult){
					//成功
					sendStr = '1';
				}
				else{
					//失败
					sendStr = '0';
				}

				callback(sendStr);
			});
		}

	}else if(req.query.act == "updateRecharge"){

		console.log("进入充值");
		//更新充值
		var coin = "0";
		if (req.query.coin){
			coin = req.query.coin;
		}
		//验证md5
		var content = req.query.act + req.query.out_trade_no + coin + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}


		if (req.query.out_trade_no && req.query.sign)
		{
			dao.updateRecharge(req.query.out_trade_no,function(Rusult,rows){
				if (Rusult){
					//成功
					var amount = 0;
					if (!req.query.coin){
						switch(rows.goodsid){
							case 0:
								amount = 600;
								break;
							case 1:
								amount = 2000;
								break;
							case 2:
								amount = 5500;
								break;
							case 3:
								amount = 12000;
								break;
							case 4:
								amount = 25000;
								break;
						}
					}else{
						amount = rows.total_fee;
					}

					if (rows.userId > 0 && rows.total_fee > 0){
						var userInfo = {sendUserId:rows.userId,sendCoin:amount,change_type:0};
						gameInfo.GameBalance(userInfo);
					}
					callback("充值成功");
				}
				else{
					//失败
					log.warn('返回结果操作数据库失败');
					callback('充值返回结果操作数据库失败');
				}
				//callback(sendStr);
			})

		}

	}else if(req.query.act == "checkRecharge"){

		//更新充值
		//验证md5
		var content = req.query.act + req.query.out_trade_no + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		if (req.query.out_trade_no && req.query.sign)
		{
			dao.checkRecharge(req.query.out_trade_no,function(Rusult,rows){
				if (Rusult){
					//成功
					sendStr = '{"status":0,"msg":"验证通过"}';
				}
				else{
					//失败
					sendStr = '{"status":2,"msg":"订单已经使用过!请重新下单"}';
				}
				callback(sendStr);
			})

		}

	}else if(req.query.act == "updateScoreOut"){
		//更新充值
		//验证md5
		var content = req.query.act + req.query.out_trade_no + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		gameInfo.updateScoreOut(req.query.out_trade_no,function(result){
			switch(result){
				case 0:
					sendStr = '{"status":0,"msg":"兑奖更新成功!"}';
					log.info("兑奖更新成功");
					break;
				case 1:
					sendStr = '{"status":0,"msg":"找不到订单!"}';
					log.err("兑奖更新失败");
					break;
			}

			callback(sendStr);
			
			
		})


	}else{

		callback(sendStr);
	}
	
}



module.exports = recharge_api;