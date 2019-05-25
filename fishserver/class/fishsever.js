var User = require("./User");
var schedule = require("node-schedule");
var io = require('socket.io');
var Fish = require("./Fish");
//var fishConfig = require("./../config/fishConfig")
//var gameConfig = require("./../config/gameConfig")
var gameDao = require("./../dao/gameDao");

var fishConfig;
var log = require("./../../CClass/class/loginfo").getInstand;
var fishOutListConfig = require("./../config/fishOutListConfig")

var FishSever = function(_fishConfig){
	fishConfig = _fishConfig;
	//每条鱼的概率
	var pro = [];
	//道具鱼的价值
	var prop = [];

	this.fishOutTime = [];
	for (var i = 0; i < fishConfig.length; i++){
		this.fishOutTime[i] = 0;
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
	this.lastPath = 0;
	this.changeingFishScene = false;
	this.IssendChange = false;
	this.change_type = 0;
	this.change_scene_type = 0;
	this.change_fishOut_i = 0;
	this.boomList = [];
	this.moguiyueUserList = {};
	this.moguiyueOutList = [0.2,0.4,0.6,0.8,3.2];
	

	//总彩池
	this.pool = 0;

	//虚拟彩池
	//this.virtualPool = (7000  + Math.floor(Math.random()*7000)) * gameConfig.gameBet;

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
		// gameDao.getMatchId(gameConfig.serverId,function(_maxId){
		// 	//初始化捕鱼
		// 	self.matchId = _maxId + 1;
		// })

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

			var MatchTime = 0;
			var nowDate = new Date();
			var hours = nowDate.getHours();
			var minute = nowDate.getMinutes();
			var second = nowDate.getSeconds();
			//比赛时间 8:00 - 24:00
			if (minute % 20 == 0 && second == 0){
			//if (second == 0){
				self.changeingFishScene = true;
				self.IssendChange = true;
				++self.change_scene_type;
				self.change_scene_type = self.change_scene_type % 3;
				self.change_fishOut_i = 0;

			}
			//普通鱼
			
			var fishInfo;
			var fishInfo1;

			if (self.changeingFishScene){
				fishInfo = self.change_fishOut();
			}else{

				fishInfo = self.FishOut();
				if (second % 2){
					fishInfo1 = self.FishOut();
				}
			}

			//log.info(fishInfo);


			for(var i = 0; i < self.tableMax ; i++){
				//当桌子是开启状态就出鱼
				if (self.tableList[i][self.seatMax]){
					var tablestring = "table" + i

					//普通鱼
					if (fishInfo.fishCount > 0){
						for(var j = 0 ; j < fishInfo.fishCount ; ++j){
							var fish;
							if (self.delfishList.length > 0){
								fish = self.delfishList.pop();
								fish.init(fishInfo.fishId[j],fishInfo.fishType,fishInfo.fishPath)
							}else{
								fish = new Fish(fishInfo.fishId[j],fishInfo.fishType,fishInfo.fishPath);
							}
							self.fishList[i][fishInfo.fishId[j]] = fish;
						}
						
						self.io.sockets.in(tablestring).emit('FishOut', fishInfo);
					}

					if (fishInfo1 && fishInfo1.fishCount > 0){
						for(var j = 0 ; j < fishInfo1.fishCount ; ++j){
							var fish;
							if (self.delfishList.length > 0){
								fish = self.delfishList.pop();
								fish.init(fishInfo1.fishId[j],fishInfo1.fishType,fishInfo1.fishPath)
							}else{
								fish = new Fish(fishInfo1.fishId[j],fishInfo1.fishType,fishInfo1.fishPath);
							}
							self.fishList[i][fishInfo1.fishId[j]] = fish;
						}
						self.io.sockets.in(tablestring).emit('FishOut', fishInfo1);
					}
					

					//发送换场景
					if (self.IssendChange){
						self.sendChangeScene(tablestring);
					}	
				}


				//如果鱼大于2分钟没有被打死，就自然死亡			
				for (var fishItem in self.fishList[i]){
				// for (var i = 0 ; i < self.delfishList.length ; i++){
					//log.info(fishItem);
				 	if (self.fishList[i][fishItem]._lifeTime == 0){
				 		//log.info("fishdel:" + self.fishList[i][fishItem].getFishId());
				 		self.fishList[i][fishItem].del();
				 		//鱼已经鱼进行回收
						self.delfishList.push(self.fishList[i][fishItem]);
						delete self.fishList[i][fishItem];
				 	}else{
				 		--self.fishList[i][fishItem]._lifeTime;
				 		//log.info("fishid:" + self.fishList[i][fishItem].getFishId() +" " + self.fishList[i][fishItem]._lifeTime)
				 	}
				}
			}

			//关闭发送换场景
			if (self.IssendChange){
				self.IssendChange = false;
			}

			//每个用户如果不发子弹，50秒，就让他自动离开
	　　});

		this.initBetArr();

		log.info("捕鱼初始化完毕");
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
		log.info("出鱼概率初始化");
		//单只
		//var FishOutPro = [200,180,160,140,120,100,80,60,40,20];
		//var FishOutPro = [20,20,20,20,20,10,9,8,6,4,20,20];
		//fishConfig
		this._fishOutProMax = 0;
		this._fishOutList = new Array();
		for(var i = 0 ;i < 13 ; i++){
			for(var j = this._fishOutProMax; j < this._fishOutProMax + fishConfig[i].outPro ; j++){
				this._fishOutList[j] = i;
			}
			this._fishOutProMax += fishConfig[i].outPro;
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
			//log.info("max:" + this.pro_max[i] + " bet:" + pro[i]);
			//log.info("count:" + this.pro_max_count[i]);
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
		var fishPath;
		var fishTypePro = Math.floor(Math.random()*this._fishOutProMax);
		//fishType包括道具鱼   普通鱼数组 + 道具鱼数组
		fishType = this._fishOutList[fishTypePro];

		for(var i = 0; i < this.fishOutTime.length; ++i){
			//console.log("***i " + i + " this.fishOutTime[i] " + this.fishOutTime[i]);
			if (fishConfig[i].outPro){
				if (this.fishOutTime[i] <= 0){
					fishType = i;
					this.fishOutTime[i] = fishConfig[i].outPro;
					//console.log("i " + i + " this.fishOutTime[i] " + this.fishOutTime[i]);
					break;
				}
				this.fishOutTime[i]--;
			}
			
		}

		//console.log(fishType)

		//log.info(this._fishOutList)

		//测试
		



		// --this.fishOutTime[23];
		// if (fishType == 23){
		// 	if (this.fishOutTime[23] <= 0){
		// 		this.fishOutTime[23] = Math.floor(Math.random()*60) + 120;
		// 	}else{
		// 		//时间没到出其他的鱼
		// 		fishType = 21 - Math.floor(Math.random()*23);
		// 	}
		// }

		if (fishType == 23 || fishType == 14){
			//道具鱼
			fishPath = Math.floor(Math.random()*3) + 28;
		}else{
			this.lastPath = this.lastPath % 4;
			fishPath = Math.floor(Math.random()*7) + this.lastPath * 7;
			++this.lastPath;
		}

		//10为 100分以下的鱼,如果修改鱼配置,需要修改
		var fishCount = 0;
		// var fishLineup = Math.floor(Math.random()*5);
		fishLineup = 0;
		if (fishType <= 10){
			
		}else if (fishType > 10 && fishType <= 12) {
			fishLineup = Math.floor(Math.random()*2);
			fishCount = Math.floor(Math.random()*3) + 1;
		}else if (fishType >= 13 && fishType <= 15){
			fishCount = 1;
		}else if (fishType >= 15 && fishType <= 17){
			fishLineup = Math.floor(Math.random()*4) + 1;
		}else if (fishType >= 18 && fishType <= 25){
			fishCount = 1;
		}else if (fishType > 25){
			//道具鱼
			fishLineup = 0;
			fishCount = 1;
		}

		switch(fishLineup){
			case 0:
				//轮流出 1-10只
				if (!fishCount){
					if (fishType <= 10){
						fishCount = Math.floor(Math.random() * (10 - fishType) / 2) + 1;

					}else{
						fishCount = 1;
					}
				}
				break;
			case 1:
				//并排 2-3只
				if (!fishCount){
					fishCount = Math.floor(Math.random()*2) + 2;
				}else if(fishCount == 1){
					++fishCount;
				}
				break;
			case 2:
				//正方形 4只
				fishCount = 4;
				break;
			case 3:
				fishCount = 5;
				//5星 5只
				break;
			case 4:
				fishCount = 6;
				//长方形 6只
				break;
		}
		
		var fishIdList = [];

		for(var i = 0 ;i < fishCount ; ++i){
			++this.fishId;
			fishIdList.push(this.fishId);
			//如果已经到最大值循环回到1
			if (this.fishId >= this.fishCountMax)
				this.fishId = 1;
		}

		
		if (fishType == 23){
			//聚宝盆
			this.sendPool(this.virtualPool);
		}



		var msg = {fishId:fishIdList,fishType:fishType,fishPath:fishPath,fishCount:fishCount,fishLineup:fishLineup,lineup:false,propCount:fishConfig[fishType].propCount};
		//log.info(msg);
		return msg;

	}

	this.getFishCurrent = function(i){
		var fishList = [];
		for (var fishItem in this.fishList[i]){
		 	if (this.fishList[i][fishItem]._lifeTime > 30){
		 		fishList.push({fishId:this.fishList[i][fishItem]._fishId,fishType:this.fishList[i][fishItem]._fishType,fishPath:this.fishList[i][fishItem]._fishPath,propCount:fishConfig[this.fishList[i][fishItem]._fishType].propCount});
		 		if (fishList.length > 30){
		 			break;
		 		}
		 	}
		}
		return fishList;
	}

	this.getFishCurrentSceneType = function(i){
		return this.change_scene_type;
	}

	this.sendChangeScene = function(tablestring){
		log.info("发送" + tablestring);
		this.change_type = Math.floor(Math.random() * 1);
		this.io.sockets.in(tablestring).emit('fishSceneChange',{change_scene_type:this.change_scene_type,change_fishOut_type:this.change_type});
	}

	this.change_fishOut = function(){
		//log.info("鱼潮" + this.change_fishOut_i);


		
		// var fishType = Math.floor((this.change_fishOut_i - 1) / 2);
		// var fishCount = Math.floor(9 - this.change_fishOut_i / 4);
		// //var fishCount = Math.floor(10 - this.change_fishOut_i / 3);
		// if (fishCount <= 0){
		// 	fishCount = 0;
		// }
		// fishPath = 28;
		// fishLineup = 1;
		// var fishIdList = [];
		// for(var i = 0 ;i < fishCount ; ++i){
		// 	++this.fishId;
		// 	fishIdList.push(this.fishId);
		// 	//如果已经到最大值循环回到1
		// 	if (this.fishId >= this.fishCountMax)
		// 		this.fishId = 1;
		// }

		// ++this.change_fishOut_i;

		// if (this.change_fishOut_i > 40){
		// 	this.changeingFishScene = false;
		// }
		var fishOutType = Math.floor(Math.random()*fishOutListConfig.length);

		var fishOutTypeObj = fishOutListConfig[fishOutType];

		var fishObj = fishOutTypeObj[this.change_fishOut_i];
		++this.change_fishOut_i;

		if (fishObj.fishCount){
			var fishType = fishObj.fishType;
			var fishCount = fishObj.fishCount;
			if (fishCount <= 0){
				fishCount = 0;
			}
			var fishPath = fishObj.fishPath;
			var fishLineup = fishObj.fishLineup;
			var fishIdList = [];
			for(var i = 0 ;i < fishCount ; ++i){
				++this.fishId;
				fishIdList.push(this.fishId);
				//如果已经到最大值循环回到1
				if (this.fishId >= this.fishCountMax)
					this.fishId = 1;
			}

			if (this.change_fishOut_i >= fishOutTypeObj.length - 1){
				this.changeingFishScene = false;
			}


			var msg = {fishId:fishIdList,fishType:fishType,fishPath:fishPath,fishCount:fishCount,fishLineup:fishLineup,lineup:true,propCount:fishConfig[fishType].propCount}
			return msg;
		}else{
			var msg = {fishId:0,fishType:0,fishPath:0,fishCount:0,fishLineup:0,propCount:0}
			return msg;
		}


	}


	//进入房间
	this.LoginRoom = function(_user,_socket){
		if (this.onlienPepole > this.tableMax * this.seatMax){
			 log.info("已经大于当前房间人数");
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
			log.info("error:找座位出错");
			return {tableId:-1,seatId:-1};
		}

		//log.info("座位:" + tableidx + "桌," + seatidx + "个位置");
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

	this.findBulletBet = function(_bet){
		if (betCountObj[_bet]){
			return true;
		}else{
			return false;
		}
	}

	this.sendPool = function(_pool){
		for(var i = 0; i < this.tableMax ; i++){
			//当桌子是开启状态就发送
			if(this.tableList[i][this.seatMax]){
				var tablestring = "table" + i
				this.io.sockets.in(tablestring).emit('pool', {pool:_pool});
			}
		}
	}

	this.getPool = function(){
		return this.virtualPool;
	}

	//中鱼
	//第一个_User真实的玩家,_userId是代发的
	this.fishHit = function(_User,_bet,hitCount,fishId){
		//获得子弹倍数id
		if (!betCountObj[_bet]){
			log.info("没有这么子弹类型");
			return {socre:0,propId:0,propCount:0};
		}

		//log.info("打中" + fishId);

		//找到当前桌子有没有这ID的鱼
		var tabelobj = this.fishList[_User.getTable()];
		var _betidx = betCountObj[_bet] - 1;
		if (tabelobj[fishId] == null){
			if (!_User._Robot){
				this.pool += betCount[_betidx];
			}
			//this.virtualPool += betCount[_betidx];
			//this.sendPool(this.virtualPool);
			log.info("没有找到这条鱼obj" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		if (tabelobj[fishId].getFishId() != fishId){

			log.info("没有找到这条鱼" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		if(tabelobj[fishId].isDel()){
			log.info("鱼已经死亡" + fishId);
			return {socre:0,propId:0,propCount:0};
		}

		var _pro = tabelobj[fishId].getFishType();

		if (_pro < 0 || _pro >= fishConfig.length){
			log.info("中鱼类型错误!");
			return {socre:0,propId:0,propCount:0};
		}

		var tablestring = "table" + _User.getTable();

		//如果是机器人
		if (_User._Robot){
			//如果是道具鱼
			if (fishConfig[_pro].prop){
				var propidx = _pro-pro.length;
				if (!Math.floor(Math.random()*(prop[propidx] / 10))){
					//log.info("机器人中道具鱼!")
					tabelobj[fishId].del();
					this.delfishList.push(tabelobj[fishId]);
					delete tabelobj[fishId];
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount,fishId:fishId}});
					return {socre:0,propId:fishConfig[_pro].propId,propCount:fishConfig[_pro].propCount};
				}else{
					//log.info("机器人没中道具鱼!")
					return {socre:0,propId:0,propCount:0};
				}
			}

			//机器人聚宝盆
			if(_pro == 23){
				this.virtualPool += betCount[_betidx];
				//判断是否已经达到虚拟值的10%
				if (!Math.floor(Math.random()*500) && this.virtualPool > 1000){
					var subValue = Math.floor(this.virtualPool / 10);
					this.virtualPool -= subValue;
					tabelobj[fishId].del();
					this.delfishList.push(tabelobj[fishId]);
					delete tabelobj[fishId];
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:subValue,fishId:fishId,propId:0,propCount:0}});
					this.sendPool(this.virtualPool);
					return {socre:subValue,propId:0,propCount:0};
				}else{
					this.sendPool(this.virtualPool);
					return {socre:0,propId:0,propCount:0};
				}
				
			}else if(_pro == 21){
					//金魔鬼
					if (Math.floor(Math.random()*pro[_pro])){
						return {socre:0,propId:0,propCount:0};
					}
					var outscore = this.moguiyueOutList[this.moguiyueUserList[_User.getUserId()].count] * pro[_pro];
					log.info(this.moguiyueUserList[_User.getUserId()].count)
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:outscore,fishId:fishId,propId:0,propCount:0,moguiCount:this.moguiyueUserList[_User.getUserId()].count}});
					if (this.moguiyueUserList[_User.getUserId()]){
						++this.moguiyueUserList[_User.getUserId()].count;
					}else{
						log.info("没有用户的魔鬼鱼数据");
						return {socre:0,propId:0,propCount:0};
					}

					if (this.moguiyueUserList[_User.getUserId()].count == 5){
						this.moguiyueUserList[_User.getUserId()].count = 0;
					}
					return {socre:outscore,propId:0,propCount:0};
			}

			if (!Math.floor(Math.random()*pro[_pro])){
				//机器人中鱼
				
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:pro[_pro],fishId:fishId,propId:0,propCount:0}});
				if (_pro == 25){
					this.boomList.push({fishId:fishId,userId:_User.getUserId(),bet:betCount[_betidx]});
					return {socre:0,propId:0,propCount:0};
				}else{
					return {socre:pro[_pro],propId:0,propCount:0};
				}
				
			}else{
				//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
				return {socre:0,propId:0,propCount:0};
			}
		}


		//道具鱼
		if (fishConfig[_pro].prop){
			var propidx = _pro-pro.length;
			this._propFishHitCount[propidx] -= _bet * gameConfig.gameBet;
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
		
		//聚宝盆
		if(_pro == 23){
			log.info("打到聚宝盆")
			this.pool += betCount[_betidx];
			this.virtualPool += betCount[_betidx];
			log.info(this.virtualPool)
			
			//判断是否已经达到虚拟值的10%
			if (this.pool > this.virtualPool / 10 && !Math.floor(Math.random()*1000)){
				var subValue = Math.floor(this.virtualPool / 10);
				this.pool += subValue;
				this.virtualPool -= subValue;
				this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:subValue,fishId:fishId,propId:0,propCount:0}});
				this.sendPool(this.virtualPool);
				return {socre:subValue,propId:0,propCount:0};
			}else{
				this.sendPool(this.virtualPool);
				return {socre:0,propId:0,propCount:0};
			}
		}


		if (Math.floor((this.HitTimes[_pro][_betidx] / 10)) >= this.pro_max[_pro]){
			log.info("重新计算_pro:" + _pro + " _bet" + betCount[_betidx]);
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
				//log.info("**fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
				if (_pro == 25){
					//炸弹
					this.boomList.push({fishId:fishId,userId:_User.getUserId(),bet:betCount[_betidx]});
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:1,fishId:fishId,propId:0,propCount:0}});
					return {socre:0,propId:0,propCount:0};
				}else if(_pro == 21){
					//金魔鬼


					var outscore = this.moguiyueOutList[this.moguiyueUserList[_User.getUserId()].count] * score;

					
					log.info(this.moguiyueUserList[_User.getUserId()].count)
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:outscore,fishId:fishId,propId:0,propCount:0,moguiCount:this.moguiyueUserList[_User.getUserId()].count}});


					if (this.moguiyueUserList[_User.getUserId()]){
						++this.moguiyueUserList[_User.getUserId()].count;
					}else{
						log.info("没有用户的魔鬼鱼数据");
						return {socre:0,propId:0,propCount:0};
					}

					if (this.moguiyueUserList[_User.getUserId()].count == 5){
						this.moguiyueUserList[_User.getUserId()].count = 0;
					}
					return {socre:outscore,propId:0,propCount:0};
				}else{
					this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:score,fishId:fishId,propId:0,propCount:0}});
					return {socre:score,propId:0,propCount:0};
				}
				
			}
			//log.info("没中");
			//log.info("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0,propId:0,propCount:0};
		}else{
			//log.info("没中");
			//log.info("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			this.HitTimes[_pro][_betidx] += hitCount;
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0,propId:0,propCount:0};
		}
	}


	//中鱼
	this.boomFishHit = function(_User,_bet,hitCount,fishId){
		//获得子弹倍数id
		if (!betCountObj[_bet]){
			log.info("没有这么子弹类型");
			return {socre:0};
		}

		//找到当前桌子有没有这ID的鱼
		var tabelobj = this.fishList[_User.getTable()];
		var _betidx = betCountObj[_bet] - 1;
		if (tabelobj[fishId] == null){
			log.info("爆炸没有找到这条鱼obj" + fishId);
			return {socre:0};
		}

		if (tabelobj[fishId].getFishId() != fishId){
			log.info("爆炸没有找到这条鱼" + fishId);
			return {socre:0};
		}

		if(tabelobj[fishId].isDel()){
			log.info("爆炸鱼已经死亡" + fishId);
			return {socre:0};
		}

		var _pro = tabelobj[fishId].getFishType();

		if (_pro < 0 || _pro >= fishConfig.length){
			log.info("爆炸中鱼类型错误!");
			return {socre:0};
		}

		//道具鱼
		if (fishConfig[_pro].prop){
			log.info("不能是道具鱼");
			return {socre:0};
		}
		
		//聚宝盆
		if(_pro == 23){
			log.info("不能是道具鱼");
			return {socre:0};
		}

		if(_pro == 25){
			log.info("不能是炸弹");
			return {socre:0};
		}

		if (_pro == 21){
			log.info("不能是魔鬼鱼");
			return {socre:0}
		}

		var tablestring = "table" + _User.getTable();

		//如果是机器人
		if (_User._Robot){
			if (!Math.floor(Math.random()*pro[_pro])){
				//机器人中鱼
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:pro[_pro],fishId:fishId,propId:0,propCount:0}});
				return {socre:pro[_pro]};
			}else{
				//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
				return {socre:0};
			}
		}


		if (Math.floor((this.HitTimes[_pro][_betidx] / 10)) >= this.pro_max[_pro]){
			log.info("重新计算_pro:" + _pro + " _bet" + betCount[_betidx]);
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
			
			var score = this.proCount[_pro][_betidx][idx] * betCount[_betidx] * pro[_pro];
			if (score > 0){
				//log.info("_fishId:" + fishId)
				//log.info("_pro:" + _pro)
				//log.info("score:" + score)
				//中鱼
				//鱼已经鱼进行回收
				tabelobj[fishId].del();
				this.delfishList.push(tabelobj[fishId]);
				delete tabelobj[fishId];
				//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:score,fishId:fishId,propId:0,propCount:0}});
				return {socre:this.proCount[_pro][_betidx][idx] * betCount[_betidx] * pro[_pro]};
			}
			//log.info("没中");
			//log.info("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0};
		}else{
			//log.info("没中");
			//log.info("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			this.HitTimes[_pro][_betidx] += hitCount;
			//this.io.sockets.in(tablestring).emit('HitResult', {ResultCode:1,ResultData:{userId:_User.getUserId(),hitSocre:0,fishId:fishId,propId:0,propCount:0}});
			return {socre:0};
		}
	}

	this.getBoomList = function(userId,fishId){
		for(var i = 0 ;i < this.boomList.length ; ++i){
			if (this.boomList[i].userId == userId && this.boomList[i].fishId == fishId) {
				var bet = this.boomList[i].bet;
				this.boomList.splice(i,1);
				return bet;
			}
		}
		return -1;
	}

	//发射子弹
	this.fishShoot = function(_pro,_bet,hitCount){

	}

	this.getmoguiCount = function(userId){
		var nowDate = new Date();
		var day = nowDate.getDate();
		//log.info("getmoguiCount")
		if (!this.moguiyueUserList[userId]){
			//log.info("bu cunzai")
			this.moguiyueUserList[userId] = {count:0,time:day}
		}else{
			//log.info(this.moguiyueUserList[userId].time)
			//log.info(day)
			if (this.moguiyueUserList[userId].time != day){
				//log.info("shijiantubtong")
				this.moguiyueUserList[userId].time = day;
				this.moguiyueUserList[userId].count = 0;
			}
		}
		log.info(this.moguiyueUserList[userId].count);
		return this.moguiyueUserList[userId].count;
	}

	this.getPool = function(){
		return {pool:this.pool,virtualPool:this.virtualPool}
	}

	this.setPool = function(info){
		log.info("***")
		log.info(info)
		this.pool = info.pool;
		this.virtualPool = info.virtualPool;

	}

	this.init();

}


module.exports = FishSever;

