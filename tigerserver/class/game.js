var User = require("./User");
var arithmetic = require("./arithmetic")
var gameDao = require("./../dao/gameDao");
var gameConfig = require("./../config/gameConfig");
var schedule = require("node-schedule");

var fs = require('fs');
//读取文件包



var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){


		//初始化算法，使用第X种
		this.initAlgorithm = function(idx){
			console.log('####init Algorithm!####')
			console.log('use [' + idx + '] Algorithm!')
			this.A = new arithmetic(idx);
			
		};

		this.serverId = 2;

		//初始化游戏
		this.init = function(){
			console.log('####init game!####')
			//初始化算法
			this.initAlgorithm(0);
			//初始化用户列表
			this.userList = {};
			//在线人数为0
			this.onlinePlayerCount = 0;
			//统计
			this.winTotal = 0;
			this.lotteryCount = 0;
			this.hourWinTotal = 0;
			this.hourlotteryCount = 0;
			//维护模式
			this.maintain = false;

			this.GameList = new Array();

			this.score_changeLogList = [];

			var self = this;
			//通过数据库获得winTotal与lotteryCount
			// dao.getGameTotalData(function(_resultCode,_winTotal,_lotteryCount){
			// 	if (_resultCode){
			// 		self.winTotal = _winTotal;
			// 		self.lotteryCount = _lotteryCount;
			// 	}else{
			// 		self.winTotal = 0;
			// 		self.lotteryCount = 0;
			// 	}
			// })
			var rule = new schedule.RecurrenceRule();
		　　var times = [];
		　　for(var i=0; i<60; i++){
		　　　　times.push(i);
		　　}
		　　rule.second = times;
			var c = 0;
			var self = this;
		　　var j = schedule.scheduleJob(rule, function(){
				self.score_changeLog();
			})

		};

		this.setIo = function(_io){
		}

		this.Setmaintain = function(_flag){
			this.maintain = _flag;
		}

		this.isMaintain = function(){
			return this.maintain;
		}

		//判断是否是同一scoket连续登录，不允许
		this.isLoginAgain = function(socket){
			if (socket.userId){
				return this.userList[socket.userId].Islogin();
			}
			else{
				return false;
			}
		}

		//添加用户
		this.addUser = function(_userInfo,socket){

			this.userList[_userInfo.userid] = new User(_userInfo,socket)

		}

		this.updateUser = function(userInfo){
			//console.log("更新了用户" + userInfo._userId)
			if (!this.userList[userInfo._userId]) return;
			this.userList[userInfo._userId].update(userInfo);
			//console.log(userInfo)
			//更新本地服务器数据免费次数与摇奖次数
			var self = this;
			gameDao.getFreeCount(userInfo,function(ResultCode,Result){
				//console.log("**" + Result.Id);
				if (!self.userList[userInfo._userId]) return;
				self.userList[userInfo._userId].updateFreeGame(Result);
				//console.log("更新了用户信息" + this.userList[userInfo._userId]._userId);
				//发送信息给当前用户
				var socketItem = self.userList[userInfo._userId]._socket;
				var resultObj = {account:self.userList[userInfo._userId]._account,id:self.userList[userInfo._userId]._userId,nickname:self.userList[userInfo._userId]._nickname,score:self.userList[userInfo._userId]._score,freeCount:self.userList[userInfo._userId].getFreeCount(),score_pool:self.A.getVirtualScorePool()};
				result = {resultid:'1',msg:'login lineserver succeed!',Obj:resultObj};
				socketItem.emit('loginGameResult',result);
			})
			
			this.LoginGame(userInfo._userId,this.serverId);
			++this.onlinePlayerCount;
		}

		//获得在线人数
		this.getOnlinePlayerCount = function(){
			return this.onlinePlayerCount;
		}

		//在线所有人
		this.getOnlinePlayer = function(){
			return this.userList;
		}
		
		//删除用户
		this.deleteUser = function(_socket){
			this._Csocket.emit("lineOut"

			if (_socket.userId){
				//判断是否还有牌局在继续
					console.log("用户没有登录桌子离开!:" + this.userList[_socket.userId]._userId);
					delete this.userList[_socket.userId];
					--this.onlinePlayerCount;
			}
		}

		//获得用户当前分数
		this.getUserscore = function(_userId){
			if (_userId){
				return this.userList[_userId]._score;
			}
		}

		//获得用户
		this.getUser = function(_userId){
			if (_userId){
				return this.userList[_userId];
			}
		}

		this.score_changeLog = function(){
			var self = this;
			var saveListTemp = [];
			var ItemTemp;
			var max = 0;
			if (this.score_changeLogList.length > 200){
				max = 200;
			}else{
				max = this.score_changeLogList.length;
			}
			for (var i = 0 ;i < max ; i++){
				if (this.score_changeLogList.length > 0){
					ItemTemp = this.score_changeLogList.shift();
					saveListTemp.push(ItemTemp);
				}
			}
			if (saveListTemp.length > 0){
				gameDao.score_changeLog(saveListTemp);
			}
		}
		
		this.lottery = function(_userId,_bet){
			//用户_userid 摇奖
			//返回-1 未登录
			//返回-2 资金不足
			
			if (!_userId){					//传输ID错误
				console.log("未传用户ID")
				return {code:-1};
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				console.log("找不到用户")
				return {code:-1}
			};

			if (!this.A.CheckBet(_bet)){
				console.log(_bet + "没有这个概率");
				return {code:-1};
			}

			var score_before = this.userList[_userId].getScore();
			var sourceFreeCount = this.userList[_userId].getFreeCount();
			var youScore = this.userList[_userId].getScore();
			//摇奖
			var lotteryResult = this.userList[_userId].lottery(_bet)
			if (!lotteryResult) {
				console.log(_userId + "分数不够")
				//console.log(this.userList[_userId])
				return {code:-2}
			} //分数不够
			//服务器摇奖,传倍率与用户摇奖次数
			var ResultArray = this.A.getArray(_bet,this.userList[_userId].getLotteryCount())
			//测试数据
			//ResultArray = [[6,6,6,1,6],[2,4,6,3,1],[3,4,1,4,3]];
			var checkInfo = this.A.check(ResultArray,1)
			var winscore;
			if (checkInfo.bigScore){
				winscore = checkInfo.scoreCount;
				//console.log(winscore);
			}else{
				winscore = checkInfo.scoreCount * _bet;
			}
			var freeCount = checkInfo.freeCount;
			
			
			this.userList[_userId].winscore(winscore);
			this.userList[_userId].AddFreeCount(freeCount);
			var resFreeCount = this.userList[_userId].getFreeCount();
			var score_current = this.userList[_userId].getScore();
			var arstring = ResultArray.join(",");
			//写入服务器记录
			//1.写记录
			var userInfo = {userid:_userId,bet:_bet,lines:9,
				score_before:score_before,score_win:winscore,
				score_current:score_current,result_array:arstring,
				score_linescore:_bet,free_count_win:freeCount,free_count_before:sourceFreeCount,
				free_count_current:resFreeCount}
			//console.log(userInfo)
				
			gameDao.lotteryLog(userInfo,function(Result){})

			//记录金钱变化量
			var userInfolog = {userid:_userId,score_before:youScore,score_change:winscore - _bet,score_current:score_current,change_type:gameConfig.logflag,isOnline:true};
			this.score_changeLogList.push(userInfolog);

			//制作结果
			var Result = {code:1,userscore:score_current,winscore:winscore,
				viewarray:ResultArray,winfreeCount:freeCount,
				freeCount:resFreeCount,score_pool:this.A.getVirtualScorePool()}


			//服务器统计
			++this.lotteryCount;
			++this.hourlotteryCount;
			if (lotteryResult == 1){
				this.winTotal += (winscore - _bet);
				this.hourWinTotal += (winscore - _bet);
			}else if(lotteryResult == 2){
				this.winTotal += winscore;
				this.hourWinTotal += winscore;
			}

			//console.log(Result)
			return Result;

		}

		this.getGameTotalData = function(){
			var GameInfo = {winScore:this.winTotal,lotteryCount:this.lotteryCount};
			return GameInfo;
		}


		//保存时间段输赢状况
		this.saveSocrePool = function(){
			//获得虚拟池
			var Virtualpool = this.A.getVirtualScorePool();
			//获得实际池
			var poollist = this.A.getScorePoolList();

			var poollistLength = this.A.getScorePoolListLength();

			gameDao.Update_score_pool(poollist,Virtualpool,poollistLength,function(Result){
			})
		}

		//用户是否在线
		this.IsPlayerOnline = function(_userId){
			if (!_userId){	//传输ID错误
				console.log("查询在线,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//console.log("查询在线,未找到" + _userId + "用户");
				return 1;
			}else{
				return 0;
			}
		}

		//获得用户当前分数
		this.getPlayerScore = function(_userId){
			if (!_userId){	//传输ID错误
				console.log("查询分数,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//console.log("查询在线,未找到" + _userId + "用户");
				return this.userList[_userId].getScore();
			}else{
				return -1;
			}
		}

		//GM加分
		this.addgold = function(_userId,score){

			if (!_userId){					//传输ID错误
				console.log("加分,未登录")
				return 0;
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				console.log("加分,未登录")
				return 0
			}else{
				//console.log(score)
				if (this.userList[_userId].addgold(score)){
					console.log("加分成功!")
					return 1;
				}else{
					console.log("减分失败,大于用户分数!");
					return 0;
				}
			}

		}

		
		//进入游戏
		this.LoginGame = function(_userId,gametype){
			//用户添加游戏ID
			//console.log(_userId)
			console.log("用户进入游戏" + gametype);
			this.userList[_userId].loginGame(gametype);
		}

		this.deleteUserNoLoginGame = function(userid){
			if (this.userList[userid]){
				delete this.userList[userid];
				console.log("未登录游戏离线!同时在线:" + this.onlinePlayerCount + "人")
			}
		}

		//运行初始化
		this.init();
	}


	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		console.log("####create game!####");
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()


module.exports = GameInfo;

