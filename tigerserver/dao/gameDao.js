var mysql = require('mysql')
var async = require('async'); 

var pool = mysql.createPool({
	connectionLimit:10000,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	database:'tiger'
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

//获得免费次数
exports.getFreeCount = function getFreeCount(userInfo,callback_c){

	pool.getConnection(function(err,connection){

		var values = [];

		values.push(userInfo._userId);

		async.waterfall([
			function(callback){
				var sql = "select * from useraccounts where Id=?";
				connection.query({sql:sql,values:values},function(err,rows){
					//values = [];
				if (err)
				{
					console.log(err);
					callback(err);
					//callback(0);
				}else{
					callback(null, rows);
				}})

			},
			function(arg1, callback){
				if (!arg1.length)
				{
					var sql = "INSERT INTO useraccounts(Id) VALUES(?)";
					connection.query({sql:sql,values:values},function(err,rows){
					values = [];
					if (err)
					{
						console.log(err);
						callback(err);
					}else{
						var Result = {Id:userInfo._userId,freeCount:0,LotteryCount:0}
						//console.log("插入");
						callback(null, Result);
					}
					})
				}else{
					callback(null, arg1[0]);
				}

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
	var sql = "INSERT INTO lotterylog(userid,bet,line_s,score_before,score_linescore,score_win,score_current,free_count_before,free_count_win,free_count_current,result_array,mark) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
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

	if (userInfo.free_count_before > 0 && userInfo.score_win == 0){
		values.push(1);
	}else{
		values.push(0);
	}

	console.log(values)

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