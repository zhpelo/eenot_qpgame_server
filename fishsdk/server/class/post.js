var http = require('http');
var crypto = require('crypto');
var querystring = require("querystring");

var Post = {}
Post.postExchange = function(_info,callback){
	var md5string = _info.Account + _info.PhoneNo + _info.OrderId + _info.Key;
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	_info.Sign = md5_sign.digest('hex');

	var reqData = querystring.stringify({
 		Type:_info.Type,
 		Account:_info.Account,
 		PhoneNo:_info.PhoneNo,
 		OrderId:_info.OrderId,
 		CardNum:_info.CardNum,
 		Sign:_info.Sign
	});
 
	var url = "http://www.bosengame.com:8088/BoSenWebServer.aspx?" + reqData;

	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
				if (htmldata.Result.Status == 0){
					callback(true);
				}else{
					callback(false);
				}
			}
			catch(e){
			  console.log('post BoSenWebServer error..');
			}

	        //console.log(htmldata)
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			callback(false);
	});
}

Post.postbindPhone = function(_info,callback){
	console.log(_info)
	var md5string = _info.Account +  _info.PhoneNo +  _info.Key;
	console.log(md5string)
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	_info.Sign = md5_sign.digest('hex');

	var reqData = querystring.stringify({
 		Type:_info.Type,
 		Account:_info.Account,
 		PhoneNo:_info.PhoneNo,
 		Messages:_info.checkNo,
 		Sign:_info.Sign
	});
 
	var url = "http://www.bosengame.com:8088/BoSenWebServer.aspx?" + reqData;
	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
				if (htmldata.Result.Status == 0){
					callback(true);
				}else{
					callback(false);
				}
			}
			catch(e){
			  console.log('post BoSenWebServer error..');
			}
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			callback(false);
	});
}

Post.sendApi = function(userid){
	var md5string = userid + "87bb72342a3344c2";
  	var md5_sign = crypto.createHash('md5');
	md5_sign.update(md5string);
	var Sign = md5_sign.digest('hex');

	var reqData = querystring.stringify({
 		merid:userid,
 		keycode:Sign
	});

	var url = "http://120.76.200.182:3210/qureyU.aspx?" + reqData;
	http.get(url, function(res) {
		var size = 0;
		var chunks = [];

		res.on('data', function(chunk){
			size += chunk.length;
			chunks.push(chunk);
		});

		res.on('end', function(){
			var data = Buffer.concat(chunks, size);
			try{
			  	var htmldata = JSON.parse(data.toString());
			}
			catch(e){
			  console.log('post qureyU error..');
			}
	        //console.log(htmldata)
		});

	}).on('error', function(e) {
			console.log("Got error: " + e.message);
			//callback(false);
	});
}


module.exports = Post;




