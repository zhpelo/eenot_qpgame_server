var dao = require("./../dao/dao")
var gameInfo = require('./../class/game').getInstand;
var crypto = require('crypto');
var http = require('http');

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

function md53(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex");
}


var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }

    console.log(ip)
    if(ip.split(':').length>0){
        ip = ip.split(':')[3]
    }
    return ip;
};

function createUser(username,password,fullname,agc,callback) {
				
	var key_login = "89b5b987124d2ec3";
	content = username + password + key_login;
	
	var userInfo = {};
	userInfo.accountname = username;
	userInfo.pwd = md53(content);
	userInfo.nickname = fullname;
	userInfo.goldnum = 0;
	userInfo.p = password;
	userInfo.phoneNo = "";
	userInfo.email = "";
	userInfo.sex = "";
	userInfo.city = "";
	userInfo.province = "";
	userInfo.country = "";
	userInfo.headimgurl = "";
	userInfo.language = "";
	userInfo.loginCode = "";
	userInfo.ChannelType = agc;
	userInfo.bindUserId = "";
	userInfo.did = "";
	//直接操作数据库
	dao.weixinCreateUser(userInfo,function(Rusult,rcode){
		callback(Rusult);
	});
}

var key = "42dfcb34fb02d8cd";
var i="0"+1;

//var Newtime =Date.parse(new Date())/1000;

var api = function(req,callback){
	var sendStr = '0';

	if (req.query.act == "weixinLogin"){
		//注册

		if (!req.query.goldnum)
		{
			req.query.goldnum = 0;
		}
		if (req.query.accountname && req.query.nickname && req.query.pwd && req.query.time && req.query.sign)
		{

			//验证md5
			var content = req.query.act + req.query.accountname + req.query.nickname + req.query.pwd + req.query.time + key;	
			
			//console.log(content);
			if (md53(content) != req.query.sign){
//				console.log(md53(content));
//				console.log(req.query.sign);
				sendStr = '{"status":1,"msg":"参数不正确!"}'
				callback(1,sendStr);
				return;
			}
			//密码加密MD5
			var key_login = "89b5b987124d2ec3";
			content = req.query.accountname + req.query.pwd + key_login;
			var md5_sign = crypto.createHash('md5');
			md5_sign.update(content);


			key_login = "time@k3lss0x3";
			content = req.query.accountname + req.query.time + key_login;
			var md5_sign_login = crypto.createHash('md5');
			md5_sign_login.update(content);

			var userInfo = {};
			userInfo.accountname = req.query.accountname;
			userInfo.pwd = md5_sign.digest('hex');
			userInfo.nickname = req.query.nickname;
			userInfo.goldnum = req.query.goldnum;
			userInfo.p = req.query.pwd;
			userInfo.phoneNo = req.query.phoneNo;
			userInfo.email = req.query.email;
			userInfo.sex = req.query.sex;
			userInfo.city = req.query.city;
			userInfo.province = req.query.province;
			userInfo.country = req.query.country;
			userInfo.headimgurl = req.query.headimgurl;
			userInfo.language = req.query.language;
			userInfo.loginCode = md5_sign_login.digest('hex');
			userInfo.ChannelType = req.query.ChannelType;
			userInfo.bindUserId = req.query.bindUserId;
			userInfo.did = req.query.did;
			
			//直接操作数据库
			dao.weixinCreateUser(userInfo,function(Rusult,rcode){
			if (Rusult){
				//成功
				if (rcode){
					//console.log("微信注册成功:accountname:" + userInfo.accountname + " goldnum:" + userInfo.goldnum)
				}else{
					//console.log("微信登录成功:accountname:" + userInfo.accountname)	
				}
				sendStr = '{"status":0,"msg":"","data":{"loginCode":"'+ userInfo.loginCode +'","account":"' + userInfo.accountname +'","id":'+rcode+'}}'
			}
			else{
				//失败
				sendStr = '{"status":1,"msg":"信息错误或用户名重复,注册失败!"}'
			}

			callback(1,sendStr);
			});
		}

		}else if (req.query.act =="getGuessA"){	
			var newDate = new Date();  
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
			var h = stringDate.replace(/\s+/g,"");
			var m = h.replace(/\-/g,"");
			var s = m.replace(/\:/g,"")+i;
			
			
			
			var keys = Math.ceil(Math.random()*9);
			var keys2 = Math.ceil(Math.random()*9);
			var keys3 = Math.ceil(Math.random()*9);
			var numbb  = String.fromCharCode(65+keys);
			var numbb2  = String.fromCharCode(65+keys2);
			var numbb3  = String.fromCharCode(65+keys3);
			var daili = req.query.daili;
			var time_name=daili+s;
			var king = keys+numbb+keys2+numbb2+keys3+numbb3;
			
			var contents =req.query.act+req.query.daili+req.query.time+key;
//			console.log(req.query.act+req.query.daili+req.query.time);
		
			if (md53(contents) != req.query.sign){
//				console.log(md53(contents));
//				console.log(req.query.sign)
				sendStr = '{"status":1,"msg":"参数不正确!"}';
				callback(1,sendStr);
				return;
			}
			
			i++;
			var stri=i;
			if(i<10){
				i="0"+i;
				stri=i
			}else{
				i=i;
				stri=i;
			}
			if(i>=99){
				
				i="0"+1;}
			
				console.log(stri)
			var Dirs=s.split('');
			
			var Arr1 = Dirs[3]+Dirs[5]+Dirs[7]+Dirs[9]+Dirs[11]+stri;
			
			var key_login = "89b5b987124d2ec3";
			content = time_name + king + key_login;
			var md5_sign = crypto.createHash('md5');
			md5_sign.update(content);
			
			var userInfo = {};
			userInfo.accountname = time_name;
			userInfo.pwd = md5_sign.digest('hex');
			userInfo.nickname = "游客"+Arr1;
			userInfo.goldnum = 1800;
			userInfo.p = king;
			userInfo.phoneNo = "";
			userInfo.email = "";
			userInfo.sex = "";
			userInfo.city = "";
			userInfo.province = "";
			userInfo.country = "";
			userInfo.headimgurl = "";
			userInfo.language = "";
			userInfo.loginCode = "";
			userInfo.ChannelType = req.query.daili;
			userInfo.bindUserId = "";
			userInfo.did = "";
			
			console.log(Arr1);
			
			//直接操作数据库
			dao.weixinCreateUser(userInfo,function(Rusult,rcode){
			if (Rusult){
				//成功
				if (rcode){
					//console.log("微信注册成功:accountname:" + userInfo.accountname + " goldnum:" + userInfo.goldnum)
				}else{
					//console.log("微信登录成功:accountname:" + userInfo.accountname)	
				}
				sendStr = '{"status":0,"msg":"","data":{"password":"'+ king +'","account":"' + time_name +'"}}'
			}
			else{
				//失败
				sendStr = '{"status":1,"msg":"信息错误或用户名重复,注册失败!"}'
			}
				callback(1,sendStr);
		
			});
					
//		callback(sendStr);
		}
}



module.exports = api;