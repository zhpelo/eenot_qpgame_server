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
		//serverRoomTemp.Server = 1;
		//serverRoomTemp.bet = 1;
		//serverRoomTemp.entryCoin = 100;
		//serverRoomTemp.ip = "127.0.0.1";
		//serverRoomTemp.prot = "13101";
		//serverGame.serverInfo.normal.push(serverRoomTemp);

		//serverRoomTemp = {};
		//serverRoomTemp.Server = 2;
		//serverRoomTemp.bet = 10;
		//serverRoomTemp.entryCoin = 1000;
		//serverRoomTemp.ip = "127.0.0.1";
		//serverRoomTemp.prot = "13102";
		//serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 10;
		serverRoomTemp.entryCoin = 3000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13103";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 50;
		serverRoomTemp.entryCoin = 15000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13104";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 5;
		serverRoomTemp.bet = 100;
		serverRoomTemp.entryCoin = 30000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13105";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 6;
		serverRoomTemp.bet = 500;
		serverRoomTemp.entryCoin = 150000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13106";
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
		serverRoomTemp.prot = "13111";
		serverGame.serverInfo.match.push(serverRoomTemp);
		
		GameConfig.push(serverGame);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 6;
		serverGame.GameName = "连线游戏";
		//serverGame1.ip = "192.168.1.170";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 1000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13601";
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
		serverRoomTemp.bet = 100;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 5000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13201";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 2;
		serverRoomTemp.bet = 200;
		serverRoomTemp.entryCoin = 10000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13202";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 500;
		serverRoomTemp.entryCoin = 25000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13203";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 1000;
		serverRoomTemp.entryCoin = 50000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13204";
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
		serverRoomTemp.prot = "0";
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
		serverRoomTemp.bet = 100;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 5000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13301";
		serverGame.serverInfo.normal.push(serverRoomTemp);


		serverRoomTemp = {};
		serverRoomTemp.Server = 2;
		serverRoomTemp.bet = 200;
		serverRoomTemp.entryCoin = 10000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13302";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 500;
		serverRoomTemp.entryCoin = 25000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13303";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 1000;
		serverRoomTemp.entryCoin = 50000;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13304";
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
		serverRoomTemp.prot = "14001";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);


		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 10;
		serverGame.GameName = "几何派对";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 1;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "14101";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 4;
		serverGame.GameName = "抢庄牛牛";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 100;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 5000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13401";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 2;
		serverRoomTemp.bet = 500;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 25000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13402";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 1000;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 50000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13403";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 2000;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13404";
		serverGame.serverInfo.normal.push(serverRoomTemp);


		serverGame = {}
		serverRoomTemp = {};
		serverGame.GameId = 5;
		serverGame.GameName = "经典牛牛";
		serverGame.serverInfo = {};
		//正常
		serverGame.serverInfo.normal = new Array();
		serverRoomTemp.Server = 1;
		serverRoomTemp.bet = 100;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 5000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13501";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 2;
		serverRoomTemp.bet = 500;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 25000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13502";
		serverGame.serverInfo.normal.push(serverRoomTemp);
		GameConfig.push(serverGame);

		serverRoomTemp = {};
		serverRoomTemp.Server = 3;
		serverRoomTemp.bet = 1000;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 50000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13503";
		serverGame.serverInfo.normal.push(serverRoomTemp);

		serverRoomTemp = {};
		serverRoomTemp.Server = 4;
		serverRoomTemp.bet = 2000;
		serverRoomTemp.Match = 0;
		serverRoomTemp.entryCoin = 100000;
		serverRoomTemp.gift = 0;
		serverRoomTemp.ip = "127.0.0.1";
		serverRoomTemp.prot = "13504";
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

		//获得进场数据
		this.getServerEnterCoinByProt = function(_port){
			for (var i = 0 ; i < GameConfig.length ; ++i){
				for(var j = 0 ; j < GameConfig[i].serverInfo.normal.length ; ++j){
					if (GameConfig[i].serverInfo.normal[j].prot == _port){
						return GameConfig[i].serverInfo.normal[j].entryCoin;
					}
				}
			}
			return -1;
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

