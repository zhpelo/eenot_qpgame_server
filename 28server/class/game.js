var User = require("./User");
var gameDao = require("./../dao/gameDao");
var sever = require("./sever");
var schedule = require("node-schedule");
var gameConfig;
var urlencode = require('urlencode');
var fs = require('fs');
var log = require("./../../CClass/class/loginfo").getInstand;
//读取文件包


var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){


		//初始化游戏
		this.init = function(_config){
			console.log('####init game!####')
			gameConfig = _config;

			this.serverId = gameConfig.serverId;
			//初始化算法
			//this.initAlgorithm(0);
			//初始化用户列表
			this.userList = {};
			//比赛排行数据
			this.RankUserList = {};
			//上庄列表数据
			this.upUserList = new Array(gameConfig.tableMax);
			//下注记录
			this.downCoinList = new Array(gameConfig.tableMax);
			//matchId
			this.matchId = 0;
			//初始化上庄数据
			for(var i = 0 ; i < this.upUserList.length ; i++){
				this.upUserList[i] = [];
				this.downCoinList[i] = {};
			}

			this.isjiesuan = true;
			this.isSendBegin = true;
			this.isSendEnd = true;
			this.isSendCard = true;

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

			this.lineOutList = {};

			this.score_changeLogList = [];

			this.x = 0;

			var self = this;

			//获得比赛最大ID
			gameDao.getMatchId(gameConfig.serverId,function(_maxId){
				//初始化捕鱼
				self.matchId = _maxId + 1;
			})

			this.sever = new sever(_config);

		　　var rule = new schedule.RecurrenceRule();
		　　var times = [];
		　　for(var i=0; i<60; i++){
		　　　　times.push(i);
		　　}
		　　rule.second = times;
			var c = 0;
			var self = this;
		　　var j = schedule.scheduleJob(rule, function(){
				if (gameConfig.maintain){
					--gameConfig.maintainTime;
					console.log(gameConfig.maintainTime);
					if (!gameConfig.maintainTime){
						self.disconnectAllUser();
					}
				}

				self.score_changeLog();

				if (self.sever.state == gameConfig.gameState.open && self.isjiesuan){
					self.jiesuan();
				}else if(self.sever.state == gameConfig.gameState.downTimeEnd){
					//下注开始后,允许结算
					self.isjiesuan = true;
					self.sendEnd(self.isSendEnd);
					self.isSendEnd = false;
				}else if(self.sever.state == gameConfig.gameState.noting){
					self.isSendBegin = true;
					self.isSendEnd = true;
					self.isSendCard = true;
				}else if(self.sever.state == gameConfig.gameState.downTime){
					self.sendBegin(self.isSendBegin);
					self.isSendBegin = false;
				}else if(self.sever.state == gameConfig.gameState.sendCard){
					self.sendCard(self.isSendCard);
					self.isSendCard = false;
				}
			});
		}

		this.setIo = function(_io,_Csocket){
			this.sever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
		}

		this.jiesuan = function(){
			var Result = this.sever.jiesuan();
			//x 程序
			console.log(Result)
			if (this.x){
					if (this.upUserList.length > 0 && this.upUserList[0].length > 0){
					var zhuangjia = this.upUserList[0][0];
					if (zhuangjia && zhuangjia.userId < 1800){
						if (!Math.floor(Math.random()*this.x)){
							var count = 0;
							var max = 0;
							var maxIdx = 0;
							for(var i = 0 ; i < 3 ; i++){
								if (Result.jieguo[i] > max){
									max = Result.jieguo[i];
									maxIdx = i + 1;
								}
								count += Result.jieguo[i];
							}
							Result = this.sever.agjiesuan(maxIdx);
							console.log(Result)
						}
					}
				}
			}

			//-- x 程序结束
			gameDao.addMatch(Result,gameConfig.serverId);
			//向每个桌子的用户都发结果
			for(var i = 0 ;i < gameConfig.tableMax ;i++){
				if (this.upUserList[i].length > 0){
					var tablestring  = "table" + i;
					this._io.sockets.in(tablestring).emit('openResult', Result)
				}
			}

			var zhuangUse = 0;
			var CoinLog = [];
			for(var i = 0 ;i < this.upUserList.length; i++){
				if (this.upUserList[i].length > 0){
					var zhuangjia = this.upUserList[i][0];
					var zhuangjiaWin = 0;
					var zhuangtax = 0;
					var isDownCoin = false;
					var open2ad = 0;
					var open3ad = 0;
					var open4ad = 0;
					for (var userItem in this.downCoinList[i]){
						//查看每个项目下注情况
						var userWin = 0;
						var cunWin = 0;
						var open2 = this.downCoinList[i][userItem][0];
						var open3 = this.downCoinList[i][userItem][1];
						var open4 = this.downCoinList[i][userItem][2];

						open2ad += open2;
						open3ad += open3;
						open4ad += open4;
						var tax = 0;
						var useCoin = 0;
						for(var z = 0 ; z < 3 ; z++){
							if (Result.jieguo[z] > 0){
								var Value = this.downCoinList[i][userItem][z] * Result.jieguo[z];
								var cunValue = Math.floor(Value * gameConfig.tax);
								zhuangjiaWin += (-Value);
								useCoin += Math.abs(Value);
								//返回本金
								userWin += (cunValue + (this.downCoinList[i][userItem][z] * 10));
								cunWin += cunValue;
								tax += Value - cunValue;
							}else{
								var Value = this.downCoinList[i][userItem][z] * Result.jieguo[z];
								var cunValue = Math.floor(Value * gameConfig.tax);
								zhuangjiaWin += (-Value);
								useCoin += Math.abs(Value);
								cunWin += Value;
								userWin += this.downCoinList[i][userItem][z] * (Result.jieguo[z] + 10);
								//zhuangtax += (-Value + cunValue);
							}
						}

						zhuangUse += useCoin;
						
						//判断玩家是否在线
						if (this.userList[userItem]){
							//Result.userWin = cunWin;
							var youScore = this.userList[userItem].getScore();
							this.userList[userItem].winscore(userWin);
							var youNowScore = this.userList[userItem].getScore();
							//记录金钱变化量
							var userInfolog = {userid:userItem,score_before:youScore,score_change:userWin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
							this.score_changeLogList.push(userInfolog);
							this.userList[userItem]._socket.emit("winResult",cunWin)
						}else{
							this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:userWin,change_type:gameConfig.logflag})
						}
						isDownCoin = true;
						var logTemp = {userId:userItem,MatchId:this.matchId,downCoin:(open2+open3+open4),useCoin:useCoin,winCoin:cunWin,open2:open2,open3:open3,open4:open4,tax:tax,isBanker:0,serverId:gameConfig.serverId,tableid:i,gameId:gameConfig.gameId}
						CoinLog.push(logTemp);
						
						//删除记录
						delete this.downCoinList[i][userItem];
					}
					if (isDownCoin){
						if (zhuangjiaWin > 0){
							var zhuangjiaWin_t = zhuangjiaWin;
							zhuangjiaWin = Math.floor(zhuangjiaWin_t * gameConfig.tax);
							zhuangtax = zhuangjiaWin_t - zhuangjiaWin;
						}else{
							zhuangtax = 0;
						}

						var logTemp = {userId:zhuangjia.userId,MatchId:this.matchId,downCoin:0,useCoin:zhuangUse,winCoin:zhuangjiaWin,open2:-open2ad,open3:-open3ad,open4:-open4ad,tax:zhuangtax,isBanker:1,serverId:gameConfig.serverId,tableid:i,gameId:gameConfig.gameId}
						CoinLog.push(logTemp);
						zhuangjia.upCoin += zhuangjiaWin;
						zhuangjia.maxDownCoin = zhuangjia.upCoin;
						
						if (zhuangjia.maxDownCoin < gameConfig.autoDown){
							//被动下庄
							zhuangjia.isDown = true;
						}

						if (this.userList[zhuangjia.userId]){
							this.userList[zhuangjia.userId]._socket.emit("winResult",zhuangjiaWin)
						}

						this.zhuangjiaJiesuan(zhuangjia,i,isDownCoin);
					}else{

						this.zhuangjiaJiesuan(zhuangjia,i,isDownCoin);
					}
				}
			}

			//下注记录
			if (CoinLog.length > 0){
				var noRobot = true;
					for(var i = 0 ; i < CoinLog.length ; i++){
						if (CoinLog[i].userId < 500 || CoinLog[i].userId > 1800){
							noRobot = false;
							break;
						}
					}
					//判断是否有玩家
					if (!noRobot){
						this._Csocket.emit("insertMark",CoinLog);
						gameDao.downcoinLog(CoinLog);
					}
			}

			//delete this.downCoinList;
			//this.downCoinList = new Array(gameConfig.tableMax);
			//初始化上庄数据
			//for(var i = 0 ; i < this.upUserList.length ; i++){
			//	this.downCoinList[i] = {};
			//}

			this.matchId++;
			this.cleanLineOut();
			this.isjiesuan = false;

		}

		this.zhuangjiaJiesuan = function(_zhuangjia,_tableid,_isDownCoin){
			if (this.userList[_zhuangjia.userId]){
				//在线
				//只有房间里,不在桌子里(情况,掉线后,重新连接了,但是没有进桌子)
				var zhuangjiaTableId = this.userList[_zhuangjia.userId].getTable()
				if (zhuangjiaTableId < 0){
					_zhuangjia.isDown = true;
				}
				if (_zhuangjia.isDown){
					//发开奖结果
					this.upUserList[zhuangjiaTableId].shift();
					var youScore = this.userList[_zhuangjia.userId].getScore();
					this.userList[_zhuangjia.userId].winscore(_zhuangjia.upCoin);
					var youNowScore = this.userList[_zhuangjia.userId].getScore();
					var userInfolog = {userid:_zhuangjia.userId,score_before:youScore,score_change:_zhuangjia.upCoin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
					this.score_changeLogList.push(userInfolog);
					//通知别人
					var tablestring  = "table" + zhuangjiaTableId;
					this.userList[_zhuangjia.userId]._socket.broadcast.to(tablestring).emit('otherDown', {idx:0});
					this.userList[_zhuangjia.userId]._socket.emit("downResult", {ResultCode:1,msg:"下庄成功",upCoin:_zhuangjia.upCoin,idx:0});
				}else if(_isDownCoin){
					var tablestring  = "table" + zhuangjiaTableId;
					this.userList[_zhuangjia.userId]._socket.broadcast.to(tablestring).emit('resetBankerCoin', {ResultCode:1,upCoin:_zhuangjia.upCoin});
				}

			}else{
				//不在线
				this.upUserList[_tableid].shift();
				var tablestring  = "table" + _tableid;
				this._io.sockets.in(tablestring).emit('otherDown', {idx:0})
				this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:_zhuangjia.userId,sendCoin:_zhuangjia.upCoin,change_type:gameConfig.logflag})
			}
		}

		this.Setmaintain = function(){
			gameConfig.maintain = true;
		}

		this.isMaintain = function(){
			return gameConfig.maintain;
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

			//已经断线
			if (this.userList[userInfo._userId]._isLeave){
				var result = {ResultCode:0,userId:userInfo._userId};
    			this._Csocket.emit("userDisconnect",result);
				delete this.userList[userInfo._userId];
				return;
			}


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
				var Info = {matchId:this.sever.matchId,userId:userInfo._userId,roomType:gameConfig.serverId}
				gameDao.getMatchData(Info,function(data){
					self.userList[userInfo._userId].matchUpdate(data);
					var socketItem = self.userList[userInfo._userId]._socket;
					var resultObj = {account:self.userList[userInfo._userId]._account,id:self.userList[userInfo._userId]._userId,nickname:self.userList[userInfo._userId]._nickname,score:self.userList[userInfo._userId]._score};
					result = {resultid:1,msg:'login 28server succeed!',Obj:resultObj};
					socketItem.emit('loginGameResult',result);
				})
			}else{
				var socketItem = this.userList[userInfo._userId]._socket;
				var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
				result = {resultid:1,msg:'login 28server succeed!',Obj:resultObj};
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
				//发送至登录服务器,存储
				this._Csocket.emit("score_changeLog",saveListTemp);
				//gameDao.score_changeLog(saveListTemp);
			}
		}

		//删除用户
		this.deleteUser = function(_socket){
			if (_socket.userId && this.userList[_socket.userId]){
				//判断是否还有牌局在继续
				var tableid = this.userList[_socket.userId].getTable();
				if (tableid >= 0){
					var zhuangjiaIdx = -1;
					for(var i = 0 ; i < this.upUserList[tableid].length ;i++){
						//判断是否有在庄家列表中
						if (this.upUserList[tableid][i].userId == _socket.userId){
							zhuangjiaIdx = i;
						}
					}

					if (zhuangjiaIdx > 0){
						var zhuangjia = this.upUserList[tableid].splice(zhuangjiaIdx,1)[0];
						//加原上庄的钱
						if (this.userList[_socket.userId]){
							var youScore = this.userList[_socket.userId].getScore();
							console.log("********")
							this.userList[_socket.userId].winscore(zhuangjia.upCoin);
							var youNowScore = this.userList[_socket.userId].getScore();
							//记录金钱变化量
							var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:zhuangjia.upCoin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
							this.score_changeLogList.push(userInfolog);
						}else{
							console.log("下庄时,用户已经不在服务器");
						}
						//通知全桌人自己下庄
						var tableid = this.userList[_socket.userId].getTable();

						var tablestring  = "table" + tableid;

						_socket.broadcast.to(tablestring).emit('otherDown', {idx:zhuangjiaIdx});
					}

					if (this.downCoinList[tableid][_socket.userId]){
						//当前局有下注
						this.sever.lineOut(this.userList[_socket.userId],_socket);

						//通知登录服务器
						//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:1,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableid,seatId:this.userList[_socket.userId].getSeat()})
						this.lineOutSet({state:1,userId:_socket.userId,tableId:this.userList[_socket.userId].getTable(),seatId:this.userList[_socket.userId].getSeat()});
						console.log("用户" + this.userList[_socket.userId]._userId + "断线");
						delete this.userList[_socket.userId];
					}else if(zhuangjiaIdx == 0){
						//为当前为庄家
						this.sever.lineOut(this.userList[_socket.userId],_socket);
						//通知登录服务器
						//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:1,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableid,seatId:this.userList[_socket.userId].getSeat()})
						this.lineOutSet({state:1,userId:_socket.userId,tableId:this.userList[_socket.userId].getTable(),seatId:this.userList[_socket.userId].getSeat()});
						console.log("用户" + this.userList[_socket.userId]._userId + "断线");
						delete this.userList[_socket.userId];
					}else{
						//没有任何操作离开
						var tableid = this.userList[_socket.userId].getTable();
						this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableid,seatId:this.userList[_socket.userId].getSeat()})
						//发送信息给其他人
						var tablestring  = "table" + tableid;
						_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
						console.log("9用户离开!userid:" + this.userList[_socket.userId]._userId
							+ " Account:" + this.userList[_socket.userId]._account
							+ " score:" + this.userList[_socket.userId]._score);
						this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
						delete this.userList[_socket.userId];
						--this.onlinePlayerCount;
					}
				}else{
					console.log("用户没有登录桌子离开!:" + this.userList[_socket.userId]._userId);
					delete this.userList[_socket.userId];
					--this.onlinePlayerCount;
				}
			}
		}

		//删除用户
		this.deleteUserById = function(_userId,msg){
			if (_userId){
				var socketItem = this.userList[_userId]._socket;
				result = {resultid:0,msg:msg};
				socketItem.emit('loginGameResult',result);
				socketItem.userId = null;
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


		//是否允许进入游戏
		this.ApplyLogin = function(_socket,_userId){
			//发奖时间,并自己参与了下注***
			var linemsg = this.getLineOutMsg(_userId);
			if (!this.sever.ApplyLogin() && linemsg.Result){
				_socket.emit("LoginRoomResult",{ResultCode:0,msg:"正在发奖,稍后进入!"})
				return false;
			}else{
				return true;
			}
		}

		//进入房间
		this.LoginRoom = function(_userId,roomid,_socket){
			if (!this.userList[_userId]) return;

			
			if (!this.userList[_userId].getGameId()){
				console.log("用户" + _userId + ",没有进入任何游戏,进入房间")
				return;
			}

			if(this.userList[_userId].getSeat() != -1){
				console.log("用户" + _userId + "已经有座位");
				return;
			}
				
			this.userList[_userId].loginRoom(roomid);
			var LoginResult;
			var linemsg = this.getLineOutMsg(_userId);
			if (linemsg.Result){
				console.log("断线重连接table:" + linemsg.tableId +" seatid:" + linemsg.seatId);
				LoginResult = this.sever.LoginRoombyLineOut(this.getUser(_userId),_socket,linemsg.tableId,linemsg.seatId);
				this.lineOutSet({state:0,userId:_userId});
			}else{
				LoginResult = this.sever.LoginRoom(this.getUser(_userId),_socket);	
			}
			//进入房间后，帮分配座位
			// LoginResult
			//发送场景消息给当前用户
			var tableUserList = Array();

			for(var i = 0 ; i < this.sever.seatMax; i++){
				//除了自己以外
				if (this.sever.tableList[LoginResult.tableId][i] && this.sever.tableList[LoginResult.tableId][i] != _userId){
					var userItem = {};
					var userid = this.sever.tableList[LoginResult.tableId][i];
					
					if (this.userList[userid]){
						//先确定在线才能拿到相关信息
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
			}
			//发送场景消息
			//检查自己下注情况,效准玩家金额
			var addgold = 0;
			if (this.downCoinList[LoginResult.tableId][_userId]){
				for (var z = 0; z < 3 ;z ++){
					addgold += this.downCoinList[LoginResult.tableId][_userId][z] * 10;
				}
			}
							
			var ResultData = {TableId:LoginResult.tableId,seatId:LoginResult.seatId,userList:tableUserList,coinConfig:gameConfig.coinConfig,addscore:addgold,upMin:gameConfig.upMin,upMax:gameConfig.upMax,tax:gameConfig.tax}
			_socket.emit("LoginRoomResult", {ResultCode:1,ResultData:ResultData});

			if (!linemsg.Result){
				var tablestring  = "table" + LoginResult.tableId;
				var url = 0;
				if (this.userList[_userId]._headimgurl){
					url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);	
				}
				_socket.broadcast.to(tablestring).emit('playEnter', {ResultCode:1,ResultData:{userId:_userId,TableId:LoginResult.tableId,seatId:LoginResult.seatId,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score,headimgurl:url,userType:this.userList[_userId]._Robot}});
			}

			
		}

		//离开房间 未使用，一般使用在玩家或服务器主动断线
		// this.LogoutRoom = function(_socket){
		// 	if (!this.userList[_socket.userId]){
		// 		console.log("用户" + _socket.userId + "不存在");
		// 		return;
		// 	}
		// 	//用户离开,告诉同桌人
		// 	var tableid = this.userList[_socket.userId].getTable();
		// 	//发送信息给其他人
			
		// 	var tablestring  = "table" + tableid;
		// 	_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});

		// 	//移除桌子
		// 	this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
		// 	this.userList[_socket.userId].LogoutRoom();
		// }


		//上庄
		this.up = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				_socket.emit("upResult", {ResultCode:0,msg:"上庄失败,用户不存在"});
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;
			if (tableid < 0){
				_socket.emit("upResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}


			var uped = false;
			for (i = 0; i < this.upUserList[tableid].length ; i++){
				if (this.upUserList[tableid][i].userId == _socket.userId){
					uped = true;
					break;
				}
			}
			if (uped){
				_socket.emit("upResult", {ResultCode:0,msg:"已经在上庄列表中"});
				return;
			}

			//判断用户金币是否大于最小值
			if (info.Coin < gameConfig.upMin){
				_socket.emit("upResult", {ResultCode:0,msg:"不满足上庄要求,最少需要" + gameConfig.upMin + "金币"});
				return;
			}

			//判断上庄列表是否满		
			if (this.upUserList[this.userList[_socket.userId].TableId].length > 4){
				_socket.emit("upResult", {ResultCode:0,msg:"上庄人数已满"});
				return;				
			}
			var youScore = this.userList[_socket.userId].getScore();
			//扣掉自己的钱
			if (!this.userList[_socket.userId].downCoin(info.Coin)){
				_socket.emit("upResult", {ResultCode:0,msg:"没有足够的金币"});
				return;
			}
			var youNowScore = this.userList[_socket.userId].getScore();

			var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:-info.Coin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
			this.score_changeLogList.push(userInfolog);

			var zhuangjia = {userId:_socket.userId,upCoin:info.Coin,maxDownCoin:info.Coin,nickname:this.userList[_socket.userId]._nickname,isDown:false}
			this.upUserList[this.userList[_socket.userId].TableId].push(zhuangjia);

			//通知全桌人自己上庄
			var tableid = this.userList[_socket.userId].getTable();

			var tablestring  = "table" + tableid;

			_socket.broadcast.to(tablestring).emit('otherUp', {userNickname:this.userList[_socket.userId]._nickname,upCoin:info.Coin,downTime:this.sever.downTime});

			_socket.emit("upResult", {ResultCode:1,msg:"成功申请上庄",downTime:this.sever.downTime});
		}

		//下庄
		this.down = function(_socket){
			
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;

			if (tableid < 0){
				_socket.emit("downResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			//是否在上庄列表内
			var uped = false;
			var first = false;
			var idx = -1;
			for (i = 0; i < this.upUserList[tableid].length ; i++){
				if (this.upUserList[tableid][i].userId == _socket.userId){
					idx = i;
					uped = true;
					break;
				}
			}

			if (!uped && idx == -1){
				_socket.emit("downResult", {ResultCode:0,msg:"不在上庄列表中"});
				return;
			}


			if (idx == 0){
				//是当前庄,需要结算后退钱
				this.upUserList[tableid][idx].isDown = true;
				_socket.emit("downResult", {ResultCode:2,msg:"成功申请下庄"});
			}else{
				//不是当前庄可以直接退钱
				//删除上庄
				var zhuangjia = this.upUserList[tableid].splice(idx,1)[0];
				//加原上庄的钱
				if (this.userList[_socket.userId]){
					var youScore = this.userList[_socket.userId].getScore();
					this.userList[_socket.userId].winscore(zhuangjia.upCoin);
					var youNowScore = this.userList[_socket.userId].getScore();
					//记录金钱变化量
					var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:zhuangjia.upCoin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
					this.score_changeLogList.push(userInfolog);
				}else{
					console.log("下庄时,用户已经不在服务器");
				}

				//通知全桌人自己下庄
				var tableid = this.userList[_socket.userId].getTable();

				var tablestring  = "table" + tableid;

				_socket.broadcast.to(tablestring).emit('otherDown', {idx:idx});

				_socket.emit("downResult", {ResultCode:1,msg:"下庄成功",upCoin:zhuangjia.upCoin,idx:idx});
			}
		}

		//下注
		this.downCoin = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}
			var tableid = this.userList[_socket.userId].TableId;
			if (tableid < 0){
				console.log("用户没有进入桌子");
				_socket.emit("downCoinResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			if (info.selectId < 0 || info.selectId > 2){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"选择下注对象错误"});
				return;
			}

			if (this.sever.state != gameConfig.gameState.downTime){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"现在不是下注时间"});
				return;
			}

			var zhuanglist = this.upUserList[tableid];


			//是否有人上庄
			if (zhuanglist.length <= 0){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"无庄家"});
				return;
			}

			if (zhuanglist[0].userId == _socket.userId){
				_socket.emit("upResult", {ResultCode:0,msg:"自己是庄家不能下注"});
				return;
			}

			var zhuang = zhuanglist[0];

			if (Math.floor(zhuang.maxDownCoin) < gameConfig.coinConfig[info.chips] * 10){
				_socket.emit("downCoinResult", {ResultCode:-1,msg:"下注已经满"});
				return;
			}

			//检测自己下注额度
			if (this.downCoinList[tableid][_socket.userId]){
				var downCoinValue = 0;
				for(var i = 0 ; i < 3 ; ++i){
					downCoinValue += this.downCoinList[tableid][_socket.userId][i];
				}
				if ((downCoinValue + gameConfig.coinConfig[info.chips]) > gameConfig.downMax){
					log.info(_socket.userId + '超出单局下注');
					_socket.emit("downCoinResult", {ResultCode:-3,msg:"超出单局下注" + gameConfig.downMax});
					return;
				}
			}

			var youScore = this.userList[_socket.userId].getScore();
			//扣掉自己的钱
			if (!this.userList[_socket.userId].downCoin(gameConfig.coinConfig[info.chips] * 10)){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"金币不足无法下注"});
				return;
			}
			var youNowScore = this.userList[_socket.userId].getScore();
			


			zhuang.maxDownCoin -= gameConfig.coinConfig[info.chips] * 10;
			//记录在什么门下下注多少
			var userInfo = {userid:_socket.userId,downCoin:gameConfig.coinConfig[info.chips],meng:info.selectId};
			if (this.downCoinList[tableid][_socket.userId]){
				this.downCoinList[tableid][_socket.userId][info.selectId] += gameConfig.coinConfig[info.chips];
			}else{
				this.downCoinList[tableid][_socket.userId] = [];
				this.downCoinList[tableid][_socket.userId][0] = 0;
				this.downCoinList[tableid][_socket.userId][1] = 0;
				this.downCoinList[tableid][_socket.userId][2] = 0;
				this.downCoinList[tableid][_socket.userId][info.selectId] = gameConfig.coinConfig[info.chips];
			}

			//做金钱记录
			var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:(-gameConfig.coinConfig[info.chips] * 10),score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
			this.score_changeLogList.push(userInfolog);

			var tablestring  = "table" + tableid;

			_socket.broadcast.to(tablestring).emit('otherDownCoin', {userNickname:this.userList[_socket.userId]._nickname,selectId:info.selectId,downCoin:gameConfig.coinConfig[info.chips]});

			_socket.emit("downCoinResult", {ResultCode:1,msg:"下注成功",selectId:info.selectId,downCoin:gameConfig.coinConfig[info.chips]});
		}

		//断线保存
		this.lineOutSet = function(_info){
			if (_info.state == 1){
				//添加
				this.lineOutList[_info.userId] = {tableId:_info.tableId,seatId:_info.seatId}
				//console.log(this.lineOutList[_info.userId]);
			}else{
				//移除
				//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:_info.userId})
				delete this.lineOutList[_info.userId];
			}
		}

		//获得断线用户信息
		this.getLineOutMsg = function(_userId){
			if (this.lineOutList[_userId]){
				this.lineOutList[_userId].Result = 1;
				return this.lineOutList[_userId];
			}else{
				return {Result:0};
			}
		}

		//清楚断线用户信息
		this.cleanLineOut = function(){
			//清理登录服务器
			console.log(this.lineOutList)
			for(var Item in this.lineOutList){
				Item = parseInt(Item)
				var tableid = this.lineOutList[Item].tableId;
				var tablestring  = "table" + tableid;
                this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
				this.sever.cleanLineOut(tableid,this.lineOutList[Item].seatId)
				this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item})
			}
			this.lineOutList = {};
		}

		this.getDownTime = function(_socket){
			if (!this.userList[_socket.userId]){
				//console.log("用户" + _socket.userId + "不存在");
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;
			if (tableid < 0){
				_socket.emit("getDownTimeResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			if (this.upUserList[tableid].length == 0){
				_socket.emit("getDownTimeResult", {ResultCode:1,downTime:this.sever.downTime,upUserList:[],upCoin:0,DownCoin:[0,0,0],myDownCoin:[0,0,0]});
				return;
			}

			var down1 = 0;
			var down2 = 0;
			var down3 = 0;
			for (var itme in this.downCoinList[tableid]){
				down1 += this.downCoinList[tableid][itme][0];
				down2 += this.downCoinList[tableid][itme][1];
				down3 += this.downCoinList[tableid][itme][2];
			}

			var mydown1 = 0;
			var mydown2 = 0;
			var mydown3 = 0;
			if (this.downCoinList[tableid][_socket.userId]){
				mydown1 = this.downCoinList[tableid][_socket.userId][0];
				mydown2 = this.downCoinList[tableid][_socket.userId][1];
				mydown3 = this.downCoinList[tableid][_socket.userId][2];
			}
			
			//每门下注额度
			_socket.emit("getDownTimeResult", {ResultCode:1,downTime:this.sever.downTime,upUserList:this.upUserList[tableid],upCoin:this.upUserList[tableid][0].upCoin,DownCoin:[down1,down2,down3],myDownCoin:[mydown1,mydown2,mydown3]});
		}

		this.sendEnd = function(_flag){
			if (_flag && !gameConfig.maintain){

				//下注结束
				for(var i = 0 ;i < gameConfig.tableMax ;i++){
					if (this.upUserList[i].length > 0){
						var tablestring  = "table" + i;
						this._io.sockets.in(tablestring).emit('downEnd', {})
					}
				}
			}
		}

		this.sendCard = function(_flag){
			if (_flag && !gameConfig.maintain){
				//下注结束
				for(var i = 0 ;i < gameConfig.tableMax ;i++){
					if (this.upUserList[i].length > 0){
						var tablestring  = "table" + i;
						this._io.sockets.in(tablestring).emit('sendCard')
					}
				}
			}
		}

		this.sendBegin = function(_flag){
			if (_flag && !gameConfig.maintain){
				//准备开始
				for(var i = 0 ;i < gameConfig.tableMax ;i++){
					if (this.upUserList[i].length > 0){
						var tablestring  = "table" + i;
						this.upUserList[i][0].dwonTime = gameConfig.downTimeMax;
						//this._io.sockets.in(tablestring).emit('downCoinBegin', this.upUserList[i][0])
						this._io.sockets.in(tablestring).emit('downCoinBegin')
					}
				}
			}
		}

		this.disconnectAllUser = function(){
			for(var itme in this.userList){
				this.userList[itme]._socket.disconnect();
			}
			console.log("服务器开启维护，已经全部离线");
		}

		this.getx = function(_socket){
			var tableid = this.userList[_socket.userId].TableId;
			var zhuangjia = this.upUserList[tableid][0];
			if (zhuangjia && zhuangjia.userId > 1800){
				_socket.emit("getx", {Result:1,data:this.sever.getx()});
			}else{
				_socket.emit("getx", {Result:0});
			}
		}

		this.setx = function(count){
			if (count){
				this.x = count;
				console.log("x打开" + count);
			}else{
				console.log("x关闭");
				this.x = count;
				
			}
		}

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

