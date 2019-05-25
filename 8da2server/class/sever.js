var User = require("./User");
var schedule = require("node-schedule");
var io = require('socket.io');
var gameConfig;
var gameDao = require("./../dao/gameDao");
var log = require("./loginfo").getInstand;


var Sever = function(_config){
	gameConfig = _config;
	//当前比赛剩余时间
	//this.MatchTime = -100;
	this.isSendEndMsg = false;
	this.matchId = 0;
	this.MatchLogin = true;
	this.isSendPrize = false;
	this.cleanRank = false;
	this.ApplyFlag = true;

	this.init = function(){

		//创建桌子
		//暂定500张
		this.seatMax = gameConfig.seatMax;				//座位最大数量
		this.tableMax = gameConfig.tableMax;
		this.fishCountMax = 10000;						//一个服务器最多鱼1000条
		this.tableList = new Array(this.tableMax);
		this.onlienPepole = 0;
		this.roomid = 1;
		this.fishId = 0;



		this.downTime = 0;
		this.downEndTime = 0;
		this.openTime = 0;
		this.openEndTime = 0;
		this.changeZhangTime = 0;
		this.notingTime = 0;

		this.shuffle = 3;
		this.notingTimeMax =  this.shuffle + 1;
		this.downTimeMax = this.notingTimeMax + gameConfig.downTimeMax;	//下注20秒
		this.downEndTimeMax = this.downTimeMax + 3;
		this.sendCard = this.downEndTimeMax + 6;
		this.openTimeMax = this.sendCard + 9;
		this.openTimeEndMax = this.openTimeMax + 1;
		this.ChangZhangMax = this.openTimeEndMax + gameConfig.changeBankerTimeMax;
		this.noting2TimeMax =  this.ChangZhangMax + 1;
		
		//每桌一个数组
		this.fishList = new Array(500);
		this.delfishList = new Array();
		this.state = gameConfig.gameState.noting;

		this.yupai = new Array(this.tableMax);
		this.yupaiIdx = new Array(this.tableMax);
		this.majiang = new Array(this.tableMax);
		this.time = new Array(this.tableMax);
		this.state = new Array(this.tableMax);




		//初始化桌子
		for(var i = 0 ; i < this.tableMax ;i++){
			this.tableList[i] = new Array(this.seatMax + 1);
			//初始化扑克
			this.yupai[i] = [];
			this.majiang[i] = [];
			this.state[i] = gameConfig.gameState.noting;
			this.time[i] = -1;

			for (var j = 0; j < 4; j++){
				for (var z = 1; z < 11 ; z++){
					this.yupai[i].push(z + (j * 13));
				}
			}

			this.yupaiIdx[i] = 40;
		}



		//出鱼定时器
	　　var rule = new schedule.RecurrenceRule();

	　　var times = [];

	　　for(var i=0; i<60; i++){
	　　　　times.push(i);
	　　}
	　　rule.second = times;
		var c = 0;
		var self = this;
	　　var j = schedule.scheduleJob(rule, function(){
			for(var z = 0 ; z < self.tableMax ; z++){
				if (self.time[z] > 0 && self.time[z] <= self.shuffle){
					//console.log(z + "洗牌");
					self.state[z] = gameConfig.gameState.shuffle;
				}else if (self.time[z] > self.shuffle && self.time[z] <= self.notingTimeMax){
					//console.log(z + "等待下注");
					self.state[z] = gameConfig.gameState.noting;
				}else if(self.time[z] > self.notingTimeMax && self.time[z] <= self.downTimeMax){
					//console.log(z + "下注");
					self.state[z] = gameConfig.gameState.downTime;
					self.initMajiang(z);
				}else if(self.time[z] > self.downTimeMax && self.time[z] <= self.downEndTimeMax){
					//console.log(z + "下注结束");
					self.state[z] = gameConfig.gameState.downTimeEnd;
				}else if(self.time[z] > self.downEndTimeMax && self.time[z] <= self.sendCard){
					//console.log(z + "发牌");
					self.state[z] = gameConfig.gameState.sendCardTime;
				}else if(self.time[z] > self.sendCard && self.time[z] <= self.openTimeMax){
					//console.log(z + "开奖");
					self.state[z] = gameConfig.gameState.open;
				}else if(self.time[z] > self.openTimeMax && self.time[z] <= self.openTimeEndMax){
					//console.log(z + "开奖结束");
					self.state[z] = gameConfig.gameState.openEnd;
				}else if(self.time[z] > self.openTimeEndMax && self.time[z] <= self.ChangZhangMax){
					//console.log(z + "换庄家");
					self.state[z] = gameConfig.gameState.changeZhuang;
				}else if(self.time[z] > self.ChangZhangMax && self.time[z] <= self.noting2TimeMax){
					//console.log(z + "等待下一场");
					self.state[z] = gameConfig.gameState.noting2;
				}else if(self.time[z] > self.noting2TimeMax){
					//console.log(z + "重置");
					self.jureset(z);
				}
				if (self.time[z] >= 0){
					++self.time[z];
				}
				
			}
	　　});

		console.log("八达二初始化完毕");
	}

	this.getDownTime = function(tableId){
		var value = gameConfig.downTimeMax - (this.time[tableId] - this.notingTimeMax) + 2;
		if (value <= gameConfig.downTimeMax && value >= 0)
			return value;
		else
			return 0;
	}

	this.changeBankerTime = function(tableId){
		var value = gameConfig.changeBankerTimeMax - (this.time[tableId] - this.openTimeEndMax) + 1;
		if (value <= gameConfig.changeBankerTimeMax && value >= 0)
			return value;
		else
			return 0;
	}


	this.jiesuan = function(tableId){
		if (this.state[tableId] == gameConfig.gameState.open){

			var tianWin = this.getwin(this.majiang[tableId][0],this.majiang[tableId][1],this.majiang[tableId][2],this.majiang[tableId][3])
			var diWin = this.getwin(this.majiang[tableId][0],this.majiang[tableId][1],this.majiang[tableId][4],this.majiang[tableId][5])
			var shunWin = this.getwin(this.majiang[tableId][0],this.majiang[tableId][1],this.majiang[tableId][6],this.majiang[tableId][7])
			var card = [];
			for(var i = 0 ; i < 8 ; i++){
				card.push(this.majiang[tableId][i]);
			}
			return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
		}else{
			return {result:0,card:[0,0,0,0,0,0,0,0]};
		}
	}

	this.agjiesuan = function(_idx){
			var temp = [];
			temp[0] = this.majiang[0][0];
			temp[1] = this.majiang[0][1];
			this.majiang[0][0] = this.majiang[0][_idx * 2];
			this.majiang[0][1] = this.majiang[0][_idx * 2 + 1];
			this.majiang[0][_idx * 2] = temp[0];
			this.majiang[0][_idx * 2 + 1] = temp[1];
			var tianWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][2],this.majiang[0][3])
			var diWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][4],this.majiang[0][5])
			var shunWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][6],this.majiang[0][7])
			var card = [];
			for(var i = 0 ; i < 8 ; i++){
				card.push(this.majiang[0][i]);
			}

			return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
	}

	this.getx = function(){
		var tianWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][2],this.majiang[0][3])
		var diWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][4],this.majiang[0][5])
		var shunWin = this.getwin(this.majiang[0][0],this.majiang[0][1],this.majiang[0][6],this.majiang[0][7])
		var card = [];
		for(var i = 0 ; i < 8 ; i++){
			card.push(this.majiang[0][i]);
		}

		return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
	}

	this.getValue = function(_majiangA,_majiangB){
		if (_majiangA == _majiangB){
			return {value:_majiangA + 10,bet:2};
		}else{
			var value = (_majiangA + _majiangB) % 10;
			var bet = 1;
			return {value:value,bet:bet};
		}
	}

	this.getwin = function(_majiang1A,_majiang1B,_majiang2A,_majiang2B){
		var player1Value = this.getValue(_majiang1A % 13,_majiang1B % 13);
		var player2Value = this.getValue(_majiang2A % 13,_majiang2B % 13);

		//大家都是对子
		if(player1Value.bet == 1 && player2Value.bet == 2){
			return 2;
		}else{
			if (player1Value.value >= player2Value.value){
				return -1;
			}else{
				return 1;
			}
		}
	}

	this.initMajiang = function(_tableid){
		if (this.state[_tableid] == gameConfig.gameState.downTime && !this.majiang[_tableid].length){
			
				if (this.yupaiIdx[_tableid] == 40){
					//重新洗牌
					for(var j = 0 ; j < 40 ; j++){
						var idx = Math.floor(Math.random() * 40);
						var temp = this.yupai[_tableid][j];
						this.yupai[_tableid][j] = this.yupai[_tableid][idx];
						this.yupai[_tableid][idx] = temp;
					}
					this.yupaiIdx[_tableid] = 0;
					log.info("桌子" + _tableid + "洗牌完毕!");
				}

				for(var j = 0 ; j < 8; j++){
					this.majiang[_tableid][j] = this.yupai[_tableid][this.yupaiIdx[_tableid] + j];
				}


				this.yupaiIdx[_tableid] += 8;
		}
	}

	//每局重置
	this.jureset = function(tableId){
		this.majiang[tableId] = [];
		if (this.yupaiIdx[tableId] == 40){
			this.time[tableId] = 0;
		}else{
			this.time[tableId] = this.shuffle + 1;
		}
	}

	//上庄重置
	this.reset = function(tableId){
		this.yupaiIdx[tableId] = 40;
		this.time[tableId] = 0;
		this.majiang[tableId] = [];
	}

	//没有上庄,停止计时
	this.stop = function(tableId){
		this.time[tableId] = -1;
	}

	this.getRemainCardCount = function(tableId){
		//console.log("here")
		return 40 - this.yupaiIdx[tableId];
	}

	//是否可以下注
	this.ApplyDown = function(){
		if (this.state == gameConfig.gameState.downTime){
			return true;
		}else{
			return false;
		}
	}

	//是否可以登录
	this.ApplyLogin = function(){
		//如果申请登录玩家当场有下注并在发奖期
		if (this.state == gameConfig.gameState.open){
			return false;
		}else{
			return true;
		}
	}

	//设置io
	this.setIo = function(_io,_Csocket){
		this.io = _io;
		this.Csocket = _Csocket;
	}


	//进入房间
	this.LoginRoom = function(_user,_socket){
		if (this.onlienPepole > this.tableMax * this.seatMax){
			 log.warn("已经大于当前房间人数");
			 return {tableId:-1,seatId:-1};
		}
		++this.onlienPepole;
		var tableidx = -1;
		var seatidx = -1;
		var nullseat = false;
		for(var i = 0; i < this.tableMax ; i++){
			for (var j = 0 ; j < this.seatMax; j++){
				if (!this.tableList[i][j]){
					nullseat = true;
					tableidx = i;
					seatidx = j;
					break;
				}
			}
			if (nullseat){
				break;
			}
		}

		if (tableidx == -1 || seatidx == -1){
			log.err("error:找座位出错");
			return {tableId:-1,seatId:-1};
		}

		//console.log("座位:" + tableidx + "桌," + seatidx + "个位置");
		var tablestring = "table"+tableidx;
		_user.loginTable(tableidx);
		_user.loginSeat(seatidx);

		//分配座位
		//寻找空座位
		this.tableList[tableidx][seatidx] = _socket.userId;
		this.tableList[tableidx][this.seatMax] = 1; 

		//把当前socket加入当前桌子分组
		var tablestring = "table"+tableidx;
		_socket.join(tablestring);	

		return {tableId:tableidx,seatId:seatidx};
	}

	//离开房间
	this.LogoutRoom = function(_User,_socket){
		//console.log("有人离开桌子");
		var tableid = _User.getTable();
		var seatid = _User.getSeat()
		//没有任何座位信息
		if (tableid == -1 || seatid == -1) return;
		//console.log("座位," + tableid + "桌," + seatid + "个位置");
		//分配座位
		//寻找空座位
		this.tableList[tableid][seatid] = null;
		--this.onlienPepole;

		//检测当前桌子还是否有人
		var isOnline = false;
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[tableid][i]){
				isOnline = true;
				break;
			}
		}
		if (!isOnline){
			this.tableList[tableid][this.seatMax] = 0;
		}

		var tablestring = "table"+tableid;
		_socket.leave(tablestring);	
	}

	//断线
	this.lineOut = function(_User,_socket){
		var tableid = _User.getTable();
		var tablestring = "table"+tableid;
		_socket.leave(tablestring);	
	}

	//进入房间
	this.LoginRoombyLineOut = function(_user,_socket,_tableidx,_seatidx){
		var tableidx = _tableidx;
		var seatidx = _seatidx;

		var tablestring = "table"+tableidx;
		_user.loginTable(tableidx);
		_user.loginSeat(seatidx);

		this.tableList[tableidx][seatidx] = _socket.userId;

		//把当前socket加入当前桌子分组
		var tablestring = "table"+tableidx;
		_socket.join(tablestring);	

		return {tableId:tableidx,seatId:seatidx};
	}

	//清理已经断线的用户
	this.cleanLineOut = function(_tableid,_seatid){
		var tableid = _tableid;
		var seatid = _seatid;
		//没有任何座位信息
		if (tableid == -1 || seatid == -1) return;

		this.tableList[tableid][seatid] = null;
		--this.onlienPepole;

		//检测当前桌子还是否有人
		var isOnline = false;
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[tableid][i]){
				isOnline = true;
				break;
			}
		}
		if (!isOnline){
			this.tableList[tableid][this.seatMax] = 0;
		}
	}

	this.init(_config);

}


module.exports = Sever;

