var User = require("./User");
var schedule = require("node-schedule");
var io = require('socket.io');
var gameConfig = require("./../config/gameConfig")




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

		this.cardPoint = [];
		//初始化扑克牌权利值
		for(var i = 0  ; i < 4 ; ++i){
			for (var j = 1 ; j <= 13 ; j++){
				this.cardPoint[i * 13 + j] = ((j - 1) * 4) + 1 + i;
				
			}
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
			//console.log("服务器剩余人" + self.onlienPepole)
			if (self.state == gameConfig.gameState.downTime){
				if (self.downTime <= 0){
					self.downCoinEnd();

				}else{
					--self.downTime;
					//console.log(self.downTime);
				}
			}

			if (self.state == gameConfig.gameState.downTimeEnd){
				if (self.downEndTime <= 0){
					self.open();
					// 开奖
					// for(var i = 0; i < self.tableMax ; i++){
					// 	if(self.tableList[i][self.seatMax]){
					// 		var tablestring = "table" + i
					// 		self.io.sockets.in(tablestring).emit('downEnd', {});
					// 	}
					// }
				}else{
					--self.downEndTime;
					//console.log(self.downEndTime);
				}
			}

			if (self.state == gameConfig.gameState.open){
				if (self.openTime <= 0){
					self.openEnd();
					// 开奖
					// for(var i = 0; i < self.tableMax ; i++){
					// 	if(self.tableList[i][self.seatMax]){
					// 		var tablestring = "table" + i
					// 		self.io.sockets.in(tablestring).emit('downEnd', {});
					// 	}
					// }
				}else{
					--self.openTime;
					console.log(self.openTime);
				}
			}

			if (self.state == gameConfig.gameState.openEnd){
				if (self.openEndTime <= 0){
					self.sendCoin();
					// 准备发奖
					// for(var i = 0; i < self.tableMax ; i++){
					// 	if(self.tableList[i][self.seatMax]){
					// 		var tablestring = "table" + i
					// 		self.io.sockets.in(tablestring).emit('downEnd', {});
					// 	}
					// }
				}else{
					--self.openEndTime;
					//console.log(self.openEndTime);
				}
			}

			if (self.state == gameConfig.gameState.sendCoin){
				if (self.sendCoinTime <= 0){
					self.noting();
					// 发奖
					// for(var i = 0; i < self.tableMax ; i++){
					// 	if(self.tableList[i][self.seatMax]){
					// 		var tablestring = "table" + i
					// 		self.io.sockets.in(tablestring).emit('downEnd', {});
					// 	}
					// }
				}else{
					--self.sendCoinTime;
					//console.log(self.sendCoinTime);
				}
			}


			if (self.state == gameConfig.gameState.noting){
				if (self.notingTime <= 0){
					self.downCoinBegin();

				}else{
					--self.notingTime;
					//console.log(self.notingTime);
				}		
			}
	　　});

		console.log("28初始化完毕");
	}

	this.downCoinBegin = function(){
		console.log("下注开始")
		this.downTime = this.downTimeMax;
		this.state = gameConfig.gameState.downTime;
		this.initMajiang();
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
			return this.getwin(0,5,10,15);
		}else{
			return {result:0,card:[0,0,0,0,0,0,0,0]};
		}
	}

	this.agjiesuan = function(_idx){
			var temp = [];
			temp[0] = this.majiang[0];
			temp[1] = this.majiang[1];
			this.majiang[0] = this.majiang[_idx * 2];
			this.majiang[1] = this.majiang[_idx * 2 + 1];
			this.majiang[_idx * 2] = temp[0];
			this.majiang[_idx * 2 + 1] = temp[1];
			var tianWin = this.getwin(0,5)
			var diWin = this.getwin(0,10)
			var shunWin = this.getwin(0,15)
			var card = [];
			for(var i = 0 ; i < 8 ; i++){
				card.push(this.majiang[i]);
			}

			return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
	}

	this.getx = function(){
		var tianWin = this.getwin(0,5)
		var diWin = this.getwin(0,10)
		var shunWin = this.getwin(0,15)
		var card = [];
		for(var i = 0 ; i < 8 ; i++){
			card.push(this.majiang[i]);
		}

		return {result:1,card:card,jieguo:[tianWin,diWin,shunWin]};
	}

	this.getValue = function(_beginIdx){
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
			temp.card = this.majiang[_beginIdx + i];
			temp.value = this.majiang[_beginIdx + i] % 13;
			if (this.cardPoint[this.majiang[_beginIdx + i]] > Result.maxPoint){
				Result.maxPoint = this.cardPoint[this.majiang[_beginIdx + i]];	
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
			Result.bet = 8;
			Result.data = cardArray;
			console.log("5小牛");
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
				Result.bet = 7;
				console.log("炸弹");
				Result.data = cardArray;
			}
		}
		
		//金牛 type=3
		if (Result.point == 0 && goldcow){
			Result.data = cardArray;
			Result.point = 12;
			Result.bet = 6;
			console.log("金牛");
		}

		//银牛 type=4
		if (Result.point == 0 && silvercow){
			Result.data = cardArray;
			Result.point = 11;
			Result.bet = 5;
			console.log("银牛");
		}
		
		if (Result.point == 0){
			for(var i1 = 0 ;i1 < 3 && cardArray.length == 5; ++i1){
				for(var i2 = i1+1; i2 < 4 && cardArray.length == 5; ++i2){
					for(var i3 = i2+1; i3 < 5 && cardArray.length == 5; ++i3){
						if ((cardArray[i1].point + cardArray[i2].point + cardArray[i3].point) % 10 == 0){
							console.log(i1 + " " + i2 + " " + i3);
							
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
				console.log("无牛")
			}else{
				//有牛
				Result.data.push(cardArray[0]);
				Result.data.push(cardArray[1]);
				Result.point = (cardArray[0].point + cardArray[1].point) % 10;
				if (Result.point == 0){
					Result.point = 10;
					Result.bet = 4;
				}else if (Result.point == 9){
					Result.bet = 3;
				}else if(Result.point == 8 ||Result.point == 7){
					Result.bet = 2;
				}else{
					Result.bet = 1;
				}
				console.log("牛" + Result.point)
			}
		}
		console.log(Result);

		return Result;
	}

	this.getwin = function(_beginIdx1,_beginIdx2,_beginIdx3,_beginIdx4){
		var playerValue = [];
		playerValue[0] = this.getValue(_beginIdx1);
		playerValue[1] = this.getValue(_beginIdx2);
		playerValue[2] = this.getValue(_beginIdx3);
		playerValue[3] = this.getValue(_beginIdx4);
		var card = [];
		var winbet = [];
		console.log(playerValue);
		for (var z = 0 ; z < 4 ; ++z){
			for(var i = 0 ; i < 5 ; ++i){
				console.log(z + " " + i)
				card.push(playerValue[z].data[i].card);
			}
		}

		//console.log(card)

		
		for(var i = 1 ;i < 4 ; i++){
			if (playerValue[0].point > playerValue[i].point){
				winbet[i-1] = -playerValue[0].bet;
			}else if (playerValue[0].point < playerValue[i].point){
				winbet[i-1] = playerValue[i].bet;
			}else{
				if (playerValue[0].maxPoint > playerValue[i].maxPoint)
					winbet[i-1] = -playerValue[0].bet;
				else
					winbet[i-1] = playerValue[i].bet;
			}
			console.log(winbet[i-1])
		}

		return {result:1,card:card,jieguo:winbet,point:[playerValue[0].point,playerValue[1].point,playerValue[2].point,playerValue[3].point]};

	}

	this.initMajiang = function(){
		if (this.state == gameConfig.gameState.downTime){
			this.majiang = [];
			for(var i = 0 ; i < 4 ; i++){
				for(var j = 1 ; j <= 13 ; j++){
					this.majiang.push(j + (i * 13));
				}
			}
			
			//this.state = gameConfig.gameState.openEnd;
			
			for(var i = 0 ; i < this.majiang.length ; i++){
				var temp = this.majiang[i];
				var idx = Math.floor(Math.random()*this.majiang.length);
				this.majiang[i] = this.majiang[idx];
				this.majiang[idx] = temp;
			}

			//console.log(this.majiang);
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

