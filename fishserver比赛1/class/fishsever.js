var User = require("./User");
var schedule = require("node-schedule");
var io = require('socket.io');
var Fish = require("./Fish");
var fishConfig = require("./../config/fishConfig")
var gameConfig = require("./../config/gameConfig")
var gameDao = require("./../dao/gameDao");


var FishSever = function(){
	//每条鱼的概率
	var pro = [];
	//道具鱼的价值
	var prop = [];
	for (var i = 0; i < fishConfig.length; i++){
		if (fishConfig[i].coin > 0){
			pro.push(fishConfig[i].coin);
		}else{
			prop.push(fishConfig[i].propValue)
		}
	}

	//道具鱼返回的道具ID与数量
	var propId = [0,0];
	var propCount = [1,10];
	//var fishOut = [140,200,200,200,140,120,100,80,70,60];
	var betCount = [1,2,5,10,20,50,100];
	var betCountObj = {};
	betCountObj[1] = 1;
	betCountObj[2] = 2;
	betCountObj[5] = 3;
	betCountObj[10] = 4;
	betCountObj[20] = 5;
	betCountObj[50] = 6;
	betCountObj[100] = 7;

	this.controlBet = gameConfig.controlBet;

	this.pro_max_count = new Array();
	this.pro_max = new Array();
	this._fishOutProMax = 0;
	this._fishOutProMaxSmallbird = 0;
	this._fishOutProMaxBigbird = 0;

	//鱼群
	this._fishOutOtherType = -1;
	this._fishOutOtherPath = -1;
	this._fishOutOtherCount = 0;

	//道具鱼
	this._propFishHitCount = {};

	//当前比赛剩余时间
	//this.MatchTime = -100;
	this.isSendEndMsg = false;
	this.matchId = 0;
	this.MatchLogin = true;
	this.isSendPrize = false;
	this.cleanRank = false;
	this.ApplyFlag = true;

	//测试变量
	this._testMax = 0;


	this.init = function(){

		//创建桌子
		//暂定500张
		this.seatMax = 4;	//座位最大数量
		this.tableMax = 500;
		this.fishCountMax = 10000;		//一个服务器最多鱼1000条
		this.tableList = new Array(500);
		this.onlienPepole = 0;
		this.roomid = 1;
		this.fishId = 0;
		//每桌一个数组
		this.fishList = new Array(500);
		this.delfishList = new Array();

		//初始化出鱼概率
		this.initFishOutPro();
		
		//初始化桌子
		for(var i = 0 ; i < this.tableMax ;i++){
			this.tableList[i] = new Array(this.seatMax + 1);
			//初始化鱼数组
			this.fishList[i] = {};
		}

		//获得比赛最大ID
		gameDao.getMatchId(gameConfig.serverId,function(_maxId){
			//初始化捕鱼
			self.matchId = _maxId + 1;
		})

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

			//比赛信息倒计时
			if (gameConfig.isMatchRoom){
				if (self.matchId > 0) {
					var MatchTime = 0;
					var nowDate = new Date();
					var hours = nowDate.getHours();
					var minute = nowDate.getMinutes();
					var second = nowDate.getSeconds();

					//比赛时间 8:00 - 24:00
					if (hours >= 8){
						if (hours == 23 && minute >= 50){
							self.ApplyFlag = false;
						}else{
							self.ApplyFlag = true;
						}

						minute = 9 - (minute % 10);
						second = 60 - second; 
						MatchTime = minute * 60 + second;
					}else{
						self.ApplyFlag = false;
						return;
					}
					//30秒倒计时
					if (MatchTime < 30 && !self.isSendEndMsg){
						self.isSendEndMsg = true;
						//发送比赛准备结束信息
						for(var i = 0; i < self.tableMax ; i++){
							//当桌子是开启状态就发送
							if(self.tableList[i][self.seatMax]){
								var tablestring = "table" + i
								self.io.sockets.in(tablestring).emit("match_countdown");
							}
						}
					}

					if (MatchTime == 1){
						//比赛结束
						for(var i = 0; i < self.tableMax ; i++){
							//当桌子是开启状态就发送
							if(self.tableList[i][self.seatMax]){
								for(var j = 0; j < self.seatMax ; j++){
									if (self.tableList[i][j]){
										self.tableList[i][j].disconnect();
									}
								}
							}
						}

						self.isSendEndMsg = false;
						self.isSendPrize = false;
						++self.matchId;
						self.openCleanRank();
					}

					if (MatchTime < 30){
						self.MatchLogin = false;
					}else{
						self.MatchLogin = true;
					}

					//发上一期奖品
					if (MatchTime < 540 && MatchTime > 30 && !self.isSendPrize){
					//if (MatchTime < 540){
						self.isSendPrize = true;
						//结算奖品
						gameDao.calculateRank({matchId:self.matchId - 1,roomType:gameConfig.serverId},function(){
							//比赛结束,通知登录服务器
							if (self.Csocket){
								self.Csocket.emit('matchEnd',{matchId:self.matchId - 1,roomType:gameConfig.serverId});	
							}
							
						});
					}
					//console.log("比赛时间:" + MatchTime + "比赛ID" + self.matchId)
				}
			}

			//普通鱼
			var fishInfo = self.FishOut();
			var fishInfo2 = self.FishOut();
			//var fishInfo3 = self.FishOut();
			//鱼群
			var fishInfoOther = self.FishOutOther();

			for(var i = 0; i < self.tableMax ; i++){
				//当桌子是开启状态就出鱼
				if(self.tableList[i][self.seatMax]){
					var tablestring = "table" + i


					//普通鱼
					if (fishInfo.fishId != -1){
						if (self.delfishList.length > 0){
							var fish = self.delfishList.pop();
							fish.init(fishInfo.fishId,fishInfo.fishType,fishInfo.fishPath)
						}else{
							var fish = new Fish(fishInfo.fishId,fishInfo.fishType,fishInfo.fishPath);
						}
						self.fishList[i][fishInfo.fishId] = fish;
						self.io.sockets.in(tablestring).emit('FishOut', fishInfo);
					}

					if (fishInfo2.fishId != -1){
						if (self.delfishList.length > 0){
							var fish = self.delfishList.pop();
							fish.init(fishInfo2.fishId,fishInfo2.fishType,fishInfo2.fishPath)
						}else{
							var fish = new Fish(fishInfo2.fishId,fishInfo2.fishType,fishInfo2.fishPath);
						}
						self.fishList[i][fishInfo2.fishId] = fish;
						self.io.sockets.in(tablestring).emit('FishOut', fishInfo2);
					}

					// if (fishInfo3.fishId != -1){
					// 	if (self.delfishList.length > 0){
					// 		var fish = self.delfishList.pop();
					// 		fish.init(fishInfo3.fishId,fishInfo3.fishType,fishInfo3.fishPath)
					// 	}else{
					// 		var fish = new Fish(fishInfo3.fishId,fishInfo3.fishType,fishInfo3.fishPath);
					// 	}
					// 	self.fishList[i][fishInfo3.fishId] = fish;
					// 	self.io.sockets.in(tablestring).emit('FishOut', fishInfo3);
					// }
					//鱼群鱼
					if (fishInfoOther.fishId != -1){
						if (self.delfishList.length > 0){
							var fish = self.delfishList.pop();
							fish.init(fishInfoOther.fishId,fishInfoOther.fishType,fishInfoOther.fishPath)
							
						}else{
							var fish = new Fish(fishInfoOther.fishId,fishInfoOther.fishType,fishInfoOther.fishPath);
						}
						self.fishList[i][fishInfoOther.fishId] = fish;
						self.io.sockets.in(tablestring).emit('FishOut', fishInfoOther);
					}
				}

				//如果鱼大于2分钟没有被打死，就自然死亡			
				for(var fishItem in self.fishList[i]){
				// for (var i = 0 ; i < self.delfishList.length ; i++){
					//console.log(fishItem);
				 	if (self.fishList[i][fishItem]._lifeTime == 0){
				 		//console.log("fishdel:" + self.fishList[i][fishItem].getFishId());
				 		self.fishList[i][fishItem].del();
				 		//鱼已经鱼进行回收
						self.delfishList.push(self.fishList[i][fishItem]);
						delete self.fishList[i][fishItem];
				 	}else{
				 		--self.fishList[i][fishItem]._lifeTime;
				 		//console.log("fishid:" + self.fishList[i][fishItem].getFishId() +" " + self.fishList[i][fishItem]._lifeTime)
				 	}
				}
			}

			//每个用户如果不发子弹，50秒，就让他自动离开
	　　});

		this.initBetArr();

		console.log("捕鱼初始化完毕");
	}

	this.getCleanRank = function(){
		return this.cleanRank;
	}

	this.openCleanRank = function(){
		this.cleanRank = true;
	}

	this.offCleanRank = function(){
		this.cleanRank = false;
	}

	this.initFishOutPro = function(){
		console.log("出鱼概率初始化");
		//单只
		//var FishOutPro = [200,180,160,140,120,100,80,60,40,20];
		//var FishOutPro = [20,20,20,20,20,10,9,8,6,4,20,20];
		//fishConfig
		this._fishOutProMax = 0;
		this._fishOutList = new Array();
		for(var i = 0 ;i < fishConfig.length ; i++){
			for(var j = this._fishOutProMax; j < this._fishOutProMax + fishConfig[i].outPro ; j++){
				this._fishOutList[j] = i;
			}
			this._fishOutProMax += fishConfig[i].outPro;
			if (i < 4){
				//出鱼群的概率
				this._fishOutProMaxSmallbird += fishConfig[i].outPro;
			}else{
				this._fishOutProMaxBigbird += fishConfig[i].outPro;
			}
		}
	}

	this.initBetArr = function(){
		this.proCount = new Array();
		this.HitTimes = new Array();
		for(var i = 0;i < pro.length ; ++i){
			this.proCount[i] = new Array();
			this.HitTimes[i] = new Array();
			this.pro_max_count[i] = Math.floor(10000 / pro[i]);
			this.pro_max[i] = this.pro_max_count[i] * pro[i];
			this.pro_max_count[i] = Math.floor(this.pro_max_count[i] * this.controlBet);
			//console.log("max:" + this.pro_max[i] + " bet:" + pro[i]);
			//console.log("count:" + this.pro_max_count[i]);
			for (var j = 0 ; j < betCount.length ; j++){
				//开始创建10000数组
				this.proCount[i][j] = new Array();
				this.HitTimes[i][j] = 0;
				for(var k = 0 ; k < 9999 ; ++k){
					//先把所有先定制为0;
					this.proCount[i][j][k] = 0;
				}
				var point = 0;

				for(var k = 0 ; k < this.pro_max_count[i] ; ++k){
					//插入数据
					point += Math.floor(Math.random()*pro[i]);
					this.proCount[i][j][point] = 1;
					++point;
				}
				//随机打乱
				for(var z = 0 ; z < 10 ; z++){
					for(var k = 0 ; k < 5000 ; ++k){
						var temp = this.proCount[i][j][k];
						var idx = Math.floor(Math.random()*this.pro_max[i]);
						this.proCount[i][j][k] = this.proCount[i][j][idx];
						this.proCount[i][j][idx] = temp;
					}
				}

			}
		}


		//初始化道具鱼
		for(var i = 0;i < prop.length ; ++i){
			this.resetProp(i);
		}
		
	}

	//道具鱼重新设置值
	this.resetProp = function(_idx){
			var offset = Math.floor(prop[_idx] * 0.2);
			this._propFishHitCount[_idx] = Math.floor(Math.random()*((prop[_idx] * 2) - offset)) + offset;		
	}

	//设置io
	this.setIo = function(_io,_Csocket){
		this.io = _io;
		this.Csocket = _Csocket;
	}

	//出鱼
	this.FishOut = function(){
		// if (this._fishOutOtherCount == 0){
			++this.fishId;
			//如果已经到最大值循环回到1
			if (this.fishId >= this.fishCountMax)
				this.fishId = 1;
			var fishTypePro = Math.floor(Math.random()*this._fishOutProMax);
			//fishType包括道具鱼   普通鱼数组 + 道具鱼数组
			fishType = this._fishOutList[fishTypePro];
			var fishPath = Math.floor(Math.random()*9);

			var msg = {fishId:this.fishId,fishType:fishType,fishPath:fishPath}
			return msg;
	}

	//出鱼群
	this.FishOutOther = function(){
		++this.fishId;
		//如果已经到最大值循环回到1
		if (this.fishId >= this.fishCountMax)
			this.fishId = 1;
		//正在出
		if (this._fishOutOtherCount > 0){
			--this._fishOutOtherCount;
			var msg = {fishId:this.fishId,fishType:this._fishOutOtherType,fishPath:this._fishOutOtherPath}
			return msg;
		}else{
			//有一个几率出不出
			if (Math.floor(Math.random()*9) == 0){
				var fishTypePro = Math.floor(Math.random()*this._fishOutProMaxSmallbird);
				this._fishOutOtherType = this._fishOutList[fishTypePro];
				//出了一个，连续出几只
				this._fishOutOtherPath = Math.floor(Math.random()*9);
				//条数
				this._fishOutOtherCount = Math.floor(Math.random()*6) + 2;
				var msg = {fishId:this.fishId,fishType:this._fishOutOtherType,fishPath:this._fishOutOtherPath}
				return msg;
			}else{
				//不出鱼群
				var msg = {fishId:-1,fishType:-1,fishPath:-1}
				return msg;
			}
		}
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
		this.tableList[tableidx][seatidx] = _socket;
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

	this.findBulletBet = function(_bet){
		if (betCountObj[_bet]){
			return true;
		}else{
			return false;
		}
	}

	//中鱼
	this.fishHit = function(_User,_bet,hitCount,fishId){
		//获得子弹倍数id
		if (!betCountObj[_bet]){
			console.log("没有这么子弹类型");
			return {socre:0,propId:0,propCount:0};
		}

		//找到当前桌子有没有这ID的鱼
		var tabelobj = this.fishList[_User.getTable()];
		//console.log(tabelobj)
		if (tabelobj[fishId] == null){
			console.log("没有找到这条鱼obj" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		if (tabelobj[fishId].getFishId() != fishId){
			console.log("没有找到这条鱼" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		if(tabelobj[fishId].isDel()){
			console.log("鱼已经死亡" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		var _pro = tabelobj[fishId].getFishType();

		if (_pro < 0 || _pro >= fishConfig.length){
			console.log("中鱼类型错误!");
			return {socre:0,propId:0,propCount:0};
		}

		var tablestring = "table" + _User.getTable();

		//如果是机器人
		if (_User._Robot){
			//如果是道具鱼
			if (fishConfig[_pro].prop){
				var propidx = _pro-pro.length;
				if (!Math.floor(Math.random()*(prop[propidx] / 10))){
					//console.log("机器人中道具鱼!")
					tabelobj[fishId].del();
					this.delfishList.push(tabelobj[fishId]);
					delete tabelobj[fishId];
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount,fishId:fishId}});
					return {socre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount};
				}else{
					//console.log("机器人没中道具鱼!")
					return {socre:0,propId:0,propCount:0};
				}
			}

			if (!Math.floor(Math.random()*pro[_pro])){
				//机器人中鱼
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:pro[_pro],fishId:fishId,propId:0,propCount:0}});
				return {socre:pro[_pro],propId:0,propCount:0};
			}else{
				//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
				return {socre:0,propId:0,propCount:0};
			}
		}


		//道具鱼
		if (fishConfig[_pro].prop){
			var propidx = _pro-pro.length;
			this._propFishHitCount[propidx] -= _bet;
			//是道具鱼
			if (this._propFishHitCount[propidx] <= 0){
				//道具鱼死亡
				this.resetProp(propidx);
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount,fishId:fishId}});
				return {socre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount};
			}else{
				//道具鱼没有死亡
				return {socre:0,propId:0,propCount:0};
			}
		}
		

		var _betidx = betCountObj[_bet] - 1;

		if (Math.floor((this.HitTimes[_pro][_betidx] / 10)) >= this.pro_max[_pro]){
			console.log("重新计算_pro:" + _pro + " _bet" + betCount[_betidx]);
			//随机打乱
			for(var k = 0 ; k < 1000 ; ++k){
				var temp = this.proCount[_pro][_betidx][k];
				var idx = Math.floor(Math.random()*this.pro_max[_pro]);
				this.proCount[_pro][_betidx][k] = this.proCount[_pro][_betidx][idx];
				this.proCount[_pro][_betidx][idx] = temp;
			}
			this.HitTimes[_pro][_betidx] = 0;
		}

		if (this.HitTimes[_pro][_betidx] % 10 == 0){
			//可以整除
			var idx = Math.floor(this.HitTimes[_pro][_betidx] / 10);
			this.HitTimes[_pro][_betidx] += hitCount;
			
			//var tablestring = "table" + _User.getTable();
			var score = this.proCount[_pro][_betidx][idx] * betCount[_betidx] * pro[_pro];
			if (score > 0){
				//中鱼
				//鱼已经鱼进行回收
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				++this._testMax;
				//console.log("**fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
				this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:score,fishId:fishId,propId:0,propCount:0}});
				return {socre:this.proCount[_pro][_betidx][idx] * betCount[_betidx] * pro[_pro],propId:0,propCount:0};

			}
			//console.log("没中");
			//console.log("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0,propId:0,propCount:0};
		}else{
			//console.log("没中");
			//console.log("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			this.HitTimes[_pro][_betidx] += hitCount;
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0,propId:0,propCount:0};
		}
	}

	//发射子弹
	this.fishShoot = function(_pro,_bet,hitCount){

	}

	this.sendRank = function(list,_time){
		var sendflag = false;
		if (_time > 300){
			//1分钟一次
			if (_time % 60 == 0) {
				sendflag = true;
			}
		}else if(_time > 120){
			//30秒一次
			if (_time % 30 == 0) {
				sendflag = true;
			}
		}else if (_time > 30){
			//10秒一次
			if (_time % 10 == 0) {
				sendflag = true;
			}
		}else if (_time > 1){
			//5秒一次
			if (_time % 5 == 0){
				sendflag = true;
			}
		}else{
			sendflag = true;
		}
		if (sendflag){
			for(var i = 0; i < this.tableMax ; i++){
				//当桌子是开启状态就发送
				if(this.tableList[i][this.seatMax]){
					for(var j = 0; j < this.seatMax ; j++){
						if (this.tableList[i][j]){
							this.tableList[i][j].emit("matchRank",{time:_time,list:list});
						}
					}
				}
			}
		}
	}

	this.init();

}


module.exports = FishSever;

