var mysql = require('mysql')
var async = require('async'); 
var gameConfig = require('./../config/gameConfig');

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	database:'gameaccount'
})





exports.login = function login(user,socket,callback){



	if (user.userName && user.sign)
	{

	//var sql = 'select * from newuseraccounts where Account=? and Password=?';
	var sql = 'CALL passwordLogin(?,?)';
	var values = [];

	values.push(user.userName);
	values.push(user.sign);


	//console.log(user)
	//console.log(user.sign)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("login");
				console.log(err);
				callback(0);
			}else{
				var result = {};
				//console.log(rows[0][0])
				if (rows[0].length == 0){
					callback(0);
				}else{
					rows[0][0].socket = socket;
					rows[0][0].gameId = user.gameId;
					callback(rows[0][0]);
					}
		 		}
	 		})
		
		values = [];

	});

	}
	else if(user.loginCode){

		var sql = 'call useLoginCode(?)';
		var values = [];

		values.push(user.loginCode);

		pool.getConnection(function(err,connection){

		 	connection.query({sql:sql,values:values},function(err,rows){
		 		connection.release();
				if (err)
				{
					console.log("loginCode");
					console.log(err);
					callback(0);
				}else{
					var result = {};
					if (rows[0][0].rcode == 0){
						callback(0);
					}else{
						//console.log(rows[0][0]);
						rows[0][0].socket = socket;
						rows[0][0].gameId = user.gameId;
						callback(rows[0][0]);
						}
			 		}
		 		})
		 })
	}
	else if(user.phoneNo && user.password){
		//console.log(user)
		var sql = 'call LoginByPhone(?,?)';
		var values = [];

		values.push(user.phoneNo);
		values.push(user.password);

		pool.getConnection(function(err,connection){

		 	connection.query({sql:sql,values:values},function(err,rows){
		 		connection.release();
				if (err)
				{
					console.log("phoneNo");
					console.log(err);
					callback(0);
				}else{
					var result = {};
					if (rows[0][0].rcode == 0){
						callback(0);
					}else{
						//console.log(rows[0][0]);
						rows[0][0].socket = socket;
						rows[0][0].gameId = user.gameId;
						callback(rows[0][0]);
						}
			 		}
		 		})
		 })
	}
	else{
		callback(0);
	}
}

//用户注册
exports.CreateUser = function CreateUser(userInfo,callback){
	//var sql = 'INSERT INTO useraccounts(Account,Password,nickname,score,p,phoneNo,email,sex,city,province,headimgurl) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
	var sql = 'call createUser(?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var values = [];

	values.push(userInfo.accountname);
	values.push(userInfo.pwd);
	values.push(userInfo.nickname);
	values.push(userInfo.goldnum);
	values.push(userInfo.p);
	if (!userInfo.phoneNo){
		userInfo.phoneNo = "";
	}
	values.push(userInfo.phoneNo);
	if (!userInfo.email){
		userInfo.email = "";
	}
	values.push(userInfo.email);
	if (!userInfo.sex){
		userInfo.sex = -1;
	}
	values.push(userInfo.sex);

	if (!userInfo.city){
		userInfo.city = "";
	}
	values.push(userInfo.city);
	if (!userInfo.province){
		userInfo.province = "";
	}
	values.push(userInfo.province);
	if (!userInfo.country){
		userInfo.country = "";
	}
	values.push(userInfo.country);
	if (!userInfo.headimgurl){
		userInfo.headimgurl = "";
	}
	values.push(userInfo.headimgurl);
	if (!userInfo.language){
		userInfo.language = "";
	}
	values.push(userInfo.language);

	//console.log(userInfo.pwd)
	//console.log(user.password)

	pool.getConnection(function(err,connection){
	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("CreateUser");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		values = [];
		
	});
}


//用户注册
exports.weixinCreateUser = function CreateUser(userInfo,callback){
	//var sql = 'INSERT INTO useraccounts(Account,Password,nickname,score,p,phoneNo,email,sex,city,province,headimgurl) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
	var sql = 'call weixinCreateUser(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	var values = [];

	values.push(userInfo.accountname);
	values.push(userInfo.pwd);
	values.push(userInfo.nickname);
	values.push(userInfo.goldnum);
	values.push(userInfo.p);
	if (!userInfo.phoneNo){
		userInfo.phoneNo = "";
	}
	values.push(userInfo.phoneNo);
	if (!userInfo.email){
		userInfo.email = "";
	}
	values.push(userInfo.email);
	if (!userInfo.sex){
		userInfo.sex = -1;
	}
	values.push(userInfo.sex);

	if (!userInfo.city){
		userInfo.city = "";
	}
	values.push(userInfo.city);
	if (!userInfo.province){
		userInfo.province = "";
	}
	values.push(userInfo.province);
	if (!userInfo.country){
		userInfo.country = "";
	}
	values.push(userInfo.country);
	if (!userInfo.headimgurl){
		userInfo.headimgurl = "";
	}
	values.push(userInfo.headimgurl);
	if (!userInfo.language){
		userInfo.language = "";
	}
	values.push(userInfo.language);
	if (!userInfo.ChannelType){
		userInfo.ChannelType = "";
	}
	if (!userInfo.bindUserId){
		userInfo.bindUserId = "";
	}
	if (!userInfo.did){
		userInfo.did = "";
	}
	
	values.push(userInfo.loginCode);
	values.push(userInfo.ChannelType);
	values.push(userInfo.bindUserId);
	values.push(userInfo.did);
	//console.log(userInfo.pwd)
	//console.log(values)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("weixinCreateUser");
				console.log(err);
				callback(0);
			}else{
				if (rows[0] && rows[0][0]){
					//console.log(rows[0][0]);
					callback(rows[0][0].ag,rows[0][0].rcode);
				}else{
					callback(0);
				}
				//console.log(rows[0])
				
			}})

		
		values = [];
		
	});
}


//修改密码
exports.SetPassword = function SetPassword(userInfo,callback){
	var sql = 'UPDATE newuseraccounts SET Password=? WHERE Account=?';
	var values = [];
	values.push(userInfo.pwd);
	values.push(userInfo.accountname);
	//console.log(userInfo.accountname)
	//console.log(userInfo.pwd)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("SetPassword");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});

}

//更新手机号码
exports.SetPhoneNo = function SetPhoneNo(userInfo,callback){
	var sql = 'UPDATE newuseraccounts SET phoneNo=?,Password=?,p=? WHERE Id=?';
	var values = [];
	values.push(userInfo.phoneNo);
	values.push(userInfo.password);
	values.push(userInfo.pass);
	values.push(userInfo.Id);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("SetPhoneNo");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		values = [];
		
	});
}

//检查电话号码
exports.phoneCheck = function phoneCheck(userInfo,callback){
	var sql = 'call checkPhone(?,?)';
	var values = [];
	values.push(userInfo.userId);
	values.push(userInfo.phone);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("phoneCheck");
				console.log(err);
				callback(0);
			}else{
				if (rows[0]){
					callback(rows[0][0].rcode);
				}else{
					callback(0);
				}
				
			}})

		
		values = [];
		
	});
}


//储存指定用户
exports.saveUser = function saveUser(userList,callback){
	var sql = 'UPDATE newuseraccounts SET score = CASE Id ';
	var string = '';
	var string3 = 'diamond = CASE Id ';
	var string4 = 'LoginCount = CASE Id ';
	var string5 = 'giftTicket = CASE Id ';
	var string2 = 'END WHERE Id IN (';
	var objnull = true;
	for(var user in userList)
	{
		objnull = false;
		string += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user]._score + ' ';
		string3 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user]._diamond + ' ';
		string4 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user].LoginCount + ' ';
		string5 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user]._giftTicket + ' ';
		string2 += userList[user]._userId;
		string2 += ','
	}

	if (objnull){
		callback(0);
		return;
	}
	sql += string + "END,";
	sql += string3 + "END,";
	sql += string4 + "END,";
	sql += string5;

	//console.log("leng:" + string2.length)
	string2 = string2.substring(0,string2.length - 1);
	//console.log(string2)
	string2 += ')';

	sql += string2;
	

	//console.log(sql);
	

	var values = [];
	//values.push(userInfo.pwd);
	//values.push(userInfo.accountname);
	//console.log(userInfo.accountname)
	//console.log(userInfo.pwd)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("saveUser");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});

}

//储存所有用户
exports.saveAll = function saveAll(userList,callback){
	var sql = 'UPDATE newuseraccounts SET score = CASE Id ';
	var string = '';
	var string2 = 'END WHERE Id IN (';
	var string3 = 'freeCount = CASE Id ';
	var string4 = 'LoginCount = CASE Id ';
	var string5 = 'LotteryCount = CASE Id ';
	var objnull = true;
	for(var user in userList)
	{
		objnull = false;
		string += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user]._score + ' ';
		string3 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user].freeCount + ' ';
		string4 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user].LoginCount + ' ';
		string5 += 'WHEN '+ userList[user]._userId +' THEN '+ userList[user].LotteryCount + ' ';
		string2 += userList[user]._userId;
		string2 += ','
	}

	if (objnull){
		callback(0);
		return;
	}
	sql += string;
	sql += string + "END,";
	sql += string3 + "END,";
	sql += string4 + "END,";
	sql += string5;
	//console.log("leng:" + string2.length)
	string2 = string2.substring(0,string2.length - 1);
	//console.log(string2)
	string2 += ')';

	sql += string2;

	var values = [];

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("saveAll");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});

}


//查询用户id
exports.getUserId = function getUserId(accountname,callback){
	var sql = 'select * from newuseraccounts where Account=?';
	var values = [];

	values.push(accountname);
	//console.log(user.userName)
	//console.log(user.password)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getUserId");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1,rows[0].Id,rows[0].score);
					}
		 		}
	 		})
		
		values = [];

	});
}


exports.checkNickName = function checkNickName(userId,callback){
	var sql = 'select nickname from newuseraccounts where Id=?';
	var values = [];

	values.push(userId);
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getUserNickName");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1,rows[0].nickname);
					}
		 		}
	 		})
		
		values = [];

	});
}


//获得用户道具
exports.getPropByUserId = function getPropByUserId(_userId,callback){
	var sql = 'select * from prop_item where userid=?';
	var values = [];
	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getPropByUserId");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1,rows);
					}
		 		}
	 		})
		
		values = [];

	});
}


//获得鱼币消耗
exports.getUseCoin = function getUseCoin(_userId,callback){
	var sql = 'select * from fish.usecoin where userId=?';
	var values = [];
	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getUseCoin");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1,rows[0]);
					}
		 		}
	 		})
		

		values = [];

	});
}

//获得鱼币消耗
exports.getWinCoin = function getWinCoin(_userId,callback){
	var sql = 'select * from fish.wincoin where userId=?';
	var values = [];
	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getWinCoin");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1,rows[0]);
					}
		 		}
	 		})
		
		values = [];

	});
}


//保存用户变化量
exports.saveUserLog = function saveUserLog(userInfo,callback){
	var sql = 'UPDATE newuseraccounts SET score=score+? WHERE Id=?';
	var values = [];
	values.push(userInfo.addgold);
	values.push(userInfo.userid);
	
	//console.log(userInfo.userid)
	//console.log(userInfo.addgold)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("saveUserLog");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});
}

//不在线修改金钱
exports.AddGold = function AddGold(userInfo,callback){
	var sql = 'call AddGold(?,?,?)';
	var values = [];
	values.push(userInfo.userid);
	values.push(userInfo.addgold);
	values.push(userInfo.change_type);


	//console.log(userInfo.userid)
	//console.log(userInfo.addgold)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("AddGold");
				console.log(err);
				callback(0);
			}else{
				if (rows[0]){
					callback(rows[0][0].rcode);
				}else{
					callback(0);
				}
			}})

		
		values = [];
		
	});

}



//上下分记录
exports.score_changeLog = function score_changeLog(userInfo){
	var sql = "INSERT INTO score_changelog(userid,score_before,score_change,score_current,change_type,isOnline) VALUES(?,?,?,?,?,?)";
	var values = [];

	pool.getConnection(function(err,connection){

		for (var i = 0 ; i < userInfo.length ; i++){
			values.push(userInfo[i].userid);
			values.push(userInfo[i].score_before);
			values.push(userInfo[i].score_change);
			values.push(userInfo[i].score_current);
			values.push(userInfo[i].change_type);
			values.push(userInfo[i].isOnline);

		 	connection.query({sql:sql,values:values},function(err,rows){
		 		
				if (err)
				{
					console.log("score_changeLog");
					console.log(err);
				}
			})

			values = [];
		}
		connection.release();
		
	});
}

//摇奖记录
exports.getLotteryLog = function getLotteryLog(userInfo,callback_c){
	//console.log(userInfo)
	var sql = "CALL selectlotterylog(?,?)";
	pool.getConnection(function(err,connection){

		var values = [];

		values.push(userInfo.gameid);
		values.push(userInfo.lineCount);
		//console.log(connection);
		connection.query({sql:sql,values:values},function(err,rows){
			connection.release();
				if (err)
				{
					console.log("getLotteryLog");
					console.log(err);
				}
				else
				{
					if (rows.length){
						callback_c(1, rows[0]);
					}
					else{
						callback_c(null,"未找到数据");
					}
				}
				//console.log("释放");
				//connection.release();
		})
		
		values = [];
	})
}

//标记
exports.mark = function mark(userInfo,callback_c){
	//console.log(userInfo)
	var sql = "CALL mark(?,?)";
	pool.getConnection(function(err,connection){

		var values = [];

		values.push(userInfo.gameid);
		values.push(userInfo.pkid);

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("mark");
				console.log(err);
			}
			else
			{
				callback_c(1);
			}
		})

		
		values = [];


	})
}


//更新用户道具
exports.updateProp = function updateProp(_userInfo,callback){
	var sql = 'CALL updateProp(?,?,?,?,?)';
	var values = [];

	values.push(_userInfo.userId);
	values.push(_userInfo.propId);
	values.push(_userInfo.propCount);
	values.push(_userInfo.roomid);
	values.push(_userInfo.typeid);
	//console.log(values);
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("updateProp");
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(1);
					}
		 		}
	 		})
		
		values = [];
	});
}


//获取未领奖列表
exports.getSendPrize = function getSendPrize(_userId,callback){
	var sql = 'call getSendPrize(?)';
	var values = [];

	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getSendPrize");
				console.log(err);
				callback(0);
			}else{
				if (rows[0].length == 0){
					callback(0);
				}else{
					callback(1,rows[0]);
					}
		 		}
	 		})
		
		values = [];

	});
}

//领取奖品
exports.getPrize = function getPrize(_userId,callback){
	var sql = 'call getPrize(?)';
	var values = [];
	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getPrize");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});
}

//领取奖品
exports.sendEmail = function sendEmail(info,callback){
	var sql = 'call sendEmail(?,?,?,?,?,?,?)';

	var values = [];
	values.push(info.userId);
	values.push(info.winPropId);
	values.push(info.winPropCount);
	values.push(info.winScore);
	values.push(info.type);
	values.push(info.sendCoinUserId);
	values.push(info.nickName);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("sendEmail");
				console.log(err);
				callback(0);
			}else{
				callback(1,rows[0][0].id);
			}})

		
		values = [];
		
	});
}


//领取每日奖品
exports.getDayPrize = function getDayPrize(_userId,callback){
	var sql = 'UPDATE fish.getcoin SET mark=1 WHERE id=?';
	var values = [];
	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getDayPrize");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});
}

//添加未领取列表
exports.addPrize = function addPrize(_info,callback){
	var sql = 'call addPrize(?,?)';
	var values = [];

	values.push(_info.roomType);
	values.push(_info.matchId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("addPrize");
				console.log(err);
				callback(0);
			}else{
				if (rows[0].length == 0){
					callback(0);
				}else{
					callback(1,rows[0]);
					}
		 		}
	 		})
		
		values = [];

	});
}

//获取未领奖列表
exports.getdaySendPrize = function getdaySendPrize(_userId,callback){
	var sql = "call fish.getdayprize(?)";
	var values = [];

	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getdaySendPrize");
				console.log(err);
				callback(0);
			}else{
				if (rows[0].length == 0){
					callback(0);
				}else{
					callback(1,rows[0]);
					}
		 		}
	 		})
		
		values = [];

	});
}


//比赛数据
exports.matchRandKing = function matchRandKing(userInfo,callback){
	var sql = "call fish.updateMatchRandKing(?,?,?,?,?)";
	var values = [];

	values.push(userInfo.matchId);
	values.push(userInfo.userId);
	values.push(userInfo.score);
	values.push(userInfo.lastTime);
	values.push(userInfo.roomType);
	

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("matchRandKing");
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		
		values = [];
		
	});
}

//创建充值数据
exports.create_recharge = function create_recharge(userInfo,callback){
	var sql = "call createRecharge(?,?,?,?)";
	var values = [];

	values.push(userInfo.Account);
	values.push(userInfo.total_fee);
	values.push(userInfo.out_trade_no);
	values.push(userInfo.goodsid);
	

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("create_recharge");
				console.log(err);
				
				callback(0);
			}else{
				callback(rows[0][0].rcode);
			}})

		
		values = [];
		
	});
}

//创建充值数据SDK
exports.create_rechargeSDK = function create_rechargeSDK(userInfo,callback){
	var sql = "call createRecharge(?,?,?,?,?)";
	var values = [];

	values.push(userInfo.userId);
	values.push(userInfo.Account);
	values.push(userInfo.total_fee);
	values.push(userInfo.out_trade_no);
	values.push(userInfo.goodsid);

	console.log(userInfo);
	

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("create_rechargeSDK");
				console.log(err);
				
				callback(0);
			}else{
				callback(rows[0][0].rcode);
			}})

		
		values = [];
		
	});
}

//更新充值数据
exports.updateRecharge = function updateRecharge(out_trade_no,callback){
	var sql = "call updateRecharge(?)";
	var values = [];

	values.push(out_trade_no);
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("updateRecharge");
				console.log(err);
				callback(0);
			}else{
				if (rows[0][0].rcode){
					callback(0);
				}else{
					callback(1,rows[0][0]);
				}
				
			}})

		
		values = [];
		
	});
}


exports.getfirstexchange = function getfirstexchange(_userId,callback){
	var sql = "select * from userinfo where userId = ?";
	var values = [];

	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("getfirstexchange");
				console.log(err);
				callback(0);
			}else{
				if (rows[0]){
					if (rows[0].length == 0){
						callback(0);
					}else{
						callback(1,rows[0]);
						}
			 		}
				}

	 		})
		
		values = [];

	});
}

exports.updateFirstexchange = function updateFirstexchange(_userId){
	var sql = "update userinfo set firstexchange = 1 where userId = ?";
	var values = [];

	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("updateFirstexchange");
				console.log(err);
			}

	 		})
		
		values = [];

	});
}

exports.sendcoinlog = function sendcoinlog(info){
	var sql = "INSERT INTO sendcoinlog(userid,getcoinuserid,sendcoin) VALUES(?,?,?)";
	var values = [];

	values.push(info.userid);
	values.push(info.getcoinuserid);
	values.push(info.sendcoin);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("sendcoinlog");
				console.log(err);
			}

	 		})
		
		values = [];

	});
}

exports.sendcoinServer = function getUserId(userid,sendCoin,callback){
	var sql = 'call sendcoinServer(?,?)';
	var values = [];

	values.push(userid);
	values.push(sendCoin);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("sendcoinServer");
				console.log(err);
				callback(0);
			}else{
				//console.log(rows[0][0].recod)
				callback(rows[0][0].recod);
			}
	 	})
		
		values = [];

	});
}


exports.saveLineOut = function saveLineOut(userid){
	var sql = 'INSERT INTO lineout(userId) VALUES(?)';
	var values = [];

	values.push(userid);


	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("saveLineOut");
				console.log(err);
			}
	 	})
		
		values = [];

	});
}

exports.deleteLineOut = function saveLineOut(userid){
	var sql = 'DELETE FROM lineout WHERE userId = ?';
	var values = [];

	values.push(userid);


	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("deleteLineOut");
				console.log(err);
			}
	 	})
		
		values = [];

	});
}


exports.clenaLineOut = function clenaLineOut(){
	var sql = 'DELETE FROM lineout';
	var values = [];

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("clenaLineOut");
				console.log(err);
			}
	 	})
		
		values = [];
	});
}

//在线游戏时，结算
exports.tempAddScore = function tempAddScore(userid,score,change_type){
	var sql = 'call tempAddScore(?,?,?)';
	var values = [];

	values.push(userid);
	values.push(score);
	values.push(change_type);


	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("tempAddScore");
				console.log(err);
			}
	 	})
		
		values = [];
	});
}

//登录时使用
exports.LoginaddTempScore = function LoginaddTempScore(userid,callback){
	var sql = 'call LoginaddTempScore(?)';
	var values = [];

	values.push(userid);

	//console.log(values)
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("LoginaddTempScore");
				console.log(err);
			}else{
				
				if (rows[0].length){
					callback(1,rows[0]);
				}else{
					callback(0);
				}
			}
	 	})
		
		values = [];
	});
}

//东山再起
exports.dongshanzaiqi = function dongshanzaiqi(userid,callback){
	var sql = 'call dongshanzaiqi(?,?)';
	var values = [];

	values.push(userid);
	values.push(gameConfig.dongshanzaiqi);

	//console.log(values)
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("dongshanzaiqi");
				console.log(err);
			}else{
				if (rows[0].length){
					callback(1,rows[0][0].k);
				}else{
					callback(0);
				}
				
			}
	 	})
		
		values = [];
	});
}

//创建首充
exports.firstrecharge = function firstrecharge(_userId,callback){
	var sql = "call recharge_first(?)";
	var values = [];

	values.push(_userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("firstrecharge");
				console.log(err);
				callback(0);
			}else{
				if (rows[0].length){
					callback(1,rows[0][0]);
				}else{
					callback(0);
				}
			}

	 	})
		
		values = [];

	});
}

//更新首充
exports.updateFirstrecharge = function updateFirstrecharge(_userId,_goodsid,callback){
	var sql = "call update_recharge_first(?,?)";
	var values = [];

	values.push(_userId);
	values.push(_goodsid);
	console.log(_userId);
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
	 		connection.release();
			if (err)
			{
				console.log("updateFirstrecharge");
				console.log(err);
				callback(0);
			}else{
				if (rows[0].length){
					callback(1,rows[0][0]);
				}else{
					callback(0);
				}
			}

	 	})
		
		values = [];

	});
}

