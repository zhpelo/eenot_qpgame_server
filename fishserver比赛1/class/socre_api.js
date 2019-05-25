var dao = require("./../dao/dao")
var gameDao = require("./../dao/gameDao")
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

var key = "42dfcb34fb02d8cd";


var api = function(req,callback){
	var sendStr = '0';

	if (req.query.act == "reg"){
		//注册

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
					//console.log(userid);
					//不够钱减
					if (req.query.goldnum < 0 && userscore < Math.abs(req.query.goldnum)){
							console.log("用户不在线减分失败!");
							sendStr = '{"status":1,"msg":"减分失败,大于用户分数"}'
							callback(sendStr);
							return;
					}

					if (gameInfo.IsPlayerOnline(userid)){
						console.log("用户在线");
						if (gameInfo.addgold(userid,req.query.goldnum)){
							//添加记录
							var score_current = parseInt(req.query.goldnum) + parseInt(userscore);
							var score_change = parseInt(req.query.goldnum);
							var userInfo = {userid:userid,score_before:userscore,score_change:score_change,score_current:score_current,change_type:1,isOnline:true};
							gameDao.score_changeLog(userInfo);
							console.log("用户在线加分成功!");
							sendStr = '{"status":0,"msg":"在线加分成功"}'
						}else{
							console.log("用户在线减分失败!");
							sendStr = '{"status":1,"msg":"在线减分失败"}'
						}
						callback(sendStr);
					}else{
						console.log("用户不在线修改分数!");
						var userInfo = {userid:userid,addgold:req.query.goldnum};
						dao.AddGold(userInfo,function(result_u){
							if (result_u){
								//添加记录
								var score_current = parseInt(req.query.goldnum) + parseInt(userscore);
								var score_change = parseInt(req.query.goldnum);
								var userInfo = {userid:userid,score_before:userscore,score_change:score_change,score_current:score_current,change_type:1,isOnline:false};
								gameDao.score_changeLog(userInfo);
								console.log("加分成功");
								sendStr = '{"status":0,"msg":"加分成功"}'
							}else{
								console.log("加分失败");
								sendStr = '{"status":1,"msg":"加分失败"}'
							}
							callback(sendStr);
						});
						//写加分记录
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

		//验证md5
		var content = req.query.act + req.query.accountname + req.query.recordBeginTime + req.query.time + key;
		var md5 = crypto.createHash('md5');
		md5.update(content);
		if (md5.digest('hex') != req.query.sign){
			sendStr = '{"status":1,"msg":"参数不正确!"}'
			callback(sendStr);
			return;
		}

		//查询记录
		if (req.query.accountname && req.query.recordBeginTime && req.query.time && req.query.sign)
		{
			//console.log(req.query.recordBeginTime);
			var userInfo = {};
			userInfo.accountname = req.query.accountname;
			userInfo.recordBeginTime = req.query.recordBeginTime;
			
			//直接操作数据库
			gameDao.getLotteryLog(userInfo,function(RusultCode,RusultData){
			if (RusultCode){
				//成功
				//console.log(RusultData.length)
				console.log("查询成功:accountname:" + userInfo.accountname)
				var string = '{"status":0,"msg":"","data":[';
				for(var i = 0; i< RusultData.length ;i++)
				{
					var date = makeDate(RusultData[i].lotteryTime);
					var addgold = 0;
					if (RusultData[i].free_count_before > 0)
						addgold = RusultData[i].score_win;
					else
						addgold = RusultData[i].score_win - RusultData[i].score_linescore;
					string += '{"row_number":'+ i +',"Pk_id":'+ RusultData[i].id +',"AccountName":"' + userInfo.accountname +'","AddGold":'+ addgold +',"BeginTime":"'+date +'","RoomName":0}';
					if (i != RusultData.length - 1)
						string += ',';
				}
				string += ']}';

				sendStr = string;

			}
			else{
				//失败
				sendStr = '{"status":0,"msg":"查询失败","data":[]}'
			}
			callback(sendStr);
			});
		}else{
			sendStr = '{"status":1,"msg":"参数不对"}'
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
				sendStr = '{"status":0,"msg":"","data":{"accountname":"'+ userInfo.accountname + '}}'
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
					if (gameInfo.IsPlayerOnline(userid)){
						console.log("查询用户在线");
						var score = gameInfo.getPlayerScore(userid)
						if (score != -1){
							console.log("查询分数,在线成功!");
							sendStr = score.toString();
						}else{
							console.log("查询分数,在线失败!");
							sendStr = '{"status":1,"msg":"在线查询分数失败"}'
						}
						callback(sendStr);
					}else{
						console.log("用户不在线查询分数!");
						sendStr = userscore.toString();
						callback(sendStr);
						
					}

				}else{
					console.log("未找到" + req.query.accountname + "帐号");
					sendStr = '0'
					callback(sendStr);
				}
			})
		}
	}
}



module.exports = api;