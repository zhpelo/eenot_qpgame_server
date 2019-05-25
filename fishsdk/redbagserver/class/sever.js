var User = require("./User");
var schedule = require("node-schedule");
var io = require('socket.io');
var gameConfig = require("./../config/gameConfig")
var gameDao = require("./../dao/gameDao");



var Sever = function(){

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
		this.sendCoinTime = 0;
		this.notingTime = 0;


		this.downTimeMax = gameConfig.downTimeMax;	//下注30秒
		this.downEndTimeMax = 3;
		this.openTimeMax = 3;
		this.openTimeEndMax = 0;
		this.sendCoinTimeMax = 0;
		this.notingTimeMax = 5;
		
		//每桌一个数组
		this.fishList = new Array(500);
		this.delfishList = new Array();
		this.state = gameConfig.gameState.noting;

		//初始化桌子
		for(var i = 0 ; i < this.tableMax ;i++){
			this.tableList[i] = new Array(this.seatMax + 1);
			//初始化鱼数组
			this.fishList[i] = {};
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

	　　});

		console.log("28初始化完毕");
	}

	this.downCoinBegin = function(){
		console.log("下注开始")
		this.downTime = this.downTimeMax;
		this.state = gameConfig.gameState.downTime;
	}

	this.downCoinEnd = function(){
		console.log("下注结束")
		console.log("等待开奖开始")
		this.downEndTime = this.downEndTimeMax;
		this.state = gameConfig.gameState.downTimeEnd;
		
	}

	this.open = function(){
		console.log("等待开奖结束")
		console.log("开奖开始")
		this.openTime = this.openTimeMax;
		this.state = gameConfig.gameState.open;
		
	}

	this.openEnd = function(){
		console.log("开奖结束")
		console.log("下场即将开始")
		this.openEndTime = this.openTimeEndMax;
		this.state = gameConfig.gameState.openEnd;
		
	}

	this.sendCoin = function(){
		//console.log("等待发奖结束")
		//console.log("发奖开始")
		this.sendCoinTime = this.sendCoinTimeMax;
		this.state = gameConfig.gameState.sendCoin;
		
	}

	this.noting = function(){
		console.log("发奖结束")
		console.log("下场即将开始")
		this.notingTime = this.notingTimeMax;
		this.state = gameConfig.gameState.noting;
		
	}

	this.jiesuan = function(){
		if (this.state == gameConfig.gameState.open){
			this.initMajiang();
			var tianWin = this.getwin(this.majiang[0],this.majiang[1],this.majiang[2],this.majiang[3])
			var diWin = this.getwin(this.majiang[0],this.majiang[1],this.majiang[4],this.majiang[5])
			var shunWin = this.getwin(this.majiang[0],this.majiang[1],this.majiang[6],this.majiang[7])
			var card = [];
			for(var i = 0 ; i < 8 ; i++){
				card.push(this.majiang[i]);
			}

			return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
		}else{
			return {result:0,card:[0,0,0,0,0,0,0,0]};
		}
	}

	this.getValue = function(_majiangA,_majiangB){
		if (_majiangA == _majiangB){
			return {value:_majiangA + 10,bet:9};
		}else if((_majiangA == 2 && _majiangB == 8) || (_majiangA == 8 && _majiangB == 2)){
			return {value:30,bet:10};
		}else{
			var value = (_majiangA + _majiangB) % 10;
			var bet = 0;
			if (value <= 1){
				bet = 1;
			}else if(value >= 8){
				bet = 8;
			}else{
				bet = value;
			}
			return {value:value,bet:bet};
		}
	}

	this.getwin = function(_majiang1A,_majiang1B,_majiang2A,_majiang2B){
		var player1Value = this.getValue(_majiang1A,_majiang1B);
		var player2Value = this.getValue(_majiang2A,_majiang2B);
		if (player1Value.value > player2Value.value){
			return -player1Value.bet;
		}else if (player1Value.value < player2Value.value){
			return player2Value.bet;
		}else{
			var player1Max = 0;
			var player2Max = 0;
			if (_majiang1A > _majiang1B){
				player1Max = _majiang1A;
			}else{
				player1Max = _majiang1B;
			}
			if (_majiang2A > _majiang2B){
				player2Max = _majiang2A;
			}else{
				player2Max = _majiang2B;
			}
			if (player1Max >= player2Max)
				return -player1Value.bet;
			else
				return player2Value.bet;
		}

	}

	this.initMajiang = function(){
		if (this.state == gameConfig.gameState.open){
			this.majiang = [];
			for(var i = 1 ; i <= 10 ; i++){
				for(var j = 0 ; j < 4 ; j++){
					this.majiang.push(i);
				}
			}
			//this.state = gameConfig.gameState.openEnd;
			
			for(var i = 0 ; i < this.majiang.length ; i++){
				var temp = this.majiang[i];
				var idx = Math.floor(Math.random()*this.majiang.length);
				this.majiang[i] = this.majiang[idx];
				this.majiang[idx] = temp;
			}
		}	
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
			 console.log("已经大于当前房间人数");
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
			console.log("error:找座位出错");
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

	this.init();

}


module.exports = Sever;

