var dao = require("./../dao/dao")
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

function md53(data) {
    var Buffer = require("buffer").Buffer;
    var buf = new Buffer(data);
    var str = buf.toString("binary");
    return crypto.createHash("md5").update(str).digest("hex");
}

var key = "42dfcb34fb02d8cd";


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
				//console.log(md53(content));
				//console.log(req.query.sign);
				sendStr = '{"status":1,"msg":"参数不正确!"}'
				callback(sendStr);
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
			if (Rusult == 1){
				//成功
				if (rcode){
					console.log("微信注册成功:accountname:" + userInfo.accountname + " goldnum:" + userInfo.goldnum)
				}else{
					console.log("微信登录成功:accountname:" + userInfo.accountname)	
				}
				sendStr = '{"status":0,"msg":"","data":{"loginCode":"'+ userInfo.loginCode +'","account":"' + userInfo.accountname +'","id":'+rcode+'}}'
			}
			else if (Rusult == 0){
				//失败
				sendStr = '{"status":1,"msg":"信息错误或用户名重复,注册失败!"}'
			}else if (Rusult == 2){
				sendStr = '{"status":2,"msg":"登录过快"}'
			}

			callback(sendStr);
			});
		}

	}
}



module.exports = api;