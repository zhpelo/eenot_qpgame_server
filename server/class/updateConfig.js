var fs = require('fs');
var log = require("./loginfo").getInstand;

var updateConfig = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化游戏
		this.init = function(){
			//更新配置
			this.updateConfig;
			this.shopConfig;
			this.noticeConfig;
			var self = this;
			var Cun;
			fs.readFile('./config/configtime.json',function(err,data){
			    //UPDATA重要文件
			    self.updateConfig=data.toString();
			})

			setInterval(function(){
				fs.readFile('./config/configtime.json',function(err,data){
					self.updateConfig=data.toString();
				})
			},60000)

			fs.readFile('./config/shopConfig.json',function(err,data){
			    //UPDATA重要文件
			    //console.log(data)
			    self.shopConfig=data.toString().trim();
			})

			setInterval(function(){
				fs.readFile('./config/shopConfig.json',function(err,data){
					//console.log(data)
					self.shopConfig=data.toString().trim();
				})
			},60000)

			fs.readFile('./config/noticeConfig.json','utf-8',function(err,data){
			    //UPDATA重要文件
			    //console.log(data)
			    self.noticeConfig=data.toString().trim();
			})

			setInterval(function(){
				fs.readFile('./config/noticeConfig.json','utf-8',function(err,data){
					//console.log(data)
					self.noticeConfig=data.toString().trim();
				})
			},60000)

			fs.readFile('./config/payConfig.json','utf-8',function(err,data){
			    //UPDATA重要文件
			    //console.log(data)
			    self.payConfig=data.toString().trim();
			})

			setInterval(function(){
				fs.readFile('./config/payConfig.json','utf-8',function(err,data){
					//console.log(data)
					self.payConfig=data.toString().trim();
				})
			},60000)
			//商城物品
		};

		this.getUpdateCoifig = function(){
			return this.updateConfig;
		}

		this.getShopConfig = function(){
		    try{
		      var data = JSON.parse(this.shopConfig);
		      return data;
		    }
		    catch(e){
		      log.warn('getShopConfig');
		    }
		}

		this.getNoticeConfig = function(){
		    try{
			    var data = JSON.parse(this.noticeConfig);
			    return data;
		    }
		    catch(e){
		      log.warn('getNoticeConfig');
		    }
			//return this.noticeConfig;
		}

		this.getPayConfig = function(){
		    try{
		      var data = JSON.parse(this.payConfig);
		      return data;
		    }
		    catch(e){
		      log.warn('getPayConfig');
		    }
		}
		//运行初始化
		this.init();
	}


	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		console.log("初始化配置文件");
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()


module.exports = updateConfig;

