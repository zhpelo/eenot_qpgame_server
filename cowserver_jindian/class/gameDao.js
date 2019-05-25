var mysql = require('mysql')
var async = require('async'); 

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	port:'23306',
	database:'jindian_cow'
})

//开奖结果
exports.addMatch = function addMatch(addList,winList,tableId,serverId){
	var sql = "INSERT INTO matchlog(open11,open12,open13,open14,open15,open21,open22,open23,open24,open25,open31,open32,open33,open34,open35,open41,open42,open43,open44,open45,open51,open52,open53,open54,open55,open1winbet,open2winbet,open3winbet,open4winbet,open5winbet,tableId,serveId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
	var values = [];
	for(var i = 0 ; i < addList.length ;i ++){
		values.push(addList[i]);
	}
	for(var i = 0 ; i < winList.length ;i ++){
		values.push(winList[i]);
	}

	values.push(tableId);
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

//输赢记录
exports.downcoinLog = function downcoinLog(userInfo){
	var sql = "call downcoinlog(?,?,?,?,?,?,?,?,?,?,?,?)";
	//var sql = "INSERT INTO downcoinlog(userId,MatchId,callBet,selectBet,severBet,useCoin,winCoin,tax,isBanker,serverId,tableid) VALUES(?,?,?,?,?,?,?,?,?,?)";
	var values = [];


	pool.getConnection(function(err,connection){
		for(var i= 0; i<userInfo.length ; i++){
			console.log(userInfo[i])
			values.push(userInfo[i].userId);
			values.push(userInfo[i].MatchId);
			values.push(userInfo[i].callBet);
			values.push(userInfo[i].selectBet);
			values.push(userInfo[i].severBet);
			values.push(userInfo[i].useCoin);
			values.push(userInfo[i].winCoin);
			values.push(userInfo[i].tax);
			values.push(userInfo[i].isBanker);
			values.push(userInfo[i].serverId);
			values.push(userInfo[i].tableId);
			values.push(userInfo[i].gameId);
			connection.query({sql:sql,values:values},function(err,rows){
			if (err)
			{
				console.log("downcoinLog");
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


