var User = require("./User");
var gameDao = require("./../dao/gameDao");
var sever = require("./sever");
var schedule = require("node-schedule");
var gameConfig;
var urlencode = require('urlencode');
var fs = require('fs');
var log = require("./loginfo").getInstand;


var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化算法，使用第X种
		// this.initAlgorithm = function(idx){
		// 	console.log('####init Algorithm!####')
		// 	console.log('use [' + idx + '] Algorithm!')
		// 	this.A = new arithmetic(idx);
		// };

		

		//初始化游戏
		this.init = function(_config){
			console.log('####init game!####');
			
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
			//结算
			this.isjiesuan = [];
			this.isSendBegin = [];
			this.isSendEnd = [];
			this.isSendCard = [];
			this.isChangeZhuangFun = [];
			this.isChangeZhuang = [];
			this.openResult = [];
			this.isOpenEnd = [];
			this.saizi = [];
			this.isSendShuffle = [];

			//初始化上庄数据
			for(var i = 0 ; i < this.upUserList.length ; i++){
				this.upUserList[i] = [];
				this.downCoinList[i] = {};
				this.isjiesuan[i] = true;
				this.isSendBegin[i] = true;
				this.isSendEnd[i] = true;
				this.isSendCard[i] = true;
				this.isChangeZhuangFun[i] = true;
				this.isChangeZhuang[i] = false;
				this.isOpenEnd[i] = true;
				this.isSendShuffle[i] = true;
				this.saizi[i] = 0;
			}
			

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

			this.x = 10000;

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

				for(var z = 0 ; z < gameConfig.tableMax; z++){
					if (self.sever.state[z] == gameConfig.gameState.sendCardTime && self.isSendCard[z]){
						self.sendCardTable(z,self.sever.state[z]);
					}else if (self.sever.state[z] == gameConfig.gameState.shuffle && self.isSendShuffle[z]){
						self.sendShuffle(z,self.sever.state[z]);
					}else if (self.sever.state[z] == gameConfig.gameState.open && self.isOpenEnd[z]){
						self.openEnd(z);
						self.cleanLineOut();
						self.isSendCard[z] = true;
						self.isSendBegin[z] = true;
						self.isSendEnd[z] = true;
						self.isjiesuan[z] = true;
						self.isChangeZhuang[z] = false;
						self.isSendShuffle[z] = true;
					}else if(self.sever.state[z] == gameConfig.gameState.downTimeEnd){
						self.sendEndTable(self.isSendEnd[z],z);
						self.isOpenEnd[z] = true;
					}else if(self.sever.state[z] == gameConfig.gameState.noting2){
						self.isChangeZhuang[z] = false;
					}else if(self.sever.state[z] == gameConfig.gameState.downTime){
						self.sendBegin(self.isSendBegin[z],z);
						self.isChangeZhuangFun[z] = true;
					}else if(self.sever.state[z] == gameConfig.gameState.changeZhuang && self.isChangeZhuangFun[z]){
						self.isChangeZhuang[z] = true;
						self.isChangeZhuangFun[z] = false;
						self.downZhuangTable(z);
					}else if(self.sever.state[z] == gameConfig.gameState.openEnd && self.isjiesuan[z]){
						self.jiesuanTable(z);
					}
				}

			});
		}

		this.sendCardTable = function(tableid,state){
			if (this.isSendCard[tableid]){
				this.isSendCard[tableid] = false;
				var _zhuangjia = this.upUserList[tableid][0];

				if (_zhuangjia){
					var tablestring  = "table" + tableid;
					//是否洗牌与点数
					var dice1 = Math.floor(Math.random()*6) + 1;
					var dice2 = Math.floor(Math.random()*6) + 1;
					this.saizi[tableid] = dice1 + dice2;
					this._io.sockets.in(tablestring).emit('sendCard',{dice1:dice1,dice2:dice2});
				}
				
			}
		}

		this.sendShuffle = function(tableid,state){
			if (this.isSendShuffle[tableid]){
				this.isSendShuffle[tableid] = false;
				var _zhuangjia = this.upUserList[tableid][0];

				if (_zhuangjia){
					var tablestring  = "table" + tableid;
					//是否洗牌与点数
					this._io.sockets.in(tablestring).emit('sendShuffle');
				}
				
			}
		}

		this.setIo = function(_io,_Csocket){
			this.sever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
		}

		this.openEnd = function(_tableId){
			//console.log("here")
			var i = _tableId;
			var Result;
			//console.log(_tableId)
			this.isOpenEnd[i] = false;
			if (this.upUserList[i].length > 0){
				Result = this.sever.jiesuan(i);
				console.log(Result);
				//x 程序
				if (i == 0 && this.x){
						if (this.upUserList.length > 0 && this.upUserList[0].length > 0){
						var zhuangjia = this.upUserList[0][0];
						if (zhuangjia && zhuangjia.userId < 1800){
							if (!Math.floor(Math.random()*this.x)){
								var count = 0;
								var max = 0;
								var maxIdx = 0;
								for(var j = 0 ; j < 3 ; j++){
									if (Result.jieguo[j] > max){
										max = Result.jieguo[j];
										maxIdx = j + 1;
									}
									count += Result.jieguo[j];
								}
								Result = this.sever.agjiesuan(maxIdx);
								console.log("ag");
								console.log(Result);
								//console.log(Result)
							}
						}
					}
				}
				//-- x 程序结束

				gameDao.addMatch(Result,gameConfig.serverId,i);
				Result.matchId = this.matchId;
				this.matchId++;

				var tablestring  = "table" + i;
				this._io.sockets.in(tablestring).emit('openResult', Result);

				this.openResult[i] = Result;
			}
		}

		this.jiesuanTable = function(_tableId){
			var i = _tableId;
			Result = this.openResult[_tableId];
			// Result.jieguo[0] = 2;
			// Result.jieguo[1] = -1;
			// Result.jieguo[2] = 1;
			if (!Result){
				console.log("结果错误,没有结算");
				return;
			}

			var CoinLog = [];
			var zhuangjia = this.upUserList[i][0];
			var zhuangjiaWin = 0;
			var zhuangtax = 0;
			var zhuangUse = 0;
			var isDownCoin = false;
			var openad = [0,0,0];

			//先计算赔付
			for (var userItem in this.downCoinList[i]){
				//查看每个项目下注情况
				var userWin = 0;
				var cunWin = 0;
				var open2 = this.downCoinList[i][userItem][0];
				var open3 = this.downCoinList[i][userItem][1];
				var open4 = this.downCoinList[i][userItem][2];

				openad[0] += open2;
				openad[1] += open3;
				openad[2] += open4;
			}

			//console.log(openad[0])
			//console.log(openad[1])
			//console.log(openad[2])
			//console.log("--------------");
			var tempZhuangjiaCoin = zhuangjia.upCoin;

			//把输的全加上
			var firstIdx = this.saizi[i] % 4;
			firstIdx = 2;
			if (firstIdx == 0){
				firstIdx = 4;
			}
			for(var z = 0 ; z < 3 ; z++){
				if (Result.jieguo[z] < 0){
					tempZhuangjiaCoin += openad[z];
				}
			}

			//从骰子位开始计算
			var jisuanIdx = 3;
			while(jisuanIdx){
				firstIdx = firstIdx % 4;
				if (firstIdx == 0){
					firstIdx = 4;
				}
				//console.log(firstIdx)
				if (firstIdx != 1){
					//console.log(tempZhuangjiaCoin);
					if (Result.jieguo[firstIdx - 2] > 0){
						if (tempZhuangjiaCoin >= openad[firstIdx - 2] * Result.jieguo[firstIdx - 2]){
							tempZhuangjiaCoin -= openad[firstIdx - 2] * Result.jieguo[firstIdx - 2]
						}else{
							Result.jieguo[firstIdx - 2] = tempZhuangjiaCoin / openad[firstIdx - 2];
							tempZhuangjiaCoin = 0;
						}
					}
					//console.log(jisuanIdx);
					--jisuanIdx;
				}
				//console.log(Result.jieguo)
				++firstIdx;
			}

			//console.log(Result);



			for (var userItem in this.downCoinList[i]){
				//查看每个项目下注情况
				var userWin = 0;
				var cunWin = 0;
				var open2 = this.downCoinList[i][userItem][0];
				var open3 = this.downCoinList[i][userItem][1];
				var open4 = this.downCoinList[i][userItem][2];

				var tax = 0;
				var useCoin = 0;

				for(var z = 0 ; z < 3 ; z++){
					if (Result.jieguo[z] > 0){
						var Value = this.downCoinList[i][userItem][z] * Result.jieguo[z];
						useCoin += Math.abs(Value);
						var cunValue = Math.floor(Value * gameConfig.tax);
						zhuangjiaWin += (-Value);
						//返回本金
						userWin += (cunValue + (this.downCoinList[i][userItem][z]));
						cunWin += cunValue;
						tax += Value - cunValue;
					}else{
						var Value = this.downCoinList[i][userItem][z] * Result.jieguo[z];
						useCoin += Math.abs(Value);
						zhuangjiaWin += (-Value);
						cunWin += Value;
						userWin += this.downCoinList[i][userItem][z] * (Result.jieguo[z] + 1);
						
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
					this.userList[userItem]._socket.emit("winResult",{winCoin:cunWin,remainCoin:youNowScore});
				}else{
					this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:userWin,change_type:gameConfig.logflag})
				}
				isDownCoin = true;
				var logTemp = {userId:userItem,MatchId:Result.matchId,downCoin:(open2+open3+open4),useCoin:useCoin,winCoin:cunWin,open2:open2,open3:open3,open4:open4,tax:tax,isBanker:0,serverId:gameConfig.serverId,tableid:i,gameId:gameConfig.gameId}
				CoinLog.push(logTemp);
				
				//删除记录
				delete this.downCoinList[i][userItem];
			}
			var zhuangUseCoin = 0;
			if (isDownCoin){
				
				if (zhuangjiaWin > 0){
					var zhuangjiaWin_t = Math.floor(zhuangjiaWin);

					zhuangjiaWin = Math.floor(zhuangjiaWin_t * gameConfig.tax);
					zhuangtax = zhuangjiaWin_t - zhuangjiaWin;
				}else{
					zhuangtax = 0;
				}

				var logTemp = {userId:zhuangjia.userId,MatchId:Result.matchId,downCoin:0,useCoin:zhuangUse,winCoin:zhuangjiaWin,open2:-openad[0],open3:-openad[1],open4:-openad[2],tax:zhuangtax,isBanker:1,serverId:gameConfig.serverId,tableid:i,gameId:gameConfig.gameId}
				CoinLog.push(logTemp);
				zhuangjia.upCoin += zhuangjiaWin;
				zhuangjia.maxDownCoin = zhuangjia.upCoin;
				
				if (zhuangjia.maxDownCoin < gameConfig.autoDown){
					//被动下庄
					zhuangjia.isDown = true;
					//log.info("标识为自动下庄" + zhuangjia.maxDownCoin);
				}

				if (this.userList[zhuangjia.userId]){
					this.userList[zhuangjia.userId]._socket.emit("winResult",{winCoin:zhuangjiaWin,remainCoin:0})
				}

				this.zhuangjiaJiesuan(zhuangjia,i,isDownCoin);
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
			
			
			this.isjiesuan[i] = false;
			this.saizi[i] = 0;
		}


		this.zhuangjiaJiesuan = function(_zhuangjia,_tableid,_isDownCoin){
			if (this.userList[_zhuangjia.userId]){
				if(_isDownCoin){
					var tablestring  = "table" + _tableid;
					this.userList[_zhuangjia.userId]._socket.broadcast.to(tablestring).emit('resetBankerCoin', {ResultCode:1,upCoin:_zhuangjia.upCoin});
				}
			}
		}

		this.downZhuangTable = function(tableid){
			var i = tableid;
			var _zhuangjia = this.upUserList[i][0];
			if (_zhuangjia){
				++this.upUserList[i][0].doCount;
				this.upUserList[i][0].vs = false;
				if (_zhuangjia && this.userList[_zhuangjia.userId]){
					//在线
					//只有房间里,不在桌子里(情况,掉线后,重新连接了,但是没有进桌子)
					var zhuangjiaTableId = this.userList[_zhuangjia.userId].getTable()
					if (_zhuangjia.isDown){
						//发开奖结果
						//下庄,钱不够,点击下庄了
						this.upUserList[zhuangjiaTableId].shift();
						if (this.upUserList[zhuangjiaTableId].length > 0){
							this.sever.reset(zhuangjiaTableId);
						}else{
							this.sever.stop(zhuangjiaTableId);
						}
						
						var youScore = this.userList[_zhuangjia.userId].getScore();
						this.userList[_zhuangjia.userId].winscore(_zhuangjia.upCoin);
						var youNowScore = this.userList[_zhuangjia.userId].getScore();
						var userInfolog = {userid:_zhuangjia.userId,score_before:youScore,score_change:_zhuangjia.upCoin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
						this.score_changeLogList.push(userInfolog);
						//通知别人
						var tablestring  = "table" + zhuangjiaTableId;
						this.userList[_zhuangjia.userId]._socket.broadcast.to(tablestring).emit('otherDown', {idx:0});
						this.userList[_zhuangjia.userId]._socket.emit("downResult", {ResultCode:1,msg:"下庄成功",upCoin:_zhuangjia.upCoin,idx:0});
					}
				}else{
					//不在线,掉线
					
					if (_zhuangjia && (_zhuangjia.doCount >= gameConfig.doCountMax || _zhuangjia.isDown)){
						//下庄
						this.upUserList[i].shift();
						if (this.upUserList[i].length > 0){
							this.sever.reset(i);
						}else{
							this.sever.stop(i);
						}
						var tablestring  = "table" + i;
						this._io.sockets.in(tablestring).emit('otherDown', {idx:0})
						this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:_zhuangjia.userId,sendCoin:_zhuangjia.upCoin,change_type:gameConfig.logflag})
					}
				}
				var tablestring  = "table" + i;
				this._io.sockets.in(tablestring).emit('changeBanker', {changeBankerTime:gameConfig.changeBankerTimeMax})
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

			log.info("登录服务器传来userId:" + userInfo._userId + " score:" + userInfo._score);
			this.userList[userInfo._userId].update(userInfo);
			log.info("更新后userId:" + this.userList[userInfo._userId]._userId + " score:" + this.userList[userInfo._userId]._score);
			
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
					result = {resultid:1,msg:'login 8da2server succeed!',Obj:resultObj};
					socketItem.emit('loginGameResult',result);
				})
			}else{
				var socketItem = this.userList[userInfo._userId]._socket;
				var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
				result = {resultid:1,msg:'login 8da2server succeed!',Obj:resultObj};
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
						this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableid,seatId:this.userList[_socket.userId].getSeat()})
						var tableid = this.userList[_socket.userId].getTable();
						//发送信息给其他人
						var tablestring  = "table" + tableid;
						_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
						log.info("用户离开!userid:" + this.userList[_socket.userId]._userId
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
			console.log(gameConfig.coinConfig)
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

		//对决
		this.vs = function(_socket,info){
			if (!this.userList[_socket.userId]){
				log.err(_socket.userId + '下庄,不存在');
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;

			if (tableid < 0){
				log.err(_socket.userId + '下庄,用户没有进入桌子');
				_socket.emit("vsResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}


			if (info.selectId < 0 || info.selectId > 2){
				log.err(_socket.userId + '选择下注对象错误' + info.selectId);
				_socket.emit("vsResult", {ResultCode:0,msg:"选择下注对象错误"});
				return;
			}

			var tableid = this.userList[_socket.userId].getTable();

			if (this.sever.state[tableid] != gameConfig.gameState.downTime){
				log.warn(_socket.userId + '现在不是对决时间');
				_socket.emit("vsResult", {ResultCode:0,msg:"现在不是下注时间"});
				return;
			}

			var zhuanglist = this.upUserList[tableid];

			//是否有人上庄
			if (zhuanglist.length <= 0){
				log.warn(_socket.userId + '对决无庄家');
				_socket.emit("vsResult", {ResultCode:0,msg:"无庄家"});
				return;
			}

			if (zhuanglist[0].userId == _socket.userId){
				log.warn(_socket.userId + '对决自己是庄家');
				_socket.emit("vsResult", {ResultCode:0,msg:"自己是庄家不能下注"});
				return;
			}

			//当前庄家已经被对决
			if (zhuanglist[0].vs){
				log.warn(_socket.userId + '当前庄家已经被对决');
				_socket.emit("vsResult", {ResultCode:0,msg:"当前庄家已经被对决"});
				return;
			}

			var zhuang = zhuanglist[0];
			var youScore = this.userList[_socket.userId].getScore();
			//扣掉自己的钱
			if (!this.userList[_socket.userId].downCoin(zhuang.upCoin)){
				log.info(_socket.userId + '金币不足无法对决' + "up:" + zhuang.upCoin + " myCoin:" + youScore);
				_socket.emit("vsResult", {ResultCode:0,msg:"金币不足无法对决"});
				return;
			}
			var youNowScore = this.userList[_socket.userId].getScore();
			
			zhuang.maxDownCoin = 0;
			//记录在什么门下下注多少
			var userInfo = {userid:_socket.userId,downCoin:zhuang.upCoin,meng:info.selectId};
			
			//先把别人的钱退回
			for (var userItem in this.downCoinList[tableid]){
				//查看每个项目下注情况
				var userWin = 0;
				var open2 = this.downCoinList[tableid][userItem][0];
				var open3 = this.downCoinList[tableid][userItem][1];
				var open4 = this.downCoinList[tableid][userItem][2];

				userWin = open2 + open3 + open4;

				if (this.userList[userItem]){
					var youScoreT = this.userList[userItem].getScore();
					this.userList[userItem].winscore(userWin);
					var youNowScoreT = this.userList[userItem].getScore();
					//记录金钱变化量
					var userInfolog = {userid:userItem,score_before:youScoreT,score_change:userWin,score_current:youNowScoreT,change_type:gameConfig.logflag,isOnline:true};
					this.score_changeLogList.push(userInfolog);
					//this.userList[userItem]._socket.emit("winResult",{winCoin:cunWin,remainCoin:youNowScore});
				}else{
					this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:userWin,change_type:gameConfig.logflag})
				}

				//删除记录
				delete this.downCoinList[tableid][userItem];
			}

			//结算数据存储
			this.downCoinList[tableid][_socket.userId] = [];
			this.downCoinList[tableid][_socket.userId][0] = 0;
			this.downCoinList[tableid][_socket.userId][1] = 0;
			this.downCoinList[tableid][_socket.userId][2] = 0;
			this.downCoinList[tableid][_socket.userId][info.selectId] = zhuang.upCoin;
			zhuang.vs = true;

			//做金钱记录
			var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:(-zhuang.upCoin),score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
			this.score_changeLogList.push(userInfolog);

			var tablestring  = "table" + tableid;

			this._io.sockets.in(tablestring).emit('vsResult', {Result:1,data:{userId:_socket.userId,userNickname:this.userList[_socket.userId]._nickname,selectId:info.selectId,vsCoin:zhuang.upCoin}});

			//_socket.emit("downCoinResult", {ResultCode:1,msg:"下注成功",selectId:info.selectId,downCoin:gameConfig.coinConfig[info.chips]});			
		}

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
			if (this.upUserList[tableid].length > 3){
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

			if (this.upUserList[tableid].length == 0){
				this.sever.reset(tableid);
			}

			var zhuangjia = {userId:_socket.userId,upCoin:info.Coin,maxDownCoin:info.Coin,nickname:this.userList[_socket.userId]._nickname,isDown:false,doCount:0,vs:false}
			this.upUserList[this.userList[_socket.userId].TableId].push(zhuangjia);

			//通知全桌人自己上庄
			var tableid = this.userList[_socket.userId].getTable();

			var tablestring  = "table" + tableid;

			_socket.broadcast.to(tablestring).emit('otherUp', {userNickname:this.userList[_socket.userId]._nickname,upCoin:info.Coin});

			_socket.emit("upResult", {ResultCode:1,msg:"成功申请上庄"});
		}

		//下庄
		this.down = function(_socket){
			if (!this.userList[_socket.userId]){
				log.err(_socket.userId + '下庄,不存在');
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;

			if (tableid < 0){
				log.err(_socket.userId + '下庄,用户没有进入桌子');
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
				log.warn(_socket.userId + '申请下庄不在上庄列表中');
				return;
			}

			if (idx == 0){
				//是当前庄,需要结算后退钱
				if (this.upUserList[tableid][idx].doCount >= 3){
					if (this.isChangeZhuang[tableid]){
						this.sever.reset(tableid);
						var _zhuangjia = this.upUserList[tableid].shift();

						if (this.upUserList[tableid].length > 0){
							this.sever.reset(tableid);
						}else{
							this.sever.stop(tableid);
						}
						
						var youScore = this.userList[_socket.userId].getScore();
						this.userList[_socket.userId].winscore(_zhuangjia.upCoin);
						var youNowScore = this.userList[_socket.userId].getScore();
						var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:_zhuangjia.upCoin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
						this.score_changeLogList.push(userInfolog);
						//通知别人
						var tablestring  = "table" + tableid;
						this.userList[_socket.userId]._socket.broadcast.to(tablestring).emit('otherDown', {idx:0});
						log.info(_socket.userId + '成功申请下庄,够3次,并在换庄时间!');
						this.userList[_socket.userId]._socket.emit("downResult", {ResultCode:1,msg:"下庄成功",upCoin:_zhuangjia.upCoin,idx:0});
					}else{
						if (this.upUserList[tableid][idx].doCount == 3 && this.sever.state <= gameConfig.gameState.changeZhuang){
							_socket.emit("downResult", {ResultCode:0,msg:"当庄还不够3次"});
							log.warn(_socket.userId + '当庄够3次,但不在时间');
						}else{
							this.upUserList[tableid][idx].isDown = true;
							log.info(_socket.userId + '成功申请下庄' + this.upUserList[tableid][idx].doCount);
							_socket.emit("downResult", {ResultCode:2,msg:"成功申请下庄"});
						}
					}
				}else{
					log.warn(_socket.userId + '当庄还不够3次 ' + this.upUserList[tableid][idx].doCount);
					_socket.emit("downResult", {ResultCode:0,msg:"当庄还不够3次"});
				}
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
					log.info(_socket.userId + '下庄时,用户已经不在服务器');
					//console.log("下庄时,用户已经不在服务器");
				}

				//通知全桌人自己下庄
				var tableid = this.userList[_socket.userId].getTable();

				var tablestring  = "table" + tableid;

				_socket.broadcast.to(tablestring).emit('otherDown', {idx:idx});

				log.info(_socket.userId + '不是当前庄,下庄成功');
				_socket.emit("downResult", {ResultCode:1,msg:"下庄成功",upCoin:zhuangjia.upCoin,idx:idx});
			}
		}

		//下注
		this.downCoin = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}

			if (this.userList[_socket.userId].TableId < 0){
				console.log("用户没有进入桌子");
				_socket.emit("downCoinResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			if (info.selectId < 0 || info.selectId > 2){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"选择下注对象错误"});
				return;
			}

			var tableid = this.userList[_socket.userId].getTable();

			if (this.sever.state[tableid] != gameConfig.gameState.downTime){
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
				_socket.emit("downCoinResult", {ResultCode:0,msg:"自己是庄家不能下注"});
				return;
			}

			var zhuang = zhuanglist[0];

			if (Math.floor(zhuang.maxDownCoin) < gameConfig.coinConfig[info.chips]){
				_socket.emit("downCoinResult", {ResultCode:-1,msg:"下注已经满"});
				return;
			}

			//当前庄家已经被对决
			if (zhuang.vs){
				log.warn(_socket.userId + '当前庄家已经被对决');
				_socket.emit("downCoinResult", {ResultCode:-2,msg:"当前庄家已经被对决"});
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
			if (!this.userList[_socket.userId].downCoin(gameConfig.coinConfig[info.chips])){
				_socket.emit("downCoinResult", {ResultCode:0,msg:"金币不足无法下注"});
				return;
			}
			var youNowScore = this.userList[_socket.userId].getScore();
			
			zhuang.maxDownCoin -= gameConfig.coinConfig[info.chips];
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
			var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:(-gameConfig.coinConfig[info.chips]),score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
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
			//console.log(this.lineOutList)
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
				_socket.emit("getDownTimeResult", {ResultCode:1,downTime:this.sever.getDownTime(tableid),upUserList:[],upCoin:0,DownCoin:[0,0,0],myDownCoin:[0,0,0],remainCardCount:0,changeBankerTime:0});
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
			//console.log(down1)
			//console.log(down2)
			//console.log(down3)

			var mydown1 = 0;
			var mydown2 = 0;
			var mydown3 = 0;
			if (this.downCoinList[tableid][_socket.userId]){
				mydown1 = this.downCoinList[tableid][_socket.userId][0];
				mydown2 = this.downCoinList[tableid][_socket.userId][1];
				mydown3 = this.downCoinList[tableid][_socket.userId][2];
			}
			//console.log(this.sever.getRemainCardCount(tableid))
			//每门下注额度
			_socket.emit("getDownTimeResult", {ResultCode:1,downTime:this.sever.getDownTime(tableid),upUserList:this.upUserList[tableid],upCoin:this.upUserList[tableid][0].upCoin,DownCoin:[down1,down2,down3],myDownCoin:[mydown1,mydown2,mydown3],remainCardCount:this.sever.getRemainCardCount(tableid),changeBankerTime:this.sever.changeBankerTime(tableid),card:this.openResult[tableid]});
		}

		this.sendEndTable = function(_flag,tableid){
			this.isSendEnd[tableid] = false;
			if (_flag && !gameConfig.maintain){
				//下注结束
				if (this.upUserList[tableid].length > 0){
					var tablestring  = "table" + tableid;
					this._io.sockets.in(tablestring).emit('downEnd', {})
				}
			}
		}

		this.sendBegin = function(_flag,tableid){
			
			this.isSendBegin[tableid] = false;
			if (_flag && !gameConfig.maintain){
				//准备开始
				console.log("发送开始")
				if (this.upUserList[tableid].length > 0){
					var tablestring  = "table" + tableid;
					this._io.sockets.in(tablestring).emit('downCoinBegin');
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

