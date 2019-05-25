var mysql = require('mysql')
var async = require('async'); 

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	database:'fish'
})


//摇奖记录
exports.getLotteryLog = function getLotteryLog(userInfo,callback_c){

	pool.getConnection(function(err,connection){

		var values = [];

		values.push(userInfo.accountname);
		values.push(userInfo.recordBeginTime);


		async.waterfall([
			function(callback){
				var sql = "select * from useraccounts where Account=?";
				values.push(userInfo.accountname);
				connection.query({sql:sql,values:values},function(err,rows){
					values = [];
				if (err)
				{
					console.log(err);
					callback(err);
					//callback(0);
				}else{
					if (rows.length)
						callback(null, rows[0].Id);
					else{
						callback(1,"未找帐号:"+ userInfo.accountname+"到数据");
					}
				}})

			},
			function(arg1, callback){
				var sql = "select * from lotterylog where userid=? and lotteryTime >= ?";
				values.push(arg1);
				values.push(userInfo.recordBeginTime);
				//console.log(values)
				connection.query({sql:sql,values:values},function(err,rows){
					values = [];


				if (err)
				{
					console.log(err);
					callback(err);
				}else{
					if (rows.length)
						callback(null, rows);
					else{
						callback(1,"未找到ID:"+ arg1 +"数据");
					}
				}})
			}
		], function (err, result) {
		   // result now equals 'done'
		   //console.log(result)
		   if (err){
		   	console.log(err);
		   	console.log(result);
		   	callback_c(0);
		   }
		   else{
		   	callback_c(1,result);
		   }
		   	//console.log("1end");
		   	
		   	connection.release();
			values = [];
		});
	});
}


//摇奖记录
exports.lotteryLog = function lotteryLog(userInfo,callback){
	var sql = "INSERT INTO lotterylog(userid,bet,line_s,score_before,score_linescore,score_win,score_current,free_count_before,free_count_win,free_count_current,result_array) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
	var values = [];

	values.push(userInfo.userid);
	values.push(userInfo.bet);
	values.push(userInfo.lines);
	values.push(userInfo.score_before);
	values.push(userInfo.score_linescore);
	values.push(userInfo.score_win);
	values.push(userInfo.score_current);
	values.push(userInfo.free_count_before);
	values.push(userInfo.free_count_win);
	values.push(userInfo.free_count_current);
	values.push(userInfo.result_array);

	
	//console.log(values)
	//console.log(user.password)


	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

		connection.release();
		values = [];
		
	});
}

//捕鱼结算记录
exports.balanceLog = function balanceLog(userInfo,bulletActivity,everyWinCoinActivity,lvActivity,callback){
	var sql = "call addFishlog(?,?,?,?,?,?)";
	var values = [];
	values.push(userInfo.userid);
	values.push(userInfo.useCoin);
	values.push(userInfo.winCoin);
	values.push(bulletActivity);
	values.push(everyWinCoinActivity);
	values.push(lvActivity);
	
	if (userInfo.useCoin > 0)
	{
		pool.getConnection(function(err,connection){

		 	connection.query({sql:sql,values:values},function(err,rows){
				if (err)
				{
					console.log(err);
					callback(0);
				}else{
					callback(1);
				}})

			connection.release();
			values = [];
			
		});
	}else{
		callback(0);
	}
}

//比赛数据
exports.matchRandKing = function matchRandKing(userInfo,callback){
	var sql = "call updateMatchRandKing(?,?,?,?,?)";
	var values = [];


	

	pool.getConnection(function(err,connection){
		for (var i = 0 ; i < userInfo.length ; i++){

			values.push(userInfo[i].matchId);
			values.push(userInfo[i].userId);
			values.push(userInfo[i].score);
			values.push(userInfo[i].lastTime);
			values.push(userInfo[i].roomType);

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				callback(1);
			}})

			//connection.release();
			values = [];
		}

		connection.release();
		values = [];
		
	});
}

//获得比赛数据
exports.getMatchData = function getMatchData(userInfo,callback){
	var sql = "call getMatchRandKing(?,?,?)";
	var values = [];

	values.push(userInfo.matchId);
	values.push(userInfo.userId);
	values.push(userInfo.roomType);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				if (rows[0][0]){
					callback(rows[0][0]);
				}else{
					callback(0);
				}
				
			}})

		connection.release();
		values = [];
		
	});
}

exports.getMatchId = function getMatchId(_roomType,callback){
	var sql = "SELECT MAX(matchId) as maxid FROM matchRandking where roomType=?";

	var values = [];
	values.push(_roomType);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				if (rows[0].maxid){
					callback(rows[0].maxid);
				}else{
					callback(0);
				}
				
			}})

		connection.release();
		values = [];
		
	});
}


//上下分记录
exports.score_changeLog = function score_changeLog(userInfo){
	var sql = "INSERT INTO score_changelog(userid,score_before,score_change,score_current,change_type,isOnline) VALUES(?,?,?,?,?,?)";
	var values = [];

	values.push(userInfo.userid);
	values.push(userInfo.score_before);
	values.push(userInfo.score_change);
	values.push(userInfo.score_current);
	values.push(userInfo.change_type);
	values.push(userInfo.isOnline);
	
	//console.log(values)
	//console.log(user.password)

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
			}
		})

		connection.release();
		values = [];
		
	});
}

//奖池记录
exports.Update_score_pool = function Update_score_pool(poollist,Virtualpool,poollistlength,callback){
	var sql = "UPDATE score_pool SET score_pool_value1=?,score_pool_value2=?,score_pool_value5=?,score_pool_value10=?,score_pool_value20=?,score_pool_value50=?,score_pool_value100=?,virtual_score_pool_value=? WHERE id = 1";
	var values = [];

	for (var i = 0 ;i < poollistlength ; ++i){
		values.push(poollist[i]);
	}
	
	values.push(Virtualpool);


	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
			}
			callback();
		})

		connection.release();
		values = [];
		
	});
}

//获得奖池最新记录
exports.getScore_pools = function getScore_pools(callback){
	var sql = "SELECT * FROM score_pool WHERE id = 1";
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				if (rows.length == 0){
					callback(0);
				}else{
					callback(rows[0]);
					}
		 		}
	 		})
		connection.release();

	});
}

//更新道具
exports.getPropByUserId = function getPropByUserId(_userInfo,callback){
	var sql = 'CALL gameaccount.updateProp(?,?,?,?,1)';
	var values = [];

	values.push(_userInfo.userId);
	values.push(_userInfo.propId);
	values.push(_userInfo.propCount);
	values.push(_userInfo.roomid);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
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
		connection.release();
		values = [];
	});
}


//更新道具
exports.calculateRank = function calculateRank(_info,callback){
	var sql = 'CALL calculateRank(?,?)';
	var values = [];

	values.push(_info.matchId);
	values.push(_info.roomType);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
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
		connection.release();
		values = [];
	});
}

