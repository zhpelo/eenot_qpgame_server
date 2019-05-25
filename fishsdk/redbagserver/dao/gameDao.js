var mysql = require('mysql')
var async = require('async'); 

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	database:'redbag'
})


//金币记录
exports.score_changeLog = function score_changeLog(userInfo){
	var sql = "INSERT INTO gameaccount.score_changelog(userid,score_before,score_change,score_current,change_type,isOnline) VALUES(?,?,?,?,?,?)";
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
		values = [];
		
	});
}


exports.getRedbagId = function getRedbagId(callback){
	var sql = "SELECT MAX(redbagId) as bagId FROM baglog where serveId=?";

	var values = [];
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				if (rows[0].bagId){
					callback(rows[0].bagId);
				}else{
					callback(0);
				}
				
			}})

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

//添加红包记录
exports.redbaglog = function redbaglog(_info){
	var sql = 'INSERT INTO baglog(redbagId,sendId,coin,boom,tax,COUNT,serveId) VALUE(?,?,?,?,?,?,?)';
	var values = [];

	values.push(_info.redbagId);
	values.push(_info.userId);
	values.push(_info.sendBagCoin);
	values.push(_info.boomNum);
	values.push(_info.tax);
	values.push(10);
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("redbaglog");
				console.log(err);
			}
		})

		connection.release();
		values = [];
		values2 = [];
	});
}

//添加抢包记录
exports.lootbaglog = function lootbaglog(_info){
	var sql = "SELECT id FROM baglog where redbagId=? and serveId=?";

	var values = [];
	values.push(_info.redbagId);
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);
				callback(0);
			}else{
				if (rows.length){
					var sql2 = 'INSERT INTO bagbyidlog(bagId,userId,nickname,getscore,winCoin) VALUE';
					var values2 = [];
					if (_info.lootBagList.length > 0){
						for(var i = 0 ; i < _info.lootBagList.length; i++){
							if (i){
								sql2 += ','
							}
							sql2 += '(?,?,?,?,?)'
							values2.push(rows[0].id);
							values2.push(_info.lootBagList[i].userId);
							values2.push(_info.lootBagList[i].nickname);
							values2.push(_info.lootBagList[i].getCoin);
							values2.push(_info.lootBagList[i].winscore);
						}

						connection.query({sql:sql2,values:values2},function(err,rows){
							if (err)
							{
								console.log("redbagbyidlog");
								console.log(err);
							}
						})
						values2 = [];

					}

				}else{
				 	console.log("储蓄错误,找不到红包ID")
				}
				
			}})

		connection.release();
		values = [];
		
	});
}

exports.checkRedBag = function checkRedBag(redbagId,callback){
	var sql = "call checkRedBag(?,?)";

	var values = [];
	
	
	values.push(redbagId);
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("checkRedBag");
				console.log(err);
				callback(0);
			}else{
				if (rows[0][0].rcode){
					callback(1,rows[0]);
				}else{
					callback(0);
				}
				
			}})

		connection.release();
		values = [];
		
	});
}

//history
exports.getHistory = function getHistory(userId,callback){
	var sql = "SELECT redbagId,earnings,date_format(addTime,'%Y-%m-%d') as addTime FROM baglog WHERE sendId = ? ORDER BY id DESC LIMIT 10";

	var values = [];
	
	values.push(userId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("getHistory");
				console.log(err);
				callback(0);
			}else{
				if (rows.length){
					callback(1,rows);
				}else{
					callback(0);
				}
				
			}})

		connection.release();
		values = [];
		
	});
}

//更新红包的收益情况
exports.updateRedBag = function updateRedBag(_info,callback){
	var sql = 'update baglog set earnings = ? where redbagId=? and serveId=?';

	var values = [];

	values.push(_info.earnings);
	values.push(_info.redbagId);
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("updateRedBag");
				console.log(err);
			}
		})

		connection.release();
		values = [];
		
	});
}

//获得机器人
exports.getPool = function getPool(callback){
	var sql = 'call getPool(?)';

	var values = [];

	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("getPool");
				console.log(err);
			}else{
				callback(rows[0][0].pool)
			}
		})

		connection.release();
		values = [];
		
	});
}

//获得机器人
exports.setPool = function getPool(_pool){
	var sql = 'update pool set pool = ? where serverId=?';

	var values = [];

	values.push(_pool);
	values.push(gameConfig.serverId);

	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("setPool");
				console.log(err);
			}
		})

		connection.release();
		values = [];
		
	});
}


