var ServerInfo = function(){

	var _serverinfo = "";

	var Server = function(){

		var GameConfig = new Array();
		var serverGame = {}
		var serverRoomTemp = {};
		serverGame.GameId = 1;
		serverGame.GameName = "捕鱼游戏";
		//serverGame1.ip = "192.168.1.170";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 100;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3101";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 2;
		serverRoomTemp.bet = 500;
		serverRoomTemp.entryCoin = 50000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3102";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 1000;
		serverRoomTemp.entryCoin = 100000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3103";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 5000;
		serverRoomTemp.entryCoin = 500000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3104";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 5;
		serverRoomTemp.bet = 10000;
		serverRoomTemp.entryCoin = 1000000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3105";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 6;
		serverRoomTemp.bet = 50000;
		serverRoomTemp.entryCoin = 5000000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3106";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		//礼物
		serverGame.serverInfo.gift = new Array();
		//比赛
		serverGame.serverInfo.match = new Array();
		serverRoomTemp = {};
		serverRoomTemp.Server = 11;
		serverRoomTemp.bet = 1;
		serverRoomTemp.entryCoin = 500;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3111";
		serverGame.serverInfo.match.push(serverRoomTemp);
		
		GameConfig.push(serverGame);
		// var serverRoom2 = {};
		// serverRoom2.Server = 2;
		// serverRoom2.bet = 5;
		// serverRoom2.Match = 1;
		// serverRoom2.entryCoin = 500;
		// serverRoom2.gift = 0;
		// serverRoom2.ip = "127.0.0.1";
		// serverRoom2.prot = "3104";
		// serverGame1.serverInfo.push(serverRoom2);
		// GameConfig.push(serverGame1);
		// var serverRoom3 = {};
		// serverRoom3.Server = 3;
		// serverRoom3.bet = 5;
		// serverRoom3.Match = 1;
		// serverRoom3.entryCoin = 500;
		// serverRoom3.gift = 0;
		// serverRoom3.ip = "127.0.0.1";
		// serverRoom3.prot = "3105";		
		// serverGame1.serverInfo.push(serverRoom3);
		// GameConfig.push(serverGame1);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 2;
		serverGame.GameName = "连线游戏";
		//serverGame1.ip = "192.168.1.170";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3102";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 3;
		serverGame.GameName = "28游戏";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 500;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3201";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 4;
		serverGame.GameName = "红包游戏";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3401";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);


		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 5;
		serverGame.GameName = "八搭二游戏";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "3501";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 10;
		serverGame.GameName = "牛牛游戏";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "4001";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);


		//初始
		this.init = function(){

		};

		this.getServerNameById = function(_id){
			return GameConfig[0].GameName;
		}

		this.getServerIpById = function(_id){
			return GameConfig[0].GameId;
		}

		//通过ID获得服务器关键信息
		this.getServerInfoById = function(_id){
			return GameConfig[_id - 1];
		}

		this.getServerAll = function(){
			return GameConfig;
		}

		this.socketList = {};

		this.setScoket = function(_idx,_socket){
			this.socketList[_idx] = _socket;
			_socket.serverGameid = _idx;
		}

		this.getScoket = function(_idx){
			return this.socketList[_idx];
		}

		this.getScoketList = function(){
			return this.socketList;
		}
		//运行初始化
		this.init();
	}

	if (_serverinfo){
		return {getInstand:_serverinfo}
	}
	else{
		console.log("####create ServerInfo!####");
		_serverinfo = new Server();
		return {getInstand:_serverinfo}
	}

}()


module.exports = ServerInfo;

