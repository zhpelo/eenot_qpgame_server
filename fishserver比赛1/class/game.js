var User = require("./User");
var gameDao = require("./../dao/gameDao");
var fishsever = require("./fishsever");
var schedule = require("node-schedule");
var gameConfig = require("./../config/gameConfig");
var urlencode = require('urlencode');
var fs = require('fs');
//读取文件包



var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化算法，使用第X种
		// this.initAlgorithm = function(idx){
		// 	console.log('####init Algorithm!####')
		// 	console.log('use [' + idx + '] Algorithm!')
		// 	this.A = new arithmetic(idx);
		// };

		this.serverId = gameConfig.serverId;

		//初始化游戏
		this.init = function(){
			console.log('####init game!####')
			//初始化算法
			//this.initAlgorithm(0);
			//初始化用户列表
			this.userList = {};
			//比赛排行数据
			this.RankUserList = {};
			//在线人数为0
			this.onlinePlayerCount = 0;
			//统计
			this.winTotal = 0;
			this.lotteryCount = 0;
			this.hourWinTotal = 0;
			this.hourlotteryCount = 0;
			//维护模式
			this.maintain = false;
			this._io = {};
			this.GameList = new Array();
			this.matchRandKingList = [];

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

			this.fishsever = new fishsever();

			//定时器
			// 　　var rule = new schedule.RecurrenceRule();
			// 　　var times = [];
			// 　　for(var i=0; i<60; i++){
			// 　　　　times.push(i);
			// 　　}
			// 　　rule.second = times;
			// 	var c = 0;
			// 	var self = this;
			// 　　var j = schedule.scheduleJob(rule, function(){
			// 		//console.log("定时器")
			// 		//每个用户如果不发子弹，50秒，就让他自动离开
			// 		for(userItem in self.userList){
			// 			if (self.userList[userItem].getTable() != -1){
			// 				if (--self.userList[userItem]._shootTime == 0){
			// 					self.LogoutRoomTime(userItem);
			// 					console.log(userItem);
			// 				}else{
			// 					console.log(self.userList[userItem]._shootTime)
			// 				}
			// 			}
						
			// 		}
			// 	});
			if (gameConfig.isMatchRoom){
			　　var rule = new schedule.RecurrenceRule();
			　　var times = [];
			　　for(var i=0; i<60; i++){
			　　　　times.push(i);
			　　}
			　　rule.second = times;
				var c = 0;
				var self = this;
			　　var j = schedule.scheduleJob(rule, function(){
					if (self.fishsever.getCleanRank()){
							self.RankUserList = {};
							self.fishsever.offCleanRank()
							return;
					}
					var randlist = [];
					for(userItem in self.RankUserList){
						randlist.push(self.RankUserList[userItem]);
					}
					randlist.sort(function(a,b){
						return b._score - a._score;
					})

					// for(var j=0; j < randlist.length; j++){
					// 	console.log("nickname:" + randlist[j]._nickname + " score:"  + randlist[j]._score);
					// }
					

					//向登录服务器发排行榜
					if (self._Csocket){
						self._Csocket.emit("setServerRank",{serverId:self.serverId,randIdx:self.fishsever.matchId,ApplyFlag:self.fishsever.ApplyFlag,MatchLogin:self.fishsever.MatchLogin,rank:randlist})
					}

					//只发前10
					randlist.splice(10, randlist.length - 10);
					var MatchTime = 0;
					var nowDate = new Date();
					var hours = nowDate.getHours();
					var minute = nowDate.getMinutes();
					var second = nowDate.getSeconds();
					if (hours >= 8){
						minute = 9 - (minute % 10);
						second = 60 - second; 
						MatchTime = minute * 60 + second;
					}
					//console.log(MatchTime);
					self.fishsever.sendRank(randlist,MatchTime);

					//储存比赛成绩
					var saveListTemp = [];
					for (var i = 0 ;i < 20 ; i++){
						if (self.matchRandKingList.length > 0){
							saveListTemp.push(self.matchRandKingList.shift());
						}
					}

					gameDao.matchRandKing(saveListTemp,function(ResultCode){
						
					})

				});
			}
		}

		this.setIo = function(_io,_Csocket){
			this.fishsever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
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
			this.userList[_userInfo.userid] = new User(_userInfo,socket);
		}

		this.updateUser = function(userInfo){
			if (!this.userList[userInfo._userId]) return;
			this.userList[userInfo._userId].update(userInfo);

			this.LoginGame(userInfo._userId,this.serverId);
			++this.onlinePlayerCount;

			var self = this;
			//更新比赛数据
			if (gameConfig.isMatchRoom){
				//如果能搜索到相应数据
				//就把已经报名复制
				//把比赛分数附上
				//把_bank等于score
				var Info = {matchId:this.fishsever.matchId,userId:userInfo._userId,roomType:gameConfig.serverId}
				gameDao.getMatchData(Info,function(data){
					self.userList[userInfo._userId].matchUpdate(data);
					var socketItem = self.userList[userInfo._userId]._socket;
					var resultObj = {account:self.userList[userInfo._userId]._account,id:self.userList[userInfo._userId]._userId,nickname:self.userList[userInfo._userId]._nickname,score:self.userList[userInfo._userId]._score};
					result = {resultid:'1',msg:'login fishserver succeed!',Obj:resultObj};
					socketItem.emit('loginGameResult',result);
				})
			}else{
				var socketItem = this.userList[userInfo._userId]._socket;
				var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
				result = {resultid:'1',msg:'login fishserver succeed!',Obj:resultObj};
				socketItem.emit('loginGameResult',result);
			}

		}

		//获得在线人数
		this.getOnlinePlayerCount = function(){
			return this.onlinePlayerCount;
		}

		//在线所有人
		this.getOnlinePlayer = function(){
			return this.userList;
		}

		//用户结算
		this.balanceByUserId = function(_userId){
			//console.log("用户结算")
			var useCoin = this.userList[_userId].getUseCoin();
			var winCoin = this.userList[_userId].getWinCoin();
			this.userList[_userId].balance();
			var info = {userid:_userId,useCoin:useCoin,winCoin:winCoin}
			//console.log(gameConfig.bulletActivity);
			gameDao.balanceLog(info,gameConfig.bulletActivity,gameConfig.everyWinCoinActivity,gameConfig.lvActivity,function(result){
			})
		}
		
		//删除用户
		this.deleteUser = function(_socket){
			if (_socket.userId){
				//如果用户没有座位ID才结算
				if (this.userList[_socket.userId].getSeat() >= 0){
					this.balanceByUserId(_socket.userId);
				}
				//用户离开,告诉同桌人
				var tableid = this.userList[_socket.userId].getTable();
				//发送信息给其他人
				
				var tablestring  = "table" + tableid;
				_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});

				console.log("9用户离开!userid:" + this.userList[_socket.userId]._userId
					+ " Account:" + this.userList[_socket.userId]._account
					+ " score:" + this.userList[_socket.userId]._score);
				this.fishsever.LogoutRoom(this.userList[_socket.userId],_socket);
				delete this.userList[_socket.userId];

				--this.onlinePlayerCount;
				//console.log("10离线!同时在线:" + this.onlinePlayerCount + "人")
			}
		}

				//删除用户
		this.deleteUserById = function(_userId){
			if (_userId){
				delete this.userList[_userId];
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
				console.log(score)
				if (this.userList[_userId].addgold(score)){
					console.log(this.userList[_userId].getScore())
					console.log("加分成功!")
					var tablestring = "table" + this.userList[_userId].getTable();
					this._io.sockets.in(tablestring).emit('addgoldResult',{userId:_userId,userSeatId:this.userList[_userId].getSeat(),userScore:this.userList[_userId]._score})
					return 1;
				}else{
					console.log("减分失败,大于用户分数!");
					return 0;
				}
			}
		}


		//进入游戏
		this.LoginGame = function(_userId,gametype){
			if (!this.userList[_userId]) return;
			//用户添加游戏ID
			//console.log(_userId)
			//console.log("用户进入游戏" + gametype);
			this.userList[_userId].loginGame(gametype);
		}

		this.addRankUserList = function(_info){
			console.log(_info);
			this.RankUserList[_info.userId] = {id:_info.userId,nickname:_info._nickname,_score:gameConfig.roomApplyCoin};
		}


		//存储比赛成绩
		this.updateMatchRandKing = function(_userId,callback){
			if (!this.userList[_userId]) {
				callback(0);
				return;
			}
			if (!this.userList[_userId]._Apply) {
				callback(0);
				return;
			}
			var userInfo = {};
			userInfo.matchId = this.userList[_userId]._matchId;
			userInfo.userId = _userId;
			userInfo.score = this.userList[_userId].getScore();
			userInfo.lastTime = this.userList[_userId]._lastTime;
			userInfo.roomType = gameConfig.serverId;

			this.matchRandKingList.push(userInfo);

			callback(1);
		}

		//进入房间
		this.LoginRoom = function(_userId,roomid,_socket){
			if (!this.userList[_userId]) return;

			//进放房间失败
			//比赛时间低于30秒禁止进入房间
			if (!this.fishsever.MatchLogin && gameConfig.isMatchRoom){
				_socket.emit("LoginRoomResult",{ResultCode:0,msg:"比赛时间低于30秒禁止进入房间"})
				return;
			}

			if (!this.userList[_userId]._Apply && gameConfig.isMatchRoom){
				_socket.emit("LoginRoomResult",{ResultCode:0,msg:"未报名,无法进入"})
				return;
			}
			//如果没有进入游戏,无法进入任何房间
			if (this.userList[_userId].getGameId()){

				if(this.userList[_userId].getSeat() == -1){
					this.userList[_userId].loginRoom(roomid);

					//进入房间后，帮分配座位
					var LoginResult = this.fishsever.LoginRoom(this.getUser(_userId),_socket);
					//console.log("用户进入房间" + roomid);

					//如果是比赛房间,先拿数据库里的值*****
					

					// LoginResult
					//发送场景消息给当前用户
					var tableUserList = Array();
					for(var i = 0 ; i < this.fishsever.seatMax; i++){
						//除了自己以外
						if (this.fishsever.tableList[LoginResult.tableId][i] && this.fishsever.tableList[LoginResult.tableId][i] != _userId){
							var userItem = {};
							var userid = this.fishsever.tableList[LoginResult.tableId][i].userId;
							//console.log(this.fishsever.tableList[LoginResult.tableId][i])
							userItem.userId = this.userList[userid].getUserId();
							userItem.seatId = this.userList[userid].getSeat();
							userItem.nickname = this.userList[userid]._nickname;
							userItem.score = this.userList[userid]._score;
							userItem.userType = this.userList[userid]._Robot;
							var url = 0;
							if (this.userList[userid]._headimgurl){
								url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[userid]._headimgurl);
							}
							
							userItem.headimgurl = url;
							tableUserList.push(userItem);
						}
					}
					var ResultData = {TableId:LoginResult.tableId,seatId:LoginResult.seatId,userList:tableUserList}
					_socket.emit("LoginRoomResult", {ResultCode:1,ResultData:ResultData});

					var tablestring  = "table" + LoginResult.tableId;
					var url = 0;
					if (this.userList[_userId]._headimgurl){
						url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);	
					}
					_socket.broadcast.to(tablestring).emit('playEnter', {ResultCode:1,ResultData:{UserId:_userId,TableId:LoginResult.tableId,seatId:LoginResult.seatId,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score,headimgurl:url,userType:this.userList[_userId]._Robot}});
					//把子弹时间初始化
					this.userList[_userId].initShootTime();
				}else{
					console.log("玩家" + _userId + "已经进入了房间");
				}
			}
			else
				console.log("用户" + _userId + ",没有进入任何游戏,进入房间")
		}

		//离开房间
		this.LogoutRoom = function(_socket){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}
			//console.log("离开房间")
			if (this.userList[_socket.userId].getSeat() >= 0){
				this.balanceByUserId(_socket.userId);
			}
			//用户离开,告诉同桌人
			var tableid = this.userList[_socket.userId].getTable();
			//发送信息给其他人
			
			var tablestring  = "table" + tableid;
			_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
			//移除桌子
			
			this.fishsever.LogoutRoom(this.userList[_socket.userId],_socket);
			this.userList[_socket.userId].LogoutRoom();
		}


		//中鱼
		this.fishHit = function(_userId,fishId,_bulletId,_sendId){
			//console.log("fishHit");
			//判断是否是机器人
			if (_sendId && this.userList[_sendId] && this.userList[_sendId]._Robot){
				_userId = _sendId;
			}


			if (!_userId){					//传输ID错误
				console.log("未传用户ID")
				return {code:-1};
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				console.log("找不到用户")
				return {code:-1}
			};
			//console.log(this.userList[_userId].getSeat() + " - "+ this.fishsever.seatMax)
			if(this.userList[_userId].getSeat() >= 0 && this.userList[_userId].getSeat() < this.fishsever.seatMax){
				//判断子弹是否存在
				var _bet = this.userList[_userId].removeBulletLife(_bulletId);
				if (_bet <=0){
					console.log("找不到子弹");
					return {code:-1};
				}

				var hitResult = this.fishsever.fishHit(this.userList[_userId],_bet,10,fishId);
				this.userList[_userId].winscore(hitResult.socre * gameConfig.gameBet);
				//比赛分数
				if (gameConfig.isMatchRoom){
					this.RankUserList[_userId]._score = this.userList[_userId].getScore();
				}
				//hitResult.propId = 1;
				//hitResult.propCount = 1;
				//console.log(hitResult)
				this.userList[_userId].addProp(hitResult.propId,hitResult.propCount);
				//道具入库
				if (hitResult.propCount > 0){
					var info = {userId:_userId,propId:hitResult.propId,propCount:hitResult.propCount,roomid:gameConfig.serverId}
					gameDao.getPropByUserId(info,function(result){
					});
				}
				return hitResult.socre;
			}else{
				console.log("用户没有进入房间!")
				return 0;
			}
		}

		//发射子弹
		this.fishShoot = function(_socket,Info){
			if (!_socket.userId) return;
			var tableid = this.userList[_socket.userId].getTable();
			if (tableid < 0){
				console.log("error:没有进入桌子,发射子弹");
				return;
			}

			//子弹倍数是否可用
			
			if (!this.fishsever.findBulletBet(Info.bet)){
				console.log("error:没有这个类型的子弹!");
				return;
			}

			//先扣钱,并保存子弹
			if (this.userList[_socket.userId].fishShoot(Info.bet,gameConfig.gameBet,Info.bulletId)){
				//找到用户的桌子
				Info.score = this.userList[_socket.userId].getScore();
				//console.log(this.userList[_socket.userId]._Robot);
				//发送信息给其他人
				var tablestring  = "table" + tableid;
				//console.log(tablestring)
				_socket.broadcast.to(tablestring).emit('fishShoot', Info);
			}

			//比赛分数
			if (gameConfig.isMatchRoom){
				this.RankUserList[_socket.userId]._score = this.userList[_socket.userId].getScore();	
			}
		}

		this.getMatchRoom = function(_socket){
			//制作排行榜
			if (gameConfig.isMatchRoom){
				var randlist = [];
				for(userItem in this.RankUserList){
					randlist.push(this.RankUserList[userItem]);
				}
				randlist.sort(function(a,b){
					return b._score - a._score;
				})				

				//只发前10
				randlist.splice(10, randlist.length - 10);
				var MatchTime = 0;
				var nowDate = new Date();
				var hours = nowDate.getHours();
				var minute = nowDate.getMinutes();
				var second = nowDate.getSeconds();
				if (hours >= 8){
					minute = 9 - (minute % 10);
					second = 60 - second; 
					MatchTime = minute * 60 + second;
				}
				_socket.emit("matchRank",{time:MatchTime,list:randlist});
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

