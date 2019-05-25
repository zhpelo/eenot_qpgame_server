var mysql = require('mysql')
var async = require('async'); 
var crypto = require('crypto');

var pool = mysql.createPool({
	connectionLimit:10,
	host:'localhost',
	user:'root',
	password:'coco2016`',
	database:'tiger'
})

//摇奖记录
exports.ms =  function ms(userInfo,callback_c){

	pool.getConnection(function(err,connection){

		var values = [];
		var key = "89b5b987124d2ec3";
		async.waterfall([
			function(callback){
				var sql = "select * from useraccounts";
				connection.query({sql:sql},function(err,rows){
					values = [];
				if (err)
				{
					console.log(err);
					callback(err);
					//callback(0);
				}else{
					for(var i = 0 ; i < rows.length ; i++){
						values = [];
						var contend = rows[i].Account + rows[i].Password + key;

						var md5_sign = crypto.createHash('md5');
						md5_sign.update(contend);
  
						var sql_s = "UPDATE useraccounts SET Password=?,p=? WHERE Id=?";
						values.push(md5_sign.digest('hex'));
						values.push(rows[i].Password);
						values.push(rows[i].Id);
						console.log(i);
						//console.log(values)
						connection.query({sql:sql_s,values:values},function(err,rows){
							values = [];


							if (err)
							{
								console.log(err);
								callback(err);
							}})
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


