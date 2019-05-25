var log4js = require('log4js');
log4js.configure({
   appenders: [
     { type: 'console' },{
       type: 'file', 
       filename: 'logs/log.log', 
       pattern: "yyyyMMddhh",
       maxLogSize: 1048000,
       backups:1000,
       //category: 'normal' 
     }
   ]

   //replaceConsole: true
});


var logoinfo = function(){

	var _gameinfo = "";

	var Game = function(){
		
		//初始化游戏
		this.init = function(){
			this.logInfo = log4js.getLogger();  
			this.logInfo.setLevel('info');
		}

		this.info = function(_str){
			this.logInfo.info(_str);
		}

		this.warn = function(_str){
			this.logInfo.warn(_str);
		}

		this.err = function(_str){
			this.logInfo.error(_str);
		}

		//运行初始化
		this.init();


	}



	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()


module.exports = logoinfo;

