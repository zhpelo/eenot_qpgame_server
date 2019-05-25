var mysql = require('mysql')
var async = require('async'); 

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	port:'23306',
	database:'28game'
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
//开奖结果
exports.addMatch = function addMatch(Info,serverId){
	var sql = "call addMatch(?,?,?,?,?,?,?,?)";
	var values = [];
	values.push(Info.card[0] + "" + Info.card[1]);
	values.push(Info.card[2] + "" + Info.card[3]);
	values.push(Info.card[4] + "" + Info.card[5]);
	values.push(Info.card[6] + "" + Info.card[7]);
	values.push(Info.jieguo[0]);
	values.push(Info.jieguo[1]);
	values.push(Info.jieguo[2]);
	values.push(serverId);
	
	pool.getConnection(function(err,connection){

	 	connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("addMatch");
				console.log(err);
			}
		})
		connection.release();
		values = [];
		
	});
}

//28输赢记录
exports.downcoinLog = function downcoinLog(userInfo){
	var sql = "call downcoinlog(?,?,?,?,?,?,?,?,?,?,?,?,?)";
	//var sql = "INSERT INTO downcoinlog(userId,MatchId,downCoin,winCoin,open2,open3,open4,tax,isBanker,serverId,tableid) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
	var values = [];


	pool.getConnection(function(err,connection){
		for(var i= 0; i<userInfo.length ; i++){
			//console.log(userInfo[i])
			values.push(userInfo[i].userId);
			values.push(userInfo[i].MatchId);
			values.push(userInfo[i].downCoin);
			values.push(userInfo[i].useCoin);
			values.push(userInfo[i].winCoin);
			values.push(userInfo[i].open2);
			values.push(userInfo[i].open3);
			values.push(userInfo[i].open4);
			values.push(userInfo[i].tax);
			values.push(userInfo[i].isBanker);
			values.push(userInfo[i].serverId);
			values.push(userInfo[i].tableid);
			values.push(userInfo[i].gameId);
			connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log(err);

			}})
			values = [];
		}
		connection.release();
		values = [];
		
	});
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
	var sql = "SELECT MAX(matchId) as maxid FROM matchlog where serveId=?";

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

