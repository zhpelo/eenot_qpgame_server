var User = require("./../../CClass/class/User");
var schedule = require("node-schedule");
var io = require('socket.io');
var gameConfig = require("./../config/gameConfig")
var gameDao = require("./../../CClass/dao/gameDao");
var log = require("./../../CClass/class/loginfo").getInstand;


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


		//this.gameBegin = 3;
		this.timeCount = [];
		this.timeCount[0] = gameConfig.readyPlayTime;						//准备开始
		this.timeCount[1] =  this.timeCount[0] + gameConfig.callTime;		//抢庄
		this.timeCount[2] =  this.timeCount[1] + gameConfig.reCallTime;		//设置倍数
		this.timeCount[3] =  this.timeCount[2] + gameConfig.selectBetTime;	//凑牛
		this.timeCount[4] =  this.timeCount[3] + 6;	//开奖
		this.timeCount[5] =  this.timeCount[4] + 5;	//发金币,暂时不用
		this.timeCount[6] =  this.timeCount[5] + 1;	//准备下一场
		this.timeCount[7] =  this.timeCount[6] + 2;
		this.timeCount[8] =  this.timeCount[7] + 2;

		
		//每桌一个数组
		this.fishList = new Array(500);
		this.delfishList = new Array();
		this.state = gameConfig.gameState.noting;

		this.yupai = new Array(this.tableMax);
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
				for (var z = 1; z < 14 ; z++){
					this.yupai[i].push(z + (j * 13));
				}
			}

		}

		this.cardPoint = [];
		//初始化扑克牌权利值
		for(var i = 0  ; i < 4 ; ++i){
			for (var j = 1 ; j <= 13 ; j++){
				this.cardPoint[i * 13 + j] = ((j - 1) * 4) + 1 + i;
			}
		}

		//定时器
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

				
				//log.info(self.timeCount[0])
				//log.info(self.timeCount[1])
				if (self.time[z] > 0 && self.time[z] <= self.timeCount[0]){
					//log.info(self.getReadyPlayTime(z));
					log.info(z + "准备开始");
					self.state[z] = gameConfig.gameState.gameBegin;
				}else if (self.time[z] > self.timeCount[0] && self.time[z] <= self.timeCount[1]){
					//log.info(self.getCallTime(z));
					log.info(z + "发牌+抢庄");
					self.state[z] = gameConfig.gameState.sendCardTime;
				}else if(self.time[z] > self.timeCount[1] && self.time[z] <= self.timeCount[2]){
					//log.info(self.getReCallTime(z));
					log.info(z + "选倍数");
					self.state[z] = gameConfig.gameState.selectBet;
				}else if(self.time[z] > self.timeCount[2] && self.time[z] <= self.timeCount[3]){
					//log.info(self.getSelectBetTime(z));
					log.info(z + "凑牛");
					self.state[z] = gameConfig.gameState.coucow;
				}else if(self.time[z] > self.timeCount[3] && self.time[z] <= self.timeCount[4]){
					log.info(z + "开奖");
					self.state[z] = gameConfig.gameState.open;
				}else if(self.time[z] > self.timeCount[4] && self.time[z] <= self.timeCount[5]){
					log.info(z + "发奖");
					self.state[z] = gameConfig.gameState.sendCoin;
				}else if(self.time[z] > self.timeCount[5] && self.time[z] <= self.timeCount[6]){
					log.info(z + "等待下一场");
					self.state[z] = gameConfig.gameState.noting;
				}else if(self.time[z] > self.timeCount[6]){
					log.info(z + "重置");
					self.jureset(z);
				}
				if (self.time[z] >= 0){
					++self.time[z];
				}
			}
	　　});

		log.info(gameConfig.gameName + "初始化完毕");
	}

	this.getReadyPlayTime = function(tableId){
		var value = gameConfig.readyPlayTime - (this.time[tableId] - 0) + 1;
		if (value <= gameConfig.readyPlayTime && value >= 0)
			return value;
		else
			return 0;
	}

	this.getCallTime = function(tableId){
		var value = gameConfig.callTime - (this.time[tableId] - this.timeCount[0]) + 1;
		if (value <= gameConfig.callTime && value >= 0)
			return value;
		else
			return 0;
	}

	this.getReCallTime = function(tableId){
		var value = gameConfig.reCallTime - (this.time[tableId] - this.timeCount[1]) + 1;
		if (value <= gameConfig.reCallTime && value >= 0)
			return value;
		else
			return 0;
	}

	this.getSelectBetTime = function(tableId){
		var value = gameConfig.selectBetTime - (this.time[tableId] - this.timeCount[2]) + 1;
		if (value <= gameConfig.selectBetTime && value >= 0)
			return value;
		else
			return 0;
	}

	// this.getReadyPlayTime = function(tableId){
	// 	var value = gameConfig.downTimeMax - (this.time[tableId] - this.notingTimeMax) + 2;
	// 	if (value <= gameConfig.downTimeMax && value >= 0)
	// 		return value;
	// 	else
	// 		return 0;		
	// }

	this.changeBankerTime = function(tableId){
		var value = gameConfig.changeBankerTimeMax - (this.time[tableId] - this.openTimeEndMax) + 1;
		if (value <= gameConfig.changeBankerTimeMax && value >= 0)
			return value;
		else
			return 0;
	}

	this.getSendCard = function(tableId){
		if (this.state[tableId] == gameConfig.gameState.coucow){
			var card = [];
			for(var i = 0 ; i < this.seatMax * 5 ; i++){
				card.push(this.yupai[tableId][i]);
			}
			return {card:card};
		}else{
			return {card:[]};
		}
	}

	// this.getSendLastCard = function(tableId){
	// 	if (this.state[tableId] == gameConfig.gameState.coucow){
	// 		var card = [];
	// 		for(var i = this.seatMax * 5 ; i < this.seatMax * 5 + this.seatMax; i++){
	// 			card.push(this.yupai[tableId][i]);
	// 		}
	// 		return {card:card};
	// 	}else{
	// 		return {card:[]};
	// 	}
	// }

	this.getwin = function(playerValue1,playerValue2){
		var winbet = 0;
		if (playerValue1.point > playerValue2.point){
			winbet = -playerValue1.bet;
		}else if (playerValue1.point < playerValue2.point){
			winbet = playerValue2.bet;
		}else{
			if (playerValue1.maxPoint > playerValue2.maxPoint)
				winbet = -playerValue1.bet;
			else
				winbet = playerValue2.bet;
		}
		return winbet;
	}

	this.getValue = function(cardList){
		var cardArray = [];
		var smallcow = true;
		var smallPoint = 0;
		var boomIdx = 0;
		var Result = {};
		var goldcow = true;
		var silvercow = true;


		Result.point = 0;
		Result.data = [];
		Result.maxPoint = 0;

		// this.majiang[0] = 5;
		// this.majiang[1] = 7;
		// this.majiang[2] = 47;
		// this.majiang[3] = 38;
		// this.majiang[4] = 52;

		for(var i = 0; i < 5; ++i){
			var temp = {};
			temp.card = cardList[i];
			temp.value = cardList[i] % 13;
			if (this.cardPoint[cardList[i]] > Result.maxPoint){
				Result.maxPoint = this.cardPoint[cardList[i]];	
			}
			if (temp.value == 0){
				temp.value = 13;
			}

			if (temp.value >= 10){
				temp.point = 10;
			}else{
				temp.point = temp.value;
			}
			cardArray.push(temp);

			//5小牛
			smallPoint += temp.point;
			if (temp.point >= 5 || smallPoint >= 10){
				smallcow = false;
			}

			//金牛
			if (temp.value <= 10){
				goldcow = false;
			}

			//银牛
			if (temp.point != 10){
				silvercow = false;
			}
		}

		//排序
		cardArray.sort(function(a,b){
			return a.value - b.value;
		})

		//判断5小牛 type=1
		if (smallcow){
			Result.point = 14;
			Result.bet = 3;
			Result.data = cardArray;
			log.info("5小牛");
		}
		
		//炸弹 type=2
		if (Result.point == 0){
			var boom = true;
			for(var i = 0 ; i < 3; ++i){
				if (cardArray[i].value != cardArray[i+1].value){
					boom = false;
				}
			}

			var boom2 = true;
			for(var i = 4 ;i >= 2 && !boom;--i){
				if (cardArray[i].value != cardArray[i-1].value){
					boom2 = false;
				}
			}

			if (boom || boom2){
				Result.point = 13;
				Result.bet = 3;
				log.info("炸弹");
				Result.data = cardArray;
			}
		}
		
		//金牛 type=3
		if (Result.point == 0 && goldcow){
			Result.data = cardArray;
			Result.point = 12;
			Result.bet = 3;
			log.info("金牛");
		}

		//银牛 type=4
		if (Result.point == 0 && silvercow){
			Result.data = cardArray;
			Result.point = 11;
			Result.bet = 3;
			log.info("银牛");
		}
		
		if (Result.point == 0){
			for(var i1 = 0 ;i1 < 3 && cardArray.length == 5; ++i1){
				for(var i2 = i1+1; i2 < 4 && cardArray.length == 5; ++i2){
					for(var i3 = i2+1; i3 < 5 && cardArray.length == 5; ++i3){
						if ((cardArray[i1].point + cardArray[i2].point + cardArray[i3].point) % 10 == 0){
							//log.info(i1 + " " + i2 + " " + i3);
							
							Result.data.push(cardArray[i1]);
							Result.data.push(cardArray[i2]);
							Result.data.push(cardArray[i3]);

							cardArray.splice(i3,1);
							cardArray.splice(i2,1);
							cardArray.splice(i1,1);

							break;
						}
					}
				}
			}


			if (cardArray.length == 5){
				//无牛
				Result.data = cardArray;
				Result.point = 0;
				Result.bet = 1;
				log.info("无牛")
			}else{
				//有牛
				Result.data.push(cardArray[0]);
				Result.data.push(cardArray[1]);
				Result.point = (cardArray[0].point + cardArray[1].point) % 10;
				if (Result.point == 0){
					Result.point = 10;
					Result.bet = 3;
				}else if (Result.point == 9){
					Result.bet = 2;
				}else if(Result.point == 8 || Result.point == 7){
					Result.bet = 2;
				}else{
					Result.bet = 1;
				}
				log.info("牛" + Result.point)
			}
		}
		log.info(Result);

		return Result;
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

	this.initMajiang = function(_tableid){
		if (this.state[_tableid] == gameConfig.gameState.gameBegin){
			for(var z = 0 ; z < 10 ; z++){
				for(var j = 0 ; j < 52 ; j++){
					var idx = Math.floor(Math.random() * 52);
					var temp = this.yupai[_tableid][j];
					this.yupai[_tableid][j] = this.yupai[_tableid][idx];
					this.yupai[_tableid][idx] = temp;
				}
			}
		}
	}

	//每局重置
	this.jureset = function(tableId){
		this.time[tableId] = 0;
	}

	
	this.reset = function(tableId){
		//log.info("reset");
		this.state[tableId] = gameConfig.gameState.gameBegin;
		this.time[tableId] = 0;
		this.majiang[tableId] = [];
	}

	//没有上庄,停止计时
	this.stop = function(tableId){
		this.state[tableId] = gameConfig.gameState.noting;
		this.time[tableId] = -1;
	}

	//没有上庄,停止计时
	this.next = function(tableId){
		this.time[tableId] = this.timeCount[3] + 1;
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

		//log.info("座位:" + tableidx + "桌," + seatidx + "个位置");
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
		//log.info("有人离开桌子");
		var tableid = _User.getTable();
		var seatid = _User.getSeat()
		//没有任何座位信息
		if (tableid == -1 || seatid == -1) return;
		//log.info("座位," + tableid + "桌," + seatid + "个位置");
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

	this.getTablePlayers = function(_tableId){
		var playerList = [];
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[_tableId][i])
				playerList.push(this.tableList[_tableId][i])
		}
		return playerList;
	}

	this.getTablePlayerBySeatId = function(_tableId,_seatId){		
		return this.tableList[_tableId][_seatId];
		
	}

	this.init();

}


module.exports = Sever;

