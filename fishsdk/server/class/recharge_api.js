var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');

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
			dao.updateRecharge(req.query.out_trade_no,function(Rusult,rows){
				if (Rusult){
					//成功
					//sendStr = rows;

					var goldnum = 0;
					switch (sendStr.goodsid)
		            {
		                case 1:
		                    goldnum = 60000;
		                    break;
		                case 2:
		                    goldnum = 180000;
		                    break;
		                case 3:
		                    goldnum = 500000;
		                    break;
		                case 4:
		                    goldnum = 1000000;
		                    break;
		                case 5:
		                    goldnum = 2000000;
		                    break;
		                case 6:
		                    goldnum = 5000000;
		                    break;
		            }

		            //处理首充
		            gameInfo.updateFirstRecharge(sendStr);

					if (sendStr.userId){
						var userInfo = {sendUserId:sendStr.userId,sendCoin:goldnum,change_type:0};
						console.log(userInfo)
						gameInfo.GameBalance(userInfo);
						
					}

					
					sendStr = '1';
				}
				else{
					//失败
					sendStr = '0';
				}
				callback(sendStr);
			})

		}

	}
}



module.exports = recharge_api;