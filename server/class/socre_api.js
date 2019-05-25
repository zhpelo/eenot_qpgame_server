var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');

function makeDate(date) {  
	
    try { 

        var newDate = new Date(date);  
        //在小于10的月份前补0  
        var month = eval(newDate.getMonth() + 1) < 10 ? '0'+eval(newDate.getMonth() + 1) : eval(newDate.getMonth() + 1);  
        //在小于10的日期前补0  
        var day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();  
        //在小于10的小时前补0  
        var hours = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours();  
        //在小于10的分钟前补0  
        var minutes = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();  
        //在小于10的秒数前补0  
        var seconds = newDate.getSeconds() < 10 ? '0' + newDate.getSeconds(): newDate.getSeconds();  
        //拼接时间  
        var stringDate = newDate.getFullYear() + '-' + month + '-' + day + " " + hours + ":" + minutes + ":" + seconds;  
    }catch(e){  
        var stringDate = "0000-00-00 00:00:00";  
    }finally{
        return stringDate;  
    }  
  
};

function CheckDateTime(str){ 
  var t1 = new Date(str).getTime();
  if (t1)
  	return true;
  else
  	return false;
}

var key = "42dfcb34fb02d8cd";


var api = function(req,callback){
	var sendStr = '0';

	if (req.query.act == "reg"){
		//注册
		console.log(req.query)
		if (!req.query.goldnum)
		{
			req.query.goldnum = 0;
		}
		if (req.query.accountname && req.query.nickname && req.query.pwd && req.query.time && req.query.sign)
		{

			//验证md5
			var content = req.query.act + req.query.accountname + req.query.nickname + req.query.pwd + req.query.time + key;
			var md5 = crypto.createHash('md5');
			md5.update(content);
			//console.log(md5.digest('hex'))
			if (md5.digest('hex') != req.query.sign){
				sendStr = '{"status":1,"msg":"参数不正确!"}'
				callback(sendStr);
				return;
			}
			//密码加密MD5
			// var key_login = "89b5b9871@@@24d2ec3@*&^sexx$%^slxxx";
			// content = req.query.pwd + key_login;
			var key_login = "89b5b987124d2ec3";
			content = req.query.accountname + req.query.pwd + key_login; 
			
			var md5_sign = crypto.createHash('md5');
			md5_sign.update(content);
			var userInfo = {};
			userInfo.accountname = req.query.accountname;
			userInfo.pwd = md5_sign.digest('hex');
			userInfo.nickname = req.query.nickname;
			userInfo.goldnum = req.query.goldnum;
			userInfo.p = req.query.pwd;
			//直接操作数据库
			dao.CreateUser(userInfo,function(Rusult){
			if (Rusult){
				//成功
				console.log("用户注册成功:accountname:" + userInfo.accountname + " goldnum:" + userInfo.goldnum)
				sendStr = '{"status":0,"msg":"","data":{"accountname":"'+ userInfo.accountname +'","gold":'+userInfo.goldnum+'}}'
			}
			else{
				//失败
				sendStr = '{"status":1,"msg":"信息错误或用户名重复,注册失败!"}'
			}
			callback(sendStr);
			});
		}

	}else if(req.query.act == "scoreedit"){

		//验证md5
		var content = req.query.act + req.query.accountname + req.query.goldnum + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//加币
		//操作分两种情况,
		//1用户在线
		//不修改数据库，只在服务器上做修改
		//2用户不在线
		//直接修改数据库
		
		if (req.query.accountname && req.query.goldnum && req.query.time && req.query.sign)
		{

			//先通过帐号查询ID
			dao.getUserId(req.query.accountname,function(result,userid,userscore){
				if (result){
					if (userid){
						if (req.query.goldnum > 0){
							var userInfo = {sendUserId:userid,sendCoin:req.query.goldnum,change_type:0};
							gameInfo.GameBalance(userInfo);
							sendStr = '{"status":0,"msg":"加分成功"}'
							callback(sendStr);
						}else{
							var userInfo = {sendUserId:userid,sendCoin:req.query.goldnum,change_type:0};

							gameInfo.GameBalanceSub(userInfo,function(_sendStr){
								callback(_sendStr);
							});								
						}
					}else{
						sendStr = '{"status":1,"msg":"未找到'+ req.query.accountname +'帐号"}'
						callback(sendStr);
					}

				}else{
					console.log("未找到" + req.query.accountname + "帐号");
					sendStr = '{"status":1,"msg":"未找到'+ req.query.accountname +'帐号"}'
					callback(sendStr);
				}
				//
			})

		}

	}else if(req.query.act == "recordquery"){
		//console.log(req.query)
		//验证md5
		var content = req.query.act + req.query.beginTime + req.query.endTime + req.query.linecount + req.query.page + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//查询记录
		if (req.query.time && req.query.sign)
		{
			//console.log(req.query.recordBeginTime);
			var userInfo = {};
			var page = parseInt(req.query.page)
			if (page < 1){
				sendStr = '{"status":1,"msg":"page不能小于1","data":[]}'
				callback(sendStr);
				return;
			}

			if (req.query.linecount == 0){

			}else{
				var beginLine = (page - 1) * req.query.linecount;
				userInfo.linebegin = beginLine;
				userInfo.lineCount = req.query.linecount;
			}
			userInfo.beginTime = req.query.beginTime;
			userInfo.endTime = req.query.endTime;

			if (!CheckDateTime(userInfo.beginTime) || !CheckDateTime(userInfo.endTime)) {
				sendStr = '{"status":1,"msg":"日期格式不正确","data":[]}'
				callback(sendStr);
				return;
			}
			//console.log(userInfo)
			//console.log("查询");
			//直接操作数据库
			dao.getRecord(userInfo,function(RusultCode,RusultData){
			if (RusultCode == 1){
				//成功
				//console.log(RusultData.length)
				//console.log("查询成功");
				//console.log(RusultData)
				
				var string = '{"status":0,"msg":"","data":[';

				for(var i = 0; i< RusultData.length ;i++)
				{
					var date = makeDate(RusultData[i].balanceTime);
					//console.log(RusultData[i].lotteryTime)				
					string += '{"row_number":'+ i +',"Pk_id":'+ RusultData[i].id +',"AccountName":"' + RusultData[i].Account +'","UseGold":'+ RusultData[i].useCoin + ',"AddGold":'+ RusultData[i].winCoin + ',"Tax":'+ RusultData[i].tax +',"BeginTime":"'+ date +'","gameId":'+ RusultData[i].gameId +',"RoomName":'+ RusultData[i].serverId +'}';
					if (i != RusultData.length - 1)
						string += ',';
				}
				string += ']}';

				sendStr = string;

			}else if(RusultCode == 2){
				sendStr = '{"status":0,"msg":"没有记录","data":[]}'
			}else{
				//失败
				sendStr = '{"status":0,"msg":"查询失败","data":[]}'
			}
			callback(sendStr);
			});
		}else{
			sendStr = '{"status":1,"msg":"参数不对"}'
			callback(sendStr);
		}
	}else if(req.query.act == "mark"){
		//console.log(req.query)
		//验证md5
		var content = req.query.act + req.query.pkid + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//查询记录
		if (req.query.pkid && req.query.time && req.query.sign)
		{
			//console.log(req.query.recordBeginTime);
			var Info = {};
			Info.pkid = req.query.pkid;

			//直接操作数据库
			dao.mark(Info,function(RusultCode){
			if (!RusultCode){
				//成功
				console.log("标记成功");
				var string = '{"status":0,"msg":""}'
				sendStr = string;

			}else if(RusultCode == 1){
				//失败
				sendStr = '{"status":1,"msg":"标记失败,pkid'+req.query.pkid+'已经标记过了"}';
			}else if(RusultCode == 2){
				//失败
				sendStr = '{"status":2,"msg":"pkid'+req.query.pkid+'不存在"}';
			}
			callback(sendStr);
			});
		}else{
			sendStr = '{"status":3,"msg":"参数不对"}'
			callback(sendStr);
		}
	}else if(req.query.act == "pwdreset"){

		//验证md5
		var content = req.query.act + req.query.accountname + req.query.pwd + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//密码修改
		
		if (req.query.accountname && req.query.pwd && req.query.time && req.query.sign)
		{
			var userInfo = {};
			userInfo.accountname = req.query.accountname;
			userInfo.pwd = req.query.pwd;
			

			//密码加密MD5
			var key_login = "89b5b987124d2ec3";
			content = req.query.accountname + req.query.pwd + key_login;
			var md5_sign = crypto.createHash('md5');
			md5_sign.update(content);
			var userInfo = {};
			userInfo.accountname = req.query.accountname;
			userInfo.pwd = md5_sign.digest('hex');
			userInfo.p = req.query.pwd;


			//直接操作数据库
			dao.SetPassword(userInfo,function(Rusult){
			if (Rusult){
				//成功
				console.log("密码修改成功:accountname:" + userInfo.accountname)
				sendStr = '{"status":0,"msg":"","data":{"accountname":"'+ userInfo.accountname + '"}}'
			}
			else{
				//失败
				sendStr = '{"status":1,"msg":"更新失败"}'
			}
			callback(sendStr);
			});
		}else{
			sendStr = '{"status":1,"msg":"参数不对"}'
			callback(sendStr);
		}
	}else if(req.query.act == "scorequery"){

		//验证md5
		var content = req.query.act + req.query.accountname + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//查询当前剩余分数
		//操作分两种情况,
		//1用户在线
		//2用户不在线
		//直接修改数据库
		if (req.query.accountname &&  req.query.time && req.query.sign)
		{
			//先通过帐号查询ID
			dao.getUserId(req.query.accountname,function(result,userid,userscore){
				if (result){
					var userItem = gameInfo.getUser(userid);
					if (userItem){
						//用户在登录服务器
						console.log("查询用户游戏在线");
						gameInfo.getPlayerScore(userid,callback)
					}else{
						//console.log("查询用户不在线");
						//游戏服务器在线
						//console.log("用户不在线查询分数!");
						sendStr = '{"status":0,"msg":"","data":{"score":'+userscore.toString()+'}}'
						callback(sendStr);
					}
				}else{
					sendStr = '{"status":1,"msg":"未找到'+req.query.accountname+'帐号"}'
					callback(sendStr);
				}
			})
		}
	}else if(req.query.act == "debug_scoreedit"){

		//验证md5
		// var content = req.query.act + req.query.accountname + req.query.goldnum + req.query.time + key;
		// var md5 = crypto.createHash('md5');
		// md5.update(content);
		// if (md5.digest('hex') != req.query.sign){
		// 	sendStr = '{"status":1,"msg":"参数不正确!"}'
		// 	callback(sendStr);
		// 	return;
		// }

		//加币
		//操作分两种情况,
		//1用户在线
		//不修改数据库，只在服务器上做修改
		//2用户不在线
		
		

		var pattern = new RegExp("^(-)?[0-9]*$");
		if (!pattern.test(req.query.id) || !pattern.test(req.query.goldnum)){
			sendStr = '{"status":3,"msg":"不是数字(id或金额)"}'
			callback(sendStr);
			return;
		}
		if (req.query.id < 20000)
		
		if (req.query.id && req.query.goldnum)
		{

			//先通过帐号查询ID
			//dao.getUserId(req.query.accountname,function(result,userid,userscore){
			//	if (result){
			//		if (userid){
			//			if (req.query.goldnum > 0){
			var userInfo = {sendUserId:req.query.id,sendCoin:req.query.goldnum,change_type:0};
			gameInfo.GameBalance(userInfo);
			sendStr = '{"status":0,"msg":"修改成功"}'
			callback(sendStr);

		}else{
			sendStr = '{"status":3,"msg":"参数不对"}'
			callback(sendStr);
		}


	}else if(req.query.act == "disabled"){

		//验证md5
		var content = req.query.act + req.query.accountname + req.query.state + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//密码修改
		
		if (req.query.accountname && req.query.time && req.query.sign)
		{
			var userInfo = {accountname:req.query.accountname,state:req.query.state};

			//直接操作数据库
			dao.SetAccountState(userInfo,function(Rusult){
			if (Rusult){
				//成功
				console.log(req.query.state)
				if (req.query.state == '1'){
					sendStr = '{"status":0,"msg":"账号已启用","data":{"accountname":"'+ userInfo.accountname + '"}}'
				}else{
					sendStr = '{"status":0,"msg":"账号已禁用","data":{"accountname":"'+ userInfo.accountname + '"}}'
				}
			}
			else{
				//失败
				sendStr = '{"status":1,"msg":"账号更新失败"}'
			}
			callback(sendStr);
			});
		}else{
			sendStr = '{"status":1,"msg":"参数不对"}'
			callback(sendStr);
		}
	}
}



module.exports = api;