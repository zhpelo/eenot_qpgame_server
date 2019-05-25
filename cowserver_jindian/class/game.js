var User = require("./../../CClass/class/User");
var gameDao = require("./gameDao");
var LoginGameDao = require("./../../CClass/dao/gameDao");
var sever = require("./sever");
var schedule = require("node-schedule");
//var gameConfig = require("./../config/gameConfig");
var urlencode = require('urlencode');
var fs = require('fs');
var log = require("./../../CClass/class/loginfo").getInstand;


var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化游戏
		this.init = function(_config){
			log.info('####init game!####')
			gameConfig = _config;
			console.log(gameConfig.bet);
			this.serverId = gameConfig.serverId;
			//初始化用户列表
			this.userList = {};
			//创建桌子 0位保存桌子状态
			this.tableList = new Array(gameConfig.tableMax);
			//创建座位
			for(var i = 0; i < this.tableList.length; ++i){
				this.tableList[i] = new Array(gameConfig.seatMax + 1);
			}



			//是否准备
			this.isSendBegin = [];
			//凑牛
			this.isCouCow = [];
			//是否发牌
			this.isSendCard = [];
			//是否发牌
			this.isSelectBet = [];
			//发金币
			this.isSendCoin = [];
			//开奖
			this.isOpen = [];
			//没事
			this.isNothing = [];

			//初始化上庄数据
			for(var i = 0 ; i < this.tableList.length ; i++){
				this.isSendBegin[i] = true;
				this.isCouCow[i] = true;
				this.isSendCard[i] = true;
				this.isSendCoin[i] = true;
				this.isOpen[i] = true;
				this.isSelectBet[i] = true;
				this.isNothing[i] = true;
				this.tableList[i][gameConfig.seatMax] = {};
				this.tableList[i][gameConfig.seatMax].play = 0;

				for(var j = 0 ;j < gameConfig.seatMax ; ++j){
					this.tableList[i][j] = {};
				}
			}
			

			//在线人数为0
			this.onlinePlayerCount = 0;

			//维护模式
			this.maintain = false;
			this._io = {};
			this.GameList = new Array();

			this.lineOutList = {};
			this.score_changeLogList = [];
			this.x = 10000;
			var self = this;
			this.matchId = 0;

			//获得比赛最大ID
			gameDao.getMatchId(gameConfig.serverId,function(_maxId){
				//初始化捕鱼
				self.matchId = _maxId + 1;
			})

			this.sever = new sever();
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
					log.info(gameConfig.maintainTime);
					if (!gameConfig.maintainTime){
						self.disconnectAllUser();
					}
				}

			self.score_changeLog();
			for(var z = 0 ; z < gameConfig.tableMax; z++){
				if (self.sever.state[z] == gameConfig.gameState.gameBegin){
					self.sendBegin(z);
				}else if(self.sever.state[z] == gameConfig.gameState.sendCardTime){
					self.sendCard(z);
				}else if(self.sever.state[z] == gameConfig.gameState.selectBet){
					self.selectBet(z);
				}else if(self.sever.state[z] == gameConfig.gameState.open){
					self.open(z);
				}else if(self.sever.state[z] == gameConfig.gameState.coucow){
					self.coucow(z);
				}else if(self.sever.state[z] == gameConfig.gameState.sendCoin){
					self.sendCoin(z);
				}else if(self.sever.state[z] == gameConfig.gameState.noting){
					self.noting(z);
				}
			}
			});
		}

		this.initTable = function(tableId){
			var tableObj = this.tableList[tableId];
			//初始化庄家信息
			tableObj[gameConfig.seatMax] = {seatId:-1,bet:-1,userId:-1,play:1,win:-1};
			tableObj[gameConfig.seatMax].cardList = new Array(gameConfig.seatMax);
			for(var i = 0 ; i < gameConfig.seatMax ; ++i){
				tableObj[gameConfig.seatMax].cardList[i] = [];
			}
			tableObj[gameConfig.seatMax].showList = [];
			for(var i = 0 ; i < tableObj.length - 1; ++i){
					tableObj[i] = {};
					tableObj[gameConfig.seatMax].showList[i] = -1;
			}
		}

		this.sendBegin = function(tableId){
			if (this.isSendBegin[tableId]){
				this.isSendBegin[tableId] = false;
				this.isNothing[tableId] = true;
				if (!gameConfig.maintain){

					//准备开始
					this.sever.initMajiang(tableId);
					var tablestring  = "table" + tableId;
					var tableState = [];
					var tableObj = this.tableList[tableId];
					for(var i = 0 ; i < tableObj.length - 1; ++i){
						if (tableObj[i] && tableObj[i].seatState == 1){
							//判断是否在线
							tableState[i] = 1;
						}else{
							tableState[i] = 0;
						}
					}

					this._io.sockets.in(tablestring).emit('readyPlay',{remainTime:gameConfig.readyPlayTime,tableState:tableState});
				}
			}
		}

		this.sendCard = function(tableId){
			if (this.isSendCard[tableId]){
				this.isSendCard[tableId] = false;

				var tablestring  = "table" + tableId;
								
				//分别发每给个人
				var tableObj = this.tableList[tableId];
				//tableObj[gameConfig.seatMax].cardList = new Array(gameConfig.seatMax);
				//标记是否已经展示过
				//tableObj[gameConfig.seatMax].showList = [];
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						//判断是否在线
						if (this.userList[tableObj[i].userId]){
							this.userList[tableObj[i].userId]._socket.emit('sendCard',{remainTime:gameConfig.callTime});
						}
					}else{
						var seatU = this.sever.getTablePlayerBySeatId(tableId,i);
						if (seatU && seatU != -1 && this.userList[seatU]){
							log.info("发送发牌" + seatU);
							this.userList[seatU]._socket.emit('sendCard',{remainTime:gameConfig.callTime});
						}
					}
				}

			}
		}

		this.selectBet = function(tableId){
			if (this.isSelectBet[tableId]){
				this.isSelectBet[tableId] = false;

				//先自动设置玩家抢庄倍数
				var tableObj = this.tableList[tableId];
				var maxBet = 0;
				var zhuangSeat = [];
				var tablestring  = "table" + tableId;
				//先检查最大值
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (tableObj[i].callValueId > -1){
							if (tableObj[i].callValueId > maxBet){
								maxBet = tableObj[i].callValueId;
							}
						}else{
							tableObj[i].callValueId = 0;
							this._io.sockets.in(tablestring).emit('callValueId',{seatId:i,callValueId:tableObj[i].callValueId});
						}
					}
				}

				//判断谁是庄
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (tableObj[i].callValueId == maxBet){
							maxBet = tableObj[i].callValueId;
							zhuangSeat.push(i);
						}
					}
				}

				var idx = Math.floor(Math.random() * zhuangSeat.length);
				var zhuangIdx = zhuangSeat[idx];

				//保存庄家
				tableObj[gameConfig.seatMax].userId = tableObj[zhuangIdx].userId;
				tableObj[gameConfig.seatMax].seatId = zhuangIdx;
				tableObj[gameConfig.seatMax].bet = maxBet;
				
				var selectMaxBet = 0;
					for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						//告诉玩家可以选择几倍
						if (tableObj[i].userId != tableObj[gameConfig.seatMax].userId){
							if (this.userList[tableObj[i].userId]){
								//判断是否在线
								for(var j = 3 ; j > 1 ; --j){
									if (this.userList[tableObj[i].userId].getScore() > (gameConfig.bet * 3 * maxBet * gameConfig.rebet[j])){
										selectMaxBet = j;
										break;
									}
								}
								this.userList[tableObj[i].userId]._socket.emit('selectBet',{bankerSeatId:zhuangIdx,selectMaxBet:selectMaxBet,remainTime:gameConfig.reCallTime});
							}
							
						}else{
							//判断是否在线
							if (this.userList[tableObj[i].userId]){
								this.userList[tableObj[i].userId]._socket.emit('selectBet',{bankerSeatId:zhuangIdx,selectMaxBet:-1,remainTime:gameConfig.reCallTime});
							}							
						}
					}else{
						var seatU = this.sever.getTablePlayerBySeatId(tableId,i);
						if (seatU && seatU != -1 && this.userList[seatU]){
							log.info("发送选倍" + seatU);
							this.userList[seatU]._socket.emit('selectBet',{bankerSeatId:zhuangIdx,selectMaxBet:-1,remainTime:gameConfig.reCallTime});
						}
					}
				}	
			}
		}

		this.coucow = function(tableId){
			if (this.isCouCow[tableId]){
				this.isCouCow[tableId] = false;

				var tablestring  = "table" + tableId;

				//自动设置选择倍率
				var tableObj = this.tableList[tableId];
				
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (tableObj[i].reCallValueId == -1 && tableObj[gameConfig.seatMax].seatId != i){
							tableObj[i].reCallValueId = 0;
							this._io.sockets.in(tablestring).emit('reCallValueId',{seatId:i,reCallValueId:tableObj[i].reCallValueId});
						}
					}
				}

				result = this.sever.getSendCard(tableId);
				log.info(result);

				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						//判断是否在线
						
						var card = [];
						for(var j = 0 ; j < 5 ; ++j){
							card[j] = result.card[(i * 5) + j];
						}
						tableObj[gameConfig.seatMax].cardList[i] = card;

						
						//算分
						var resultValue = this.sever.getValue(tableObj[gameConfig.seatMax].cardList[i]);
						if (this.userList[tableObj[i].userId]){
							this.userList[tableObj[i].userId]._socket.emit('couCow',{card:card,remainTime:gameConfig.selectBetTime,cowPoint:resultValue.point});
						}
					}else{
						var seatU = this.sever.getTablePlayerBySeatId(tableId,i);
						if (seatU && seatU != -1 && this.userList[seatU]){
							log.info("发送补牌" + seatU);
							this.userList[seatU]._socket.emit('couCow',{card:[],remainTime:gameConfig.selectBetTime,cowPoint:-1});
						}
					}
				}
			}
		}



		this.open = function(tableId){
			if (this.isOpen[tableId]){
				this.isOpen[tableId] = false;
				var tablestring  = "table" + tableId;
				//自动开牌倍率
				var tableObj = this.tableList[tableId];


				// tableObj = [
				// {
				// 	userId:2,
				// 	seatState:1,
				// 	callValueId:2,
				// 	reCallValueId:1,
				// 	win:0,
				// 	score:9511
				// },
				// {
				// 	userId:3,
				// 	seatState:1,
				// 	callValueId:3,
				// 	reCallValueId:2,
				// 	win:0,
				// 	score:5053
				// },
				// {
				// 	userId:4,
				// 	seatState:1,
				// 	callValueId:0,
				// 	reCallValueId:0,
				// 	win:0,
				// 	score:9903
				// },
				// {
				// 	userId:6,
				// 	seatState:1,
				// 	callValueId:0,
				// 	reCallValueId:1,
				// 	win:0,
				// 	score:5318
				// },
				// {
				// 	userId:5,
				// 	seatState:1,
				// 	callValueId:4,
				// 	reCallValueId:-1,
				// 	win:0,
				// 	score:8521
				// },
				// {
				// 	seatId:4,
				// 	bet:4,
				// 	userId:5,
				// 	play:1,
				// 	win:-1
				// },
				// ]

				// tableObj[5].showList = new Array();
				// tableObj[5].showList = [-1,-1,-1,-1,-1];

				// tableObj[5].cardList = new Array();
				// tableObj[5].cardList[0] = [7,2,3,5,10]; //牛一
				// tableObj[5].cardList[1] = [1,2,3,5,9];	//牛牛
				// tableObj[5].cardList[2] = [3,2,3,5,10];	//牛9
				// tableObj[5].cardList[3] = [1,2,3,5,10];	//牛2
				// tableObj[5].cardList[4] = [2,2,3,5,10];	//牛3

				var paijuMsg = tableObj[gameConfig.seatMax];
				var addList = [];
				var winList = [0,0,0,0,0];


				
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (paijuMsg.showList[i] == -1){
							var resultValue = this.sever.getValue(paijuMsg.cardList[i]);
							//log.info(resultValue);
							paijuMsg.showList[i] = resultValue.point;
							this._io.sockets.in(tablestring).emit('showResult',{Result:0,data:{cowPoint:resultValue.point,seatId:i,card:paijuMsg.cardList[i]}});
						}
					}
					for(var j = 0 ; j < 5; ++j){
						if (paijuMsg.cardList[i][j]){
							addList.push(paijuMsg.cardList[i][j]);
						}else{
							addList.push(0);
						}
					}
				}

				//通知每一个人全部输赢情况
				//每个人的输赢 庄家倍数 * 闲家选择倍数 * 游戏底倍 * 牌形倍数
				
				//初始化庄家输赢金额
				paijuMsg.win = 0;
				//庄家倍数
				var bet = gameConfig.callbet[paijuMsg.bet];
				var zhuangValue = this.sever.getValue(paijuMsg.cardList[paijuMsg.seatId]);
				//log.info(zhuangValue);
				var openMsg = [];
				var CoinLog = [];
				var zhuangTax = 0;
				
				//预算费用
				var pay = [];
				var tax = [];
				var total_win = 0;
				var total_lose = 0;
				var zhuangSeat = -1;
				var zhuangUse = 0;
				
				
				//不够，需要按比例分配
				//先判断,庄家赢多少
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (i != paijuMsg.seatId){
							
							//获得每一个选择倍数
							var iValue = this.sever.getValue(paijuMsg.cardList[i]);
							winbet = this.sever.getwin(zhuangValue,iValue);

							winList[i] = winbet;
							//winbet 牌型
							//bet 庄叫倍
							//gameConfig.bet 房间倍
							//玩家 叫倍
							tableObj[i].win = winbet * bet * gameConfig.bet * gameConfig.rebet[tableObj[i].reCallValueId];
							console.log( winbet + " " +  bet + " " + gameConfig.bet + " " + gameConfig.rebet[tableObj[i].reCallValueId])
							console.log("tableObj[i].win:" + tableObj[i].win);
							if (tableObj[i].win >= 0){
								//total_win += Math.floor(tableObj[i].win * gameConfig.tax);
								if (tableObj[i].win > tableObj[i].score){
									tableObj[i].win = tableObj[i].score;
								}

								total_win += tableObj[i].win;
								log.info("闲家赢");
							}else{
							 	//如果钱不够需要降低到玩家最低的钱
							 	log.info("闲家输");
							 	if (tableObj[i].score < -tableObj[i].win){
							 		tableObj[i].win = -tableObj[i].score;
							 	}
							 	tableObj[paijuMsg.seatId].win += -tableObj[i].win;
							 	console.log("****" + tableObj[i].win)
							 	total_lose += tableObj[i].win;

							}
						}
						else{
							zhuangSeat = i;
						}
					}
				}

				//再判断，庄家赢的 + 自身的钱，是否够赔
				if (zhuangSeat != -1){

					var fenqian = tableObj[zhuangSeat].score + tableObj[paijuMsg.seatId].win;
					//console.log("tableObj[zhuangSeat].score:" + tableObj[zhuangSeat].score)
					//console.log("tableObj[paijuMsg.seatId].win:" + tableObj[paijuMsg.seatId].win)
					if (fenqian >= total_win){
						log.info("庄家够钱付");
						//还有一种情况,庄家自己钱不够
						for(var i = 0 ; i < tableObj.length - 1; ++i){
							if (tableObj[i] && tableObj[i].seatState == 1){
								if (i != paijuMsg.seatId){
									if (tableObj[i].win >= 0){

										tax = tableObj[i].win - Math.floor(tableObj[i].win * gameConfig.tax);
							 			tableObj[paijuMsg.seatId].win -= tableObj[i].win;
							 			var useCoin = Math.abs(tableObj[i].win);
							 			zhuangUse += useCoin;
							 			tableObj[i].win = Math.floor(tableObj[i].win * gameConfig.tax);
								 		var logTemp = {userId:tableObj[i].userId,MatchId:this.matchId,callBet:bet,selectBet:gameConfig.rebet[tableObj[i].reCallValueId],severBet:gameConfig.bet,useCoin:useCoin,winCoin:tableObj[i].win,tax:tax,isBanker:0,serverId:gameConfig.serverId,tableId:tableId,gameId:gameConfig.gameId};
										CoinLog.push(logTemp);
										this.GameBalance(tableObj[i].userId,tableObj[i].win);
										openMsg.push({seatId:i,win:tableObj[i].win});
									}
								}
							}
						}
					}else{
						//不够钱
						log.info("庄家不够钱付");
						var meifen = fenqian / total_win;
						log.info("fenqian:"+ fenqian);
						log.info("total_win:"+ total_win);
						log.info("meifen:"+ meifen);
						tableObj[paijuMsg.seatId].win = -tableObj[zhuangSeat].score;
						for(var i = 0 ; i < tableObj.length - 1; ++i){
							if (tableObj[i] && tableObj[i].seatState == 1){
								if (i != paijuMsg.seatId){
									if (tableObj[i].win >= 0){
										log.info("tableObj[i].win1:" + tableObj[i].win);
										tableObj[i].win = Math.floor(tableObj[i].win * meifen);
										log.info("tableObj[i].win2:" + tableObj[i].win);
										tax = tableObj[i].win - Math.floor(tableObj[i].win * gameConfig.tax);
										var useCoin = Math.abs(tableObj[i].win);
										zhuangUse += useCoin;
							 			tableObj[i].win = Math.floor(tableObj[i].win * gameConfig.tax);
								 		var logTemp = {userId:tableObj[i].userId,MatchId:this.matchId,callBet:bet,selectBet:gameConfig.rebet[tableObj[i].reCallValueId],severBet:gameConfig.bet,useCoin:useCoin,winCoin:tableObj[i].win,tax:tax,isBanker:0,serverId:gameConfig.serverId,tableId:tableId,gameId:gameConfig.gameId};
										CoinLog.push(logTemp);
										this.GameBalance(tableObj[i].userId,tableObj[i].win);
										openMsg.push({seatId:i,win:tableObj[i].win});
									}
								}
							}
						}
					}
				}
				
				//牌局记录
				gameDao.addMatch(addList,winList,tableId,gameConfig.serverId);
				
				if (tableObj[paijuMsg.seatId].win > tableObj[zhuangSeat].score){
					console.log("庄家自己身上钱不够")
					var fenqian = tableObj[paijuMsg.seatId].win - tableObj[zhuangSeat].score;
					console.log(tableObj[paijuMsg.seatId].win + " " + tableObj[zhuangSeat].score + " " + fenqian + " " + total_lose);
					var meifen = fenqian / Math.abs(total_lose);
					for(var i = 0 ; i < tableObj.length - 1; ++i){
						if (tableObj[i] && tableObj[i].seatState == 1){
							if (i != paijuMsg.seatId){
								if (tableObj[i].win < 0){
								 	//console.log(tableObj[paijuMsg.seatId].win + " " + meifen + " " + fenqian + " " + total_lose);
								 	tableObj[i].win = Math.floor((Math.abs(tableObj[i].win) * meifen) + tableObj[i].win);
								 	zhuangUse += Math.abs(tableObj[i].win);
								 	var logTemp = {userId:tableObj[i].userId,MatchId:this.matchId,callBet:bet,selectBet:gameConfig.rebet[tableObj[i].reCallValueId],severBet:gameConfig.bet,useCoin:Math.abs(tableObj[i].win),winCoin:tableObj[i].win,tax:0,isBanker:0,serverId:gameConfig.serverId,tableId:tableId,gameId:gameConfig.gameId};
									CoinLog.push(logTemp);
									this.GameBalance(tableObj[i].userId,tableObj[i].win);
									openMsg.push({seatId:i,win:tableObj[i].win});
								}
							}
						}
					}
					tableObj[paijuMsg.seatId].win = tableObj[zhuangSeat].score;
				}else{
					for(var i = 0 ; i < tableObj.length - 1; ++i){
						if (tableObj[i] && tableObj[i].seatState == 1){
							if (i != paijuMsg.seatId){
								if (tableObj[i].win < 0){
								 	//tableObj[paijuMsg.seatId].win += -tableObj[i].win;
								 	
								 	zhuangUse += Math.abs(tableObj[i].win);
								 	var logTemp = {userId:tableObj[i].userId,MatchId:this.matchId,callBet:bet,selectBet:gameConfig.rebet[tableObj[i].reCallValueId],severBet:gameConfig.bet,useCoin:Math.abs(tableObj[i].win),winCoin:tableObj[i].win,tax:0,isBanker:0,serverId:gameConfig.serverId,tableId:tableId,gameId:gameConfig.gameId};
									CoinLog.push(logTemp);
									this.GameBalance(tableObj[i].userId,tableObj[i].win);
									openMsg.push({seatId:i,win:tableObj[i].win});
								}
							}
						}
					}
				}


				if (tableObj[paijuMsg.seatId].win > 0){
					var yuan_zhuang = tableObj[paijuMsg.seatId].win;
					tableObj[paijuMsg.seatId].win = Math.floor(tableObj[paijuMsg.seatId].win * gameConfig.tax);
					zhuangTax = yuan_zhuang - tableObj[paijuMsg.seatId].win;
				}

				//tableObj[i] 闲赢
				//tableObj[paijuMsg.seatId] 庄赢
				
				//this.CheckJieSuan(winList,tableObj,paijuMsg.seatId);

				//结算
				var logTemp = {userId:paijuMsg.userId,MatchId:this.matchId,callBet:bet,selectBet:0,severBet:gameConfig.bet,useCoin:zhuangUse,winCoin:tableObj[paijuMsg.seatId].win,tax:zhuangTax,isBanker:1,serverId:gameConfig.serverId,tableId:tableId,gameId:gameConfig.gameId};
				CoinLog.push(logTemp);

				this.GameBalance(tableObj[paijuMsg.seatId].userId,tableObj[paijuMsg.seatId].win);
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
				var openMsgItem = {seatId:paijuMsg.seatId,win:tableObj[paijuMsg.seatId].win};
				openMsg.push(openMsgItem);

				this._io.sockets.in(tablestring).emit('open',{openMsg:openMsg});
				
			}
		}

		this.GameBalance = function(userItem,userWin){
			//判断玩家是否在线
			if (this.userList[userItem]){
				var youScore = this.userList[userItem].getScore();
				this.userList[userItem].winscore(userWin);
				var youNowScore = this.userList[userItem].getScore();
				//记录金钱变化量
				var userInfolog = {userid:userItem,score_before:youScore,score_change:userWin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
				this.score_changeLogList.push(userInfolog);
				//this.userList[userItem]._socket.emit("winResult",{winCoin:cunWin,remainCoin:youNowScore});
			}else{
				this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:userWin,change_type:gameConfig.logflag})
			}
		}

		this.sendCoin = function(tableId){
			if (this.isSendCoin[tableId]){
				this.isSendCoin[tableId] = false;

				var tablestring  = "table" + tableId;
				this.initTable(tableId);
				//把桌子状态设置为准备
				var tableObj = this.tableList[tableId];

				tableObj[gameConfig.seatMax].play = 0;
				log.info("*******************");
				//清除掉线
				this.cleanLineOutByTable(tableId);
				
			}
		}

		this.noting = function(tableId){
			if (this.isNothing[tableId]){
				this.isNothing[tableId] = false;
				this.isSendBegin[tableId] = true;
				this.isSendCard[tableId] = true;
				this.isSelectBet[tableId] = true;
				this.isCouCow[tableId] = true;
				this.isOpen[tableId] = true;
				this.isSendCoin[tableId] = true;

				//把桌子状态设置为准备
				var tableObj = this.tableList[tableId];


				this.matchId++;
				//tableObj[gameConfig.seatMax].play = 0;

				//清除掉线
				// this.cleanLineOut();

				//先检查分数
				this.checkScore(tableId);

				//再检查准备、并报名
				this.checkReady(tableId);

			}
		}

		this.setIo = function(_io,_Csocket){
			this.sever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
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
			
			var socketItem = this.userList[userInfo._userId]._socket;
			var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
			result = {resultid:1,msg:'login '+gameConfig.gameName+' succeed!',Obj:resultObj};
			socketItem.emit('loginGameResult',result);
		}

		this.ready = function(_socket) {
			if (!this.userList[_socket.userId]){
				log.err("用户" + _socket.userId + "不存在");
				_socket.emit("readyResult", {ResultCode:1,msg:"errcode:ready1,请重新进入游戏"});
				return;
			}

			if (this.userList[_socket.userId].tableId < 0){
				log.err(_socket.userId + "用户没有进入桌子,进行准备");
				_socket.emit("readyResult", {ResultCode:2,msg:"errcode:ready2,请重新进入游戏"});
				return;
			}

			//当前桌子在游戏中,无需准备
			//给桌子添加数据
			var tableId = this.userList[_socket.userId].getTable();
			var seatId = this.userList[_socket.userId].getSeat();
			var tableObj = this.tableList[tableId];
			if (this.sever.state[tableId] != gameConfig.gameState.noting){
				log.warn(_socket.userId + '现在等待时间');
				_socket.emit("readyResult", {ResultCode:4,msg:"不在等待时间,进行了准备按钮!"});
				return;
			}

			log.info(_socket.userId + "准备");
		}

		this.AutoReady = function(_userId) {
			// if (!this.userList[_userId]){
			// 	log.err("自动准备用户" + _userId + "不存在");
			// 	return;
			// }

			// if (this.userList[_userId].tableId < 0){
			// 	log.err(_userId + "自动准备用户没有进入桌子,进行准备");
			// 	return;
			// }
			log.info("自动准备" + _userId);
			//当前桌子在游戏中,无需准备
			//给桌子添加数据
			var tableId = this.userList[_userId].getTable();
			var seatId = this.userList[_userId].getSeat();
			var tableObj = this.tableList[tableId];
			var url = "";
			if (this.userList[_userId]._headimgurl){
				url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);
			}
			
			var userInfo = {userId:_userId,seatState:1,callValueId:-1,reCallValueId:-1,win:0,score:this.userList[_userId]._score,url:url,nickname:this.userList[_userId]._nickname};
			this.tableList[tableId][seatId] = userInfo;
		}

		//获得人数,如果人数大于2
		this.checkReady = function(_tableId){
			var tableObj = this.tableList[_tableId];

			if (this.sever.state[_tableId] != gameConfig.gameState.noting){
				return;
			}
			
			if (!tableObj[gameConfig.seatMax] || tableObj[gameConfig.seatMax].play == 0){
				var playerList = this.sever.getTablePlayers(_tableId);
				//log.info(playerList);
				var onlineP = 0;
				for(var i = 0 ; i < playerList.length; ++i){
					if (this.userList[playerList[i]]){
						++onlineP;
					}
				}

				if (onlineP >= 2){
					//把桌子上的所有人状态设置
					log.info("够人" + onlineP)
					this.initTable(_tableId);
					log.info(playerList.length)
					for(var i = 0 ; i < playerList.length; ++i){
						this.AutoReady(playerList[i]);
					}

					this.sever.reset(_tableId);
				}else{
					this.sever.stop(_tableId);
				}
			}
		}

		this.show = function(_socket){
			if (!this.userList[_socket.userId]){
				log.err("用户" + _socket.userId + "不存在");
				_socket.emit("showResult", {ResultCode:1,msg:"errcode:show1,请重新进入游戏"});
				return;
			}

			if (this.userList[_socket.userId].tableId < 0){
				log.err(_socket.userId + "用户没有进入桌子,进行准备");
				_socket.emit("showResult", {ResultCode:2,msg:"errcode:show2,请重新进入游戏"});
				return;
			}

			var tableId = this.userList[_socket.userId].getTable();
			var seatId = this.userList[_socket.userId].getSeat();
			var tableObj = this.tableList[tableId];

			if (this.sever.state[tableId] != gameConfig.gameState.coucow){
				log.warn(_socket.userId + '现在不是凑牛时间');
				_socket.emit("showResult", {ResultCode:3,msg:"不在凑牛时间,使用了凑牛按钮!"});
				return;
			}


			var resultValue = this.sever.getValue(tableObj[gameConfig.seatMax].cardList[seatId]);
			tableObj[gameConfig.seatMax].showList[seatId] = resultValue.point;
			var tablestring  = "table" + tableId;
			this._io.sockets.in(tablestring).emit('showResult',{Result:0,data:{seatId:seatId,cowPoint:resultValue.point,card:tableObj[gameConfig.seatMax].cardList[seatId]}});
			
			console.log(tableObj[gameConfig.seatMax].cardList);
			var allshow = true;
			for(var i = 0  ; i < tableObj[gameConfig.seatMax].cardList.length ; ++i){
				if (tableObj[gameConfig.seatMax].cardList[i].length == 5){
					if (tableObj[gameConfig.seatMax].showList[i] == -1){
						allshow = false;
						break;
					}
				}
			}

			if (allshow){
				this.sever.next(tableId);
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
				//LoginGameDao.score_changeLog(saveListTemp);
			}
		}

		//删除用户
		this.deleteUser = function(_socket){
			if (_socket.userId && this.userList[_socket.userId]){
				//判断是否还有牌局在继续
				var tableId = this.userList[_socket.userId].getTable();
				if (tableId >= 0){
					//判断自己是否在游戏当中
					var tableObj = this.tableList[tableId];
					var onlineP = false;
					for(var i = 0 ; i < tableObj.length - 1; ++i){
						if (tableObj[i] && tableObj[i].seatState == 1){
							if (tableObj[i].userId == _socket.userId){
								onlineP = true;
								break;
							}
						}
					}
					if (onlineP){
						//当前局有下注
						this.sever.lineOut(this.userList[_socket.userId],_socket);
						//通知登录服务器
						//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:1,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableId,seatId:this.userList[_socket.userId].getSeat()})
						this.lineOutSet({state:1,userId:_socket.userId,tableId:this.userList[_socket.userId].getTable(),seatId:this.userList[_socket.userId].getSeat()});
						log.info("用户" + this.userList[_socket.userId]._userId + "断线");
						delete this.userList[_socket.userId];
					}else{
						var tableId = this.userList[_socket.userId].getTable();
					 	//发送信息给其他人
						var tablestring  = "table" + tableId;
					 	_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
					 	this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableId,seatId:this.userList[_socket.userId].getSeat()})
						log.info("用户离开!userid:" + this.userList[_socket.userId]._userId
							+ " Account:" + this.userList[_socket.userId]._account
							+ " score:" + this.userList[_socket.userId]._score);
						this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
						delete this.userList[_socket.userId];
						--this.onlinePlayerCount;
					}
				}else{
					log.info("用户没有登录桌子离开!:" + this.userList[_socket.userId]._userId);
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
				log.info("查询在线,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//log.info("查询在线,未找到" + _userId + "用户");
				return 1;
			}else{
				return 0;
			}
		}

		//获得用户当前分数
		this.getPlayerScore = function(_userId){
			if (!_userId){	//传输ID错误
				log.info("查询分数,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//log.info("查询在线,未找到" + _userId + "用户");
				return this.userList[_userId].getScore();
			}else{
				return -1;
			}
		}

		//GM加分
		this.addgold = function(_userId,score){
			if (!_userId){					//传输ID错误
				log.info("加分,未登录")
				return 0;
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				log.info("加分,未登录")
				return 0
			}else{
				log.info(score)
				if (this.userList[_userId].addgold(score)){
					log.info(this.userList[_userId].getScore())
					log.info("加分成功!")
					var tablestring = "table" + this.userList[_userId].getTable();
					this._io.sockets.in(tablestring).emit('addgoldResult',{userId:_userId,userSeatId:this.userList[_userId].getSeat(),userScore:this.userList[_userId]._score})
					return 1;
				}else{
					log.info("减分失败,大于用户分数!");
					return 0;
				}
			}
		}


		//进入游戏
		this.LoginGame = function(_userId,gametype){
			if (!this.userList[_userId]) return;
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
				log.info("用户" + _userId + ",没有进入任何游戏,进入房间")
				return;
			}

			if(this.userList[_userId].getSeat() != -1){
				log.info("用户" + _userId + "已经有座位");
				return;
			}
				
			this.userList[_userId].loginRoom(roomid);
			var LoginResult;
			var linemsg = this.getLineOutMsg(_userId);
			if (linemsg.Result){
				log.info("断线重连接table:" + linemsg.tableId +" seatid:" + linemsg.seatId);
				LoginResult = this.sever.LoginRoombyLineOut(this.getUser(_userId),_socket,linemsg.tableId,linemsg.seatId);
				this.lineOutSet({state:0,userId:_userId});
			}else{
				LoginResult = this.sever.LoginRoom(this.getUser(_userId),_socket);
			}
			//进入房间后，帮分配座位


			//发送场景消息
			//检查自己下注情况,效准玩家金额
			var addgold = 0;

			//进入房间自动准备
			
			this.checkReady(LoginResult.tableId);
			
			
			var ResultData = {tableId:LoginResult.tableId,seatId:LoginResult.seatId}
			_socket.emit("LoginRoomResult", {ResultCode:1,ResultData:ResultData});

			if (!linemsg.Result){
				var tablestring  = "table" + LoginResult.tableId;
				var url = 0;
				if (this.userList[_userId]._headimgurl){
					url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);	
				}
				_socket.broadcast.to(tablestring).emit('playEnter', {ResultCode:1,ResultData:{userId:_userId,tableId:LoginResult.tableId,seatId:LoginResult.seatId,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score,headimgurl:url,userType:this.userList[_userId]._Robot}});
			}


			log.info("登录进来桌子id:" + LoginResult.tableId);
			log.info("登录进来座位id:" + LoginResult.seatId);
		}

		this.getTableList = function(_userId,_socket){
			if (!this.userList[_userId]) return;

			
			if (!this.userList[_userId].getGameId()){
				log.info("用户" + _userId + ",没有进入任何游戏,进入房间")
				return;
			}

			var seatId = this.userList[_userId].getSeat()

			if(seatId == -1){
				log.info("用户" + _userId + "没有座位");
				return;
			}

			var tableId = this.userList[_userId].getTable()

			if(tableId == -1){
				log.info("用户" + _userId + "没有桌子");
				return;
			}

			var tableUserList = Array();

			for(var i = 0 ; i < this.sever.seatMax; i++){
				//除了自己以外
				if (this.sever.tableList[tableId][i] && this.sever.tableList[tableId][i] != _userId){
					var userItem = {};
					var userid = this.sever.tableList[tableId][i];
					
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
					}else{
						//在断线列表中
						log.info("在断线列表中");
						if (this.tableList[tableId][i]){
							//桌子有玩家ID
							log.info("桌子有玩家ID");
							//但桌子没有信息中没有玩家
							log.info(this.tableList[tableId][i]);
							userItem.userId = this.tableList[tableId][i].userId;
							userItem.seatId = i;
							userItem.nickname = this.tableList[tableId][i].nickname;
							userItem.score = this.tableList[tableId][i].score;
							userItem.userType = 0;
							userItem.headimgurl = this.tableList[tableId][i].url;
							tableUserList.push(userItem);
						}
					}
				}
			}

			_socket.emit("getTableListResult", {ResultCode:0,data:{tableList:tableUserList}});
		}

		//抢庄
		this.call = function(info,_socket){
			if (!this.userList[_socket.userId]){
				_socket.emit("callResult",{Result:1,data:{msg:"您已断线,请重新进入游戏"}})
				log.warn("用户" + _socket.userId + "已经掉线");
				return;
			}

			var tableId = this.userList[_socket.userId].getTable();
			var seatid = this.userList[_socket.userId].getSeat();

			if (this.sever.state[tableId] != gameConfig.gameState.sendCardTime){
				log.warn(_socket.userId + '现在不是抢庄时间');
				_socket.emit("callResult", {ResultCode:4,msg:"不在抢庄时间,使用了抢庄按钮!"});
				return;
			}

			//判断是否在游戏中
			var tableObj = this.tableList[tableId];
			if (!(tableObj[seatid] && tableObj[seatid].seatState == 1 && tableObj[seatid].userId == _socket.userId)){
				_socket.emit("callResult",{Result:2,data:{msg:"call错误!"}})
				log.warn("用户" + _socket.userId + "不在游戏中,使用了抢庄按钮!");
				return;
			}

			if (tableObj[seatid].callValueId >= 0){
				_socket.emit("callResult",{Result:2,data:{msg:"已经抢过庄了!"}});
				log.warn("用户" + _socket.userId + "已经抢过庄了,再次使用抢庄按钮!");
				return;
			}

			if (info.callValueId > 4 || info.callValueId < 0){
				_socket.emit("callResult",{Result:3,data:{msg:"抢庄倍数出错!"}});
				log.warn("用户" + _socket.userId + "抢庄倍数ID出错");
				return;
			}

			tableObj[seatid].callValueId = info.callValueId;

			_socket.emit("callResult", {ResultCode:0,data:{msg:"抢庄成功!"}});

			var tablestring  = "table" + tableId;
			this._io.sockets.in(tablestring).emit('callValueId',{seatId:seatid,callValueId:tableObj[seatid].callValueId});
		}

		//闲家选择倍率
		this.reCall = function(info,_socket){

			log.info(info);
			if (!this.userList[_socket.userId]){
				_socket.emit("reCallResult",{Result:1,data:{msg:"您已断线,请重新进入游戏"}})
				log.warn("用户" + _socket.userId + "已经掉线");
				return;
			}

			var tableId = this.userList[_socket.userId].getTable();
			var seatid = this.userList[_socket.userId].getSeat();

			if (this.sever.state[tableId] != gameConfig.gameState.selectBet){
				log.warn(_socket.userId + '现在不是抢庄时间');
				_socket.emit("reCallResult", {ResultCode:4,msg:"不在选择倍率时间,使用了选择倍率按钮!"});
				return;
			}

			//判断是否在游戏中
			var tableObj = this.tableList[tableId];
			if (!(tableObj[seatid] && tableObj[seatid].seatState == 1 && tableObj[seatid].userId == _socket.userId)){
				_socket.emit("reCallResult",{Result:2,data:{msg:"call错误!"}})
				log.warn("用户" + _socket.userId + "不在游戏中,使用了选择倍率按钮!");
				return;
			}

			if (tableObj[seatid].reCallValueId >= 0){
				_socket.emit("reCallResult",{Result:2,data:{msg:"已经选择倍率了!"}})
				log.warn("用户" + _socket.userId + "已经选择倍率了,再次使用选择倍率按钮!");
				return;
			}


			if ((!info.reCallValueId && info.reCallValueId != 0) || info.reCallValueId > 4 || info.reCallValueId < 0){
				_socket.emit("reCallResult",{Result:3,data:{msg:"选择倍率出错!"}})
				log.warn("用户" + _socket.userId + "选择倍率ID出错!");
				return;
			}

			//自己是庄家不需要选择
			//log.info(tableObj[seatid].userId)
			//log.info(tableObj[gameConfig.seatMax].userId)
			if (tableObj[seatid].userId == tableObj[gameConfig.seatMax].userId){
				_socket.emit("reCallResult",{Result:4,data:{msg:"自己是庄家不需要选择倍率!"}})
				log.warn("用户" + _socket.userId + "自己是庄家不需要选择倍率!");
				return;
			}

			tableObj[seatid].reCallValueId = info.reCallValueId;

			_socket.emit("reCallResult", {ResultCode:0,data:{msg:"选择倍率成功!"}});
			
			var tablestring  = "table" + tableId;
			this._io.sockets.in(tablestring).emit('reCallValueId',{seatId:seatid,reCallValueId:tableObj[seatid].reCallValueId});
		}

		this.checkScore = function(tableId){
			//判断座位上的在线的人
			var playerList = this.sever.getTablePlayers(tableId);
			//log.info(playerList);
			for(var i = 0 ; i < playerList.length; ++i){
				//log.info()
				this.notEnouhtScore(playerList[i]);
			}
		}

		this.notEnouhtScore = function(_userId){
			if (!this.userList[_userId]){
				log.err("检查用户金币用户" + _userId + "不存在");
				return;
			}
			if (this.userList[_userId].getScore() < gameConfig.autoOut){
				this.userList[_userId]._socket.emit('notEnouhtScore');
				this.userList[_userId]._socket.disconnect();
			}
		}


		//断线保存
		this.lineOutSet = function(_info){
			if (_info.state == 1){
				//添加
				this.lineOutList[_info.userId] = {tableId:_info.tableId,seatId:_info.seatId}
				//log.info(this.lineOutList[_info.userId]);
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
			//log.info(this.lineOutList)
			for(var Item in this.lineOutList){

				Item = parseInt(Item)
				var tableId = this.lineOutList[Item].tableId;
				var tablestring  = "table" + tableId;
                this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
				this.sever.cleanLineOut(tableId,this.lineOutList[Item].seatId)
				this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item})
			}
			this.lineOutList = {};
		}


		//清楚断线桌子断线用户
		this.cleanLineOutByTable = function(_tableId){
			//清理登录服务器
			log.info("清理掉线")
			for(var Item in this.lineOutList){
				Item = parseInt(Item);
				var tableId = this.lineOutList[Item].tableId;
				if (_tableId == tableId){
					var tablestring  = "table" + tableId;
                	this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
					this.sever.cleanLineOut(tableId,this.lineOutList[Item].seatId)
					this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item});
					delete this.lineOutList[Item];
				}
			}
		}

		this.getDownTime = function(_socket){
			if (!this.userList[_socket.userId]){
				return;
			}

			var tableId = this.userList[_socket.userId].getTable();
			var seatId = this.userList[_socket.userId].getSeat();
			if (tableId < 0){
				_socket.emit("getDownTimeResult", {ResultCode:1,msg:"用户没有进入桌子"});
				return;
			}

			var tableObj = this.tableList[tableId];

			//判断是否游戏已经开始
			var gamePlay = this.tableList[tableId].play;
			
			//判断自己是否在游戏当中
			var onlineP = false;
			if (gamePlay){
				for(var i = 0 ; i < tableObj.length - 1; ++i){
					if (tableObj[i] && tableObj[i].seatState == 1){
						if (tableObj[i].userId == _socket.userId){
							onlineP = true;
							break;
						}
					}
				}
			}

			var tableTemp = JSON.parse(JSON.stringify(tableObj));
			
			if (this.sever.state[tableId] > -1){
				log.info(this.sever.state[tableId]);
				if (this.sever.state[tableId] == gameConfig.gameState.gameBegin && !this.isSendBegin[tableId]){
					//情况1:
					//准备开始只获得剩下秒数
					//_socket.emit("readyPlay", {remainTime:this.sever.getReadyPlayTime(tableId)});
					_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getReadyPlayTime(tableId),selectMaxBet:-1,state:gameConfig.gameState.gameBegin}});
					return;
				}else if(this.sever.state[tableId] == gameConfig.gameState.sendCardTime && !this.isSendCard[tableId]){
					//情况2:
					//牌已经发出,才进入游戏
					//去掉别人的牌
					for(var i = 0; i < gameConfig.seatMax ; ++i){
						if (i == seatId){
							
						}else{
							tableTemp[tableTemp.length -1].cardList[i] = [];
						}
					}
					_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getCallTime(tableId),selectMaxBet:-1,state:gameConfig.gameState.sendCardTime}});
					return;
				}else if(this.sever.state[tableId] == gameConfig.gameState.selectBet){
					//情况3:
					//去掉别人的牌
					for(var i = 0; i < gameConfig.seatMax ; ++i){
						if (i == seatId){
							
						}else{
							tableTemp[tableTemp.length -1].cardList[i] = [];
						}
					}
					//闲家选被数
					if (onlineP){
						var selectMaxBet = 0;
						if (tableTemp[gameConfig.seatMax].userId == _socket.userId){
							//自己是庄家
							_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getReCallTime(tableId),selectMaxBet:-1,state:gameConfig.gameState.selectBet}});
						}else{
							//自己是闲家
							for(var j = 3 ; j > 1 ; --j){
								if (this.userList[_socket.userId].getScore() > (gameConfig.bet * 3 * tableTemp[gameConfig.seatMax].bet * gameConfig.rebet[j])){
									selectMaxBet = j;
									break;
								}
							}
							_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getReCallTime(tableId),selectMaxBet:selectMaxBet,state:gameConfig.gameState.selectBet}});
						}
					}else{
						_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getReCallTime(tableId),selectMaxBet:-1,state:gameConfig.gameState.selectBet}});
					}

					return;
				}else if(this.sever.state[tableId] == gameConfig.gameState.coucow){
					//情况4:
					//手上有5张牌,凑牛
					// var showList = [];
					// for(var i = 0; i < gameConfig.seatMax ; ++i){
					// 	if (i == seatId){
					// 		log.info(tableTemp)
					// 		//log.info("i" + seatId)
					// 		if (tableTemp[gameConfig.seatMax].cardList[i].length == 5){
					// 			var resultValue = this.sever.getValue(tableTemp[gameConfig.seatMax].cardList[i]);
					// 			showList[i] = resultValue.point;
					// 		}						
					// 	}else if (tableTemp[tableTemp.length -1].showList[i] != -1){
					// 		if (tableTemp[gameConfig.seatMax].cardList[i].length == 5){
					// 			var resultValue = this.sever.getValue(tableTemp[gameConfig.seatMax].cardList[i]);
					// 			showList[i] = resultValue.point;
					// 		}
					// 	}else{
					// 		tableTemp[tableTemp.length -1].cardList[i] = [];
					// 	}
					// }

					// console.log(showList);
					//首先
					//自己的牌一定有
					//如果别人已经show了,就会有他的扑克牌，并与点数
					//是否已经show了
					var point = -1;
					if (tableTemp[gameConfig.seatMax].cardList[seatId].length == 5){
						var resultValue = this.sever.getValue(tableTemp[gameConfig.seatMax].cardList[seatId]);
						point = resultValue.point;
					}

					_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:this.sever.getSelectBetTime(tableId),selectMaxBet:-1,state:gameConfig.gameState.coucow,my_point:point}});
					return;
				}
			}

			tableTemp[gameConfig.seatMax] = {seatId:-1,bet:-1,userId:-1,play:1,win:-1};
			tableTemp[gameConfig.seatMax].cardList = new Array(gameConfig.seatMax);
			for(var i = 0 ; i < gameConfig.seatMax ; ++i){
				tableTemp[gameConfig.seatMax].cardList[i] = [];
			}
			tableTemp[gameConfig.seatMax].showList = [];
			_socket.emit("getDownTimeResult", {ResultCode:0,data:{tableState:tableTemp,remainTime:-1,selectMaxBet:-1,state:gameConfig.gameState.noting}});		

		}


		this.disconnectAllUser = function(){
			for(var itme in this.userList){
				this.userList[itme]._socket.disconnect();
			}
			log.info("服务器开启维护，已经全部离线");
		}

		this.getx = function(_socket){
			var tableId = this.userList[_socket.userId].tableId;
			var zhuangjia = this.upUserList[tableId][0];
			if (zhuangjia && zhuangjia.userId > 1800){
				_socket.emit("getx", {Result:1,data:this.sever.getx()});
			}else{
				_socket.emit("getx", {Result:0});
			}
		}

		this.setx = function(count){
			if (count){
				this.x = count;
				log.info("x打开" + count);
			}else{
				log.info("x关闭");
				this.x = count;
				
			}
		}

		this.Setmaintain = function(){
			gameConfig.maintain = true;
		}

		this.isMaintain = function(){
			return gameConfig.maintain;
		}
		//运行初始化
		//this.init();
	}


	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		log.info("####create game!####");
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()


module.exports = GameInfo;

