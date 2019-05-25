var User = require("./User");
var dao = require("./../dao/dao");
var crypto = require('crypto');
var fs = require('fs');
var ServerInfo = require('./../config/ServerInfo').getInstand;
var activityConfig = require('./../config/activityConfig');
var Post = require('./post');
var urlencode = require('urlencode');
var schedule = require("node-schedule");
var log = require("./loginfo").getInstand;
var async = require('async'); 
var updateConfig = require('./updateConfig').getInstand;
var RobotConfig = require('./../config/RobotConfig');
var ml_api = require('./ml_api');


var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化游戏
		this.init = function(){

			//初始化用户列表
			this.userList = {};
			//在线人数为0
			this.onlinePlayerCount = 0;
			//统计
			this.winTotal = 0;
			//维护模式
			this.maintain = false;

			this._loginList = [];

			this.gameRank = {};

			this.tempuserList = {};

			this.score_changeLogList = [];

			this.sendApiList = [];
			//var self = this;
			this.lineOutList = {};

			this.checkNo = {};

			this.test = false;
			
			this.todayId = 0;
		};

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
		this.addUser = function(userInfo,socket,callback_a){
			log.info("添加用户:" + userInfo.Id);

			var newDate = new Date();
			var key = "slezz;e3";
			var md5 = crypto.createHash('md5');
			var content = userInfo.Id + userInfo.score + newDate + key;
			var sign = md5.digest('hex');
			userInfo.sign = sign;

			//在没有添加用户之前找到道具列表
			var self = this;
			//console.log(userInfo);
			async.waterfall([
				//callback到最后
				function(callback){

					dao.getPropByUserId(userInfo.Id,function(result,row){
						log.info(userInfo.Id + "获取道具");
						if (result){
							var proplist = {};
							for(var i = 0; i < row.length; i++){
								proplist[row[i].propid] = row[i].propcount;
							}
							userInfo.propList = proplist;
						}else{
							userInfo.propList = {};
						}

						self.userList[userInfo.Id] = new User(userInfo,socket);
						var url = 0;
						if (self.userList[userInfo.Id]._headimgurl){
							url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(self.userList[userInfo.Id]._headimgurl);
						}
						var resultObj = {account:self.userList[userInfo.Id]._account,
							id:self.userList[userInfo.Id]._userId,
							nickname:self.userList[userInfo.Id]._nickname,
							score:self.userList[userInfo.Id]._score,
							sign:self.userList[userInfo.Id]._sign,
							proplist:self.userList[userInfo.Id]._proList,
							headimgurl:url,
							diamond:self.userList[userInfo.Id]._diamond,
							giftTicket:self.userList[userInfo.Id]._giftTicket,
							phoneNo:self.userList[userInfo.Id]._phoneNo,
							official:self.userList[userInfo.Id]._official};
						result = {resultid:1,msg:'login succeed!',Obj:resultObj};
						callback(null,result);
					})
			},
			function(result, callback){//读取重要数据
				log.info(userInfo.Id + "金币");
				dao.getScore(userInfo.Id,function(Result,rows){
					//console.log(Result)
					if (Result){
						self.userList[userInfo.Id]._diamond = rows.diamond;
						self.userList[userInfo.Id]._giftTicket = rows.giftTicket;
						self.userList[userInfo.Id]._score = rows.score;
						result.Obj.score = rows.score;
						result.Obj.diamond = rows.diamond;
						result.Obj.giftTicket = rows.giftTicket;
						callback(null,result);
					}
				})
				
			},
			function(result, callback){
				log.info(userInfo.Id + "添加金币");
				dao.LoginaddTempScore(userInfo.Id,function(Result,rows){
					if (Result){
						for(var i = 0 ;i < rows.length ; ++i){
							var youScore = self.userList[userInfo.Id]._score;
							self.userList[userInfo.Id]._score += rows[i].score;
							result.Obj.score += rows[i].score;
							var youNowScore = self.userList[userInfo.Id]._score;

							var userInfolog = {userid:userInfo.Id,score_before:youScore,score_change:rows[i].score,score_current:youNowScore,change_type:rows[i].change_type,isOnline:false};
							self.score_changeLogList.push(userInfolog);
						}
					}
					callback(null,result);
					//callback(result);
				});
			},
			function(result, callback){
				log.info(userInfo.Id + "东山再起");
				if (self.userList[userInfo.Id]._score < 50){
					dao.dongshanzaiqi(userInfo.Id,function(Result,k){
						if (k){
							var youScore = self.userList[userInfo.Id]._score;
							self.userList[userInfo.Id]._score += 50;
							result.Obj.score += 50;
							var youNowScore = self.userList[userInfo.Id]._score;
							var userInfolog = {userid:userInfo.Id,score_before:youScore,score_change:50,score_current:youNowScore,change_type:7,isOnline:false};
							self.score_changeLogList.push(userInfolog);
							socket.emit('dongshanzaiqi',{addCoin:50,times:k});
						}
						//console.log(result);
						socket.emit('loginResult',result);
					 	++self.onlinePlayerCount;
					 	callback(null,userInfo.Id);
					 	//console.log("上线!同时在线:" + self.onlinePlayerCount + "人")
					 	
					});
				}else{
					socket.emit('loginResult',result);
					++self.onlinePlayerCount;
					callback(null);
				}
			}
			], function (err, result) {
				
				log.info(userInfo.Id + "登录分数" + self.userList[userInfo.Id]._score);
				self.userList[userInfo.Id].loginEnd = true;
			   if (err){
			   	console.log(err);
			   	console.log(result);
			   	callback_a(0);
			   }
			   else{
			   	
			   	socket.emit('ServerListResult',{GameInfo:ServerInfo.getServerAll()});
			   	self.getSendPrize(userInfo.Id,function(result){
              		socket.emit('prizeListResult',{prizeList:result});
            	})

            	//发送每日活动信息
	            self.getdaySendPrize(userInfo.Id,function(result){
	              socket.emit('dayListResult',{nowday:result.nowday,getcoin:result.getcoin,unclaimedList:result.list});
	            })

	            //是否有首次兑换
	            self.getfirstexchange(userInfo.Id,function(result){
	              //console.log(result)
	              socket.emit('firstExchagerResult',{firstExchager:result.firstexchange,zhifubao:result.zhifubao,zhifubaoName:result.zhifubaoName});
	            })

	            //发送等级信息
	            self.getLv(userInfo.Id,function(result){
	              //console.log(result)
	              socket.emit('lv',result);
	            })

	            //发送是否在房间信息
	            var linemsg = self.getLineOutMsg(userInfo.Id);
	            //console.log(linemsg)
	            if (linemsg.Result){
	              socket.emit('lineOutMsg',{gameId:linemsg.gameId,serverId:linemsg.serverId,tableId:linemsg.tableId,seatId:linemsg.seatId});
	            }

	            callback_a(1);
			   }
			});

		}

		this.logintime = function(_id){
			if (this.userList[_id]){
				return this.userList[_id].logincheck(new Date());
			}
			return 1;
		}

		//获得在线人数
		this.getOnlinePlayerCount = function(){
			return this.onlinePlayerCount;
		}

		//在线所有人
		this.getOnlinePlayer = function(){
			return this.userList;
		}

		this.setCleanGameIdByUserId = function(_userinfo){
			if (_userinfo.userId){
				log.info(_userinfo.userId + "清除游戏ID")
				if (this.userList[_userinfo.userId]){
					this.userList[_userinfo.userId].resetGame();
					log.info("游戏ID" + this.userList[_userinfo.userId].getGameId())
				}
			}
		}
		
		//删除用户
		this.deleteUser = function(_userinfo){
			//console.log("delete")
			//console.log(_userinfo)
			if (_userinfo.userId){
				//指定用户储存
				log.info("用户" + _userinfo.userId + "删除!");
				if (this.userList[_userinfo.userId] && !this.userList[_userinfo.userId].getGameId() && !this.userList[_userinfo.userId].deleteFlag){
					log.info("用户" + _userinfo.userId + "没有游戏ID");
					var score_change = _userinfo.userScore - this.userList[_userinfo.userId]._score;
					var score_before = this.userList[_userinfo.userId]._score;
					this.userList[_userinfo.userId].deleteFlag = true;
					this.tempuserList[_userinfo.userId] = this.userList[_userinfo.userId];
					if (_userinfo.userScore != null){
						this.tempuserList[_userinfo.userId]._score = _userinfo.userScore;	
						//储存玩家游戏金钱变化量
						if (!_userinfo.nolog){
							var info = {userid:_userinfo.userId,score_before:score_before,score_change:score_change,score_current:_userinfo.userScore,change_type:(_userinfo.gameId + 10),isOnline:true,ChannelType:this.userList[_userinfo.userId]._ChannelType}
							this.score_changeLogList.push(info);
						}
					}
				}

			}
		}

		this.deleteUserNoLoginGame = function(userid,flag){
			if (this.userList[userid]){
				//console.log("进入这里" + this.userList[userid].getRoomId())
				if (!this.userList[userid].getGameId() && !this.userList[userid]._ageinLogin){
					delete this.userList[userid];
					--this.onlinePlayerCount;
					//console.log("未登录游戏离线!同时在线:" + this.onlinePlayerCount + "人")
				}

				if (flag){
					delete this.userList[userid];
					--this.onlinePlayerCount;
					//console.log("未登录游戏离线!同时在线:" + this.onlinePlayerCount + "人")

				}
				//console.log(this.userList);
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

		this.getUserTicket = function(_userId,callback){
			var giftTicket = 0;
			if (_userId && this.userList[_userId]){
				//用户在线
				giftTicket = this.userList[_userId]._giftTicket;
				callback(giftTicket);
			}else{
				//去数据库拿
				dao.getScore(_userId,function(Result,rows){
					if (Result){
						callback(rows.giftTicket);
					}else{
						callback(-1);
					}
				})
			}
		}

		//获得用户
		this.webGetUser = function(_account,callback){
			// if (_userId){
			// 	return this.userList[_userId];
			// }
			//以后再拿实效金额
			//
			//
			var format = {};
			if (_account){
				dao.webGetUser(_account,function(code,result){
					
					format.code = code;
					format.nickname = result.nickname;
					format.ticket = result.giftTicket;
					format.userId = result.userId;
					callback(format);
				})
			}else{
				callback(format);
			}
		}


		//商城购买
		this.shopBuy = function(_userId,_productId,_count,callback){
			//获得商品配置
			var shopConfig = updateConfig.getShopConfig();
			if (!shopConfig[_productId]){
				//商品不存在
				callback(2);
				return;
			}

			var self = this;
			//拿到实效商品券
			
			this.getUserTicket(_userId,function(giftTicket){
				if (giftTicket == -1){
					callback(5);
					return;
				}

				if (shopConfig[_productId].price > giftTicket){
					//礼品券不足
					//console.log(giftTicket)
					callback(1);
					return;
				}

				//购买成功
				if (_userId && self.userList[_userId]){
					//用户在线
					self.userList[_userId]._giftTicket -= shopConfig[_productId].price;
					callback(0);
				}else{
					//去修改数据库
					var info = {userid:_userId,count:-shopConfig[_productId].price,change_type:0}
					dao.EditTicket(info,function(rusult){
						if (rusult){
							callback(0);
						}else{
							callback(4);
						}
					})
				}
				
			})
		}
		
		//保存所有用户
		this.saveAll = function(){
			dao.saveAll(this.userList,function(Result){

			})
		}

		//用户是否在线
		this.IsPlayerOnline = function(_userId){
			if (!_userId){	//传输ID错误
				console.log("查询在线,参数错误");
				return 0;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//console.log("查询在线,未找到" + _userId + "用户");
				return 1;
			}else{
				return 0;
			}
		}

		//获得用户当前分数
		this.getPlayerScore = function(_userId,_callback){
			if (!_userId){	//传输ID错误
				console.log("查询分数,参数错误");
				return -1;
			}
			var sendStr;
			if (this.userList[_userId]) {//未找到用户
				if (this.userList[_userId].getGameId()){
					//游戏在线
					var gameScoket = ServerInfo.getScoket(this.userList[_userId].getGameId())
					gameScoket.emit('getgold',{userid:_userId})
					gameScoket.on('getgoldResult',function(msg){
						//console.log(msg);
						if (msg.Result){
							//sendStr = msg.score.toString();
							sendStr = '{"status":0,"msg":"","data":{"score":'+msg.score.toString()+'}}'
							_callback(sendStr);
						}else{
							sendStr = '{"status":1,"msg":"在线查询分数失败"}'
							_callback(sendStr);
						}
						gameScoket.removeAllListeners('getgoldResult');
					})
				}else{
					//只是在登录服务器
					//sendStr = this.userList[_userId].getScore().toString();
					sendStr = '{"status":0,"msg":"","data":{"score":'+this.userList[_userId].getScore().toString()+'}}'
					_callback(sendStr)
					//return this.userList[_userId].getScore();
				}

			}else{
				sendStr = '{"status":1,"msg":"在线查询分数失败"}'
				_callback(sendStr);
			}
		}

		//给在线的用户加分
		this.addgold = function(_userId,score,callback){

			if (!_userId){					//传输ID错误
				console.log("加分,未登录")
				return 0;
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				console.log("加分,未登录")
				return 0
			}else{
				//console.log(ServerInfo)
				var gameScoket = ServerInfo.getScoket(this.userList[_userId].getGameId())
				//console.log("1111");
				var self = this;
				gameScoket.emit('addgold',{userid:_userId,addgold:score})
				gameScoket.on('addgoldResult',function(msg){
					//console.log(msg);
					if (msg.Result){
						//可以成功加减分
						var score_before = self.userList[_userId].getScore();
						self.userList[_userId].addgold(score)
						callback(1,score_before);
					}else{
						callback(0)
					}
					gameScoket.removeAllListeners('addgoldResult');
				})
			}

		}

		
		//进入游戏
		this.LoginGame = function(_userId,_sign,gametype,_enCoin){
			//用户添加游戏ID
			if (!this.userList[_userId]){
				log.err("进入游戏,用户" + _userId + "不存在");
				return {_userId:0,msg:"用户不存在"};
			}

			if (this.userList[_userId].deleteFlag){
				log.err("进入游戏,用户正在删除" + _userId);
				return {_userId:0,msg:"用户不存在"};
			}

			//先获得是否在断线列表中****
			var linemsg = this.getLineOutMsg(_userId);
            if (linemsg.Result){
              if (gametype != linemsg.serverId){
              	log.info("用户有在其他游戏中未退出!")
              	return {_userId:0,msg:"您还在游戏中未退出,请等待上一个牌局结束"};
              }
            }

			if (_enCoin == -1){
				log.err("进入房间条件出错!")
				return {_userId:0,msg:"进入房间条件出错!"};
			}

			if (this.userList[_userId]._Robot && RobotConfig.robotEnterCoin[gametype]){
				this.userList[_userId]._score = Math.floor(Math.random()*(RobotConfig.robotEnterCoin[gametype].max - RobotConfig.robotEnterCoin[gametype].min)) + RobotConfig.robotEnterCoin[gametype].min;
				log.info(gametype);
				log.info(this.userList[_userId]._score);
			}

			if (this.userList[_userId]._score < _enCoin){
				log.err(this.userList[_userId]._userId + "金币不足!")
				return {_userId:0,msg:"金币不足"};
			}

            //获得对应游戏所需要进入的金币
			if (this.userList[_userId]._sign == _sign){
				log.info(_userId + "进入游戏" + gametype);
				this.userList[_userId].loginGame(gametype);
				var userInfo = {};
				userInfo._userId = this.userList[_userId]._userId;
				userInfo._account = this.userList[_userId]._account;
				userInfo._score = this.userList[_userId]._score;
				userInfo._nickname = this.userList[_userId]._nickname;
				userInfo.freeCount = this.userList[_userId].freeCount;
				userInfo.LoginCount = this.userList[_userId].LoginCount;
				userInfo.LotteryCount = this.userList[_userId].LotteryCount;
				userInfo.propList = this.userList[_userId]._proList;
				userInfo._headimgurl = this.userList[_userId]._headimgurl;
				userInfo._Robot = this.userList[_userId]._Robot;

				
				return userInfo;
			}else{
				log.err("用户进入游戏" + _userId + "密码错误!");
				return {_userId:0,msg:"密码错误!"};
			}

		}

		this.addLoginList = function(user){
			//已经存在删掉前面的push后面的
			//列队状态1.排队,2.离线中,3.登录中，5.完成登录
			this.deleteLoginList(user.userName)
			user.state = 1;
			user.AutoOutCount = 0;
			this._loginList.push(user);
		}


		this.getLoginState = function(useraccount,state){
			for(var i = 0;i < this._loginList.length ; i++){
				if (this._loginList[i].userName == useraccount && this._loginList[i].state == state){
					return true;
				}
			}
			return false;
		}

		this.deleteLoginList = function(useraccount){
			var idx = -1;
			for(var i = 0;i < this._loginList.length ; i++){
				if (this._loginList[i].userName == useraccount){
					idx = i;
					break; 
				}
			}

			if (idx != -1){
				this._loginList.splice(idx,1)
			}

		}

		this.updateLogin = function(){

			for(i = 0;i < this._loginList.length ; i++){
				if (this.userList[this._loginList[i].id]){
					//存在,让他下线
					if (this.userList[this._loginList[i].id].getGameId()){
					//1.游戏状态
					//先让游戏下线,然后再新开一个用户
						if (this._loginList[i].state != 4){
							log.info(this._loginList[i].id + "当前用户在线" + this.userList[this._loginList[i].id].getGameId() + "被强制下线");
							var gameScoket = ServerInfo.getScoket(this.userList[this._loginList[i].id].getGameId())
							this.userList[this._loginList[i].id]._socket.disconnect();
							gameScoket.emit('disconnectUser',{userId:this._loginList[i].id})
							this._loginList[i].state = 4;
						}else{
							log.info("等待游戏服务器过来删除"+this._loginList[i].id);
							++this._loginList[i].AutoOutCount;
							if (this._loginList[i].AutoOutCount > 100){
								delete this.userList[this._loginList[i].id];
							}
						}
						
						

					//this.userList[userInfo.Id].changeSocke(socket,sign);
					}
					else{
						log.info(this._loginList[i].id + "用户只在登录服务器被强制下线");
						//先判断socket 是否有真的连接
						if (this.userList[this._loginList[i].id]._socket.connected){
							if (this._loginList[i].state == 1){
								this.userList[this._loginList[i].id]._socket.disconnect();
								this._loginList[i].state = 2;
							}
						}else if(!this.userList[this._loginList[i].id].deleteFlag){
							delete this.userList[this._loginList[i].id];
							//--this.onlinePlayerCount;
							//console.log("离线!同时在线:" + this.onlinePlayerCount + "人")
						}
					}
				}else{
					//完全不在线了,再让他登录一下
					log.info(this._loginList[i].id + "完全下线了");
					var self = this;
					this._loginList[i].state = 3;
				    dao.login(this._loginList[i],this._loginList[i].socket,function(state,rows){
				      if (!state){
				      		//如果状态不为3
				      		if (self.getLoginState(rows.Account,3)){
				      			//如果状态为3,才添加
				      			self.deleteLoginList(rows.Account);
				      			self.addUser(rows,rows.socket,function(rusult){
				          			log.info("完成添加")
          						});

				      		}else{
				      			console.log("状态不为3,又重新登录了")
				      		}
				          
				      } else if(state == 1){
				        var result = {};
				        result = {resultid:0,msg:'Account or password error,login fail!'};
				        socket.emit('loginResult',result);
				        log.info(user)
				        log.info("登录失败!");
				      } else if(state == 2){
				        var result = {};
				        result = {resultid:-1,msg:'This account is disabled!'};
				        socket.emit('loginResult',result);
				        log.info("登录失败,帐号被停用!");
				      }
				    })			
				}
			}
		}


		//兑换电话费
		this.exchange = function(_userId,_info,io){
			
			//_info.proId 道具ID
			//_info.proCount 道具数量
			var cost = 0;
 			//用户存在
			if (!this.userList[_userId]){
				return;
			}

			if (!this.userList[_userId]._phoneNo){
				this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"您未绑定手机"});
				return;
			}

			if (!(_info.proCount == 20 || _info.proCount == 50 || _info.proCount == 100)){
				this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"道具数量错误"});
				return;
			}

			var firstValue = 1;
			if (!this.userList[_userId]._firstexchange){
				firstValue = 0.5 
			}

			switch(_info.proCount){
				case 20:
					_info.deleteCount = Math.floor((_info.proCount * 10) + 0.1);
					// if (this.userList[_userId]._score < 600 * firstValue){
					// 	this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"金币不足" + 600 * firstValue});
					// 	return;
					// }
					// cost = 600;
					break;
				case 50:
					_info.deleteCount = Math.floor((_info.proCount * 9.6) + 0.1);
					// if (this.userList[_userId]._score < 1300 * firstValue){
					// 	this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"金币不足" + 1300 * firstValue});
					// 	return;
					// }
					// cost = 1300;
					break;
				case 100:
					_info.deleteCount = Math.floor((_info.proCount * 9.2) + 0.1);
					// if (this.userList[_userId]._score < 2400 * firstValue){
					// 	this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"金币不足" + 2400 * firstValue});
					// 	return;
					// }
					// 
					// cost = 2400;
					break;
			}
			if (!this.userList[_userId]._proList[1] || this.userList[_userId]._proList[1] < _info.deleteCount){
				this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"道具数量不足"});
				return;
			}

			console.log(_info.deleteCount);

			console.log(this.userList[_userId]._proList[1]);

			var info = {
				Type:'A1',
 				Account:this.userList[_userId]._userId,
 				PhoneNo:this.userList[_userId]._phoneNo,
 				OrderId:'1',
 				CardNum:_info.proCount,
 				Key:'89b5b987124d2ec3'
 			}

 			this.userList[_userId]._firstexchange = true;
			
			//调用接口
			//返回后
			//发送兑换结果
			//减掉道具
			//存储兑换记录
			var self = this;
			Post.postExchange(info,function(rusult){
				if (rusult){
					self.userList[_userId]._proList[1] -= _info.deleteCount;
					var myNowScore = self.userList[_userId]._score;
					self.userList[_userId]._score -= (cost * firstValue);
					var NowScore = self.userList[_userId]._score;
					//console.log(self.userList[_userId]._score)
					var info = {userId:_userId,propId:1,propCount:-_info.deleteCount,roomid:0,typeid:2}
					dao.updateProp(info,function(result){});
					dao.updateFirstexchange(_userId);

					var score_change = parseInt(cost * firstValue);
					var userInfo = {userid:_userId,score_before:myNowScore,score_change:-score_change,score_current:NowScore,change_type:4,isOnline:true};
					self.score_changeLogList.push(userInfo);

					self.userList[_userId]._socket.emit('exchangeResult',{Result:1,msg:"兑换成功",deleteCount:-_info.deleteCount,deleteCoin:-(cost * firstValue)});
					io.sockets.emit('noticeMsg',{nickname:self.userList[_userId]._nickname,msg:"成功兑换" + _info.proCount + "元电话卡!"});

				}

			});
			
			return;
		}


		//赠送金币
		this.sendCoin = function(_socket,_info){
			//被赠送id
			//金额
			if (_socket.userId == _info.sendUserId){
				_socket.emit('sendCoinResult',{Result:0,msg:"不能自己赠送自己"});
				return;
			}

			if (_info.sendUserId <= 0){
				_socket.emit('sendCoinResult',{Result:0,msg:"赠送ID不能小于0"});
				return;
			}

			if (_info.sendCoin < 1000){
				_socket.emit('sendCoinResult',{Result:0,msg:"赠送金币不能小于1000"});
				return;
			}


			// var userItem = this.getUser(_info.sendUserId);
			// if (userItem && userItem.getGameId()){
			// 	_socket.emit('sendCoinResult',{Result:0,msg:"对方在游戏中,赠送失败!"});
			// 	return;
			// }

			var myNowScore = this.userList[_socket.userId].getScore();

			if (!this.userList[_socket.userId]){
				_socket.emit('sendCoinResult',{Result:0,msg:"用户错误,请重新登录"});
				return;
			}


			 if (!this.userList[_socket.userId]._phoneNo){
			 	_socket.emit('sendCoinResult',{Result:0,msg:"未绑定手机,不允许赠送"});
			 	return;
			 }

			 if (this.userList[_socket.userId].getScore() - _info.sendCoin < 1000){
			 	_socket.emit('sendCoinResult',{Result:0,msg:"赠送失败,剩余金币不能低于1000"});
			 	return;
			 }
			
			
			if (this.userList[_socket.userId].addgold(-_info.sendCoin)){
				log.info(_socket.userId + "赠送前,金币:" + myNowScore);
				log.info(_socket.userId + "赠送金币:" + _info.sendCoin);
				var info = {userId:_info.sendUserId,winPropId:0,winPropCount:0,winScore:_info.sendCoin,type:1,sendCoinUserId:_socket.userId,nickName:this.userList[_socket.userId]._nickname};
				this.sendEmail(info);

				//给自己做钱的记录
				var score_change = parseInt(_info.sendCoin);
				var NowScore = this.userList[_socket.userId].getScore();
				var userInfo = {userid:_socket.userId,score_before:myNowScore,score_change:-score_change,score_current:NowScore,change_type:3,isOnline:true};
				this.score_changeLogList.push(userInfo);
				log.info(_socket.userId + "赠送后:" + NowScore);
				userInfo = {userid:_socket.userId,getcoinuserid:_info.sendUserId,sendcoin:score_change}
				dao.sendcoinlog(userInfo);
				_socket.emit('sendCoinResult',{Result:1,score:-_info.sendCoin,msg:"赠送成功"});
			}else{
				//减分失败
				_socket.emit('sendCoinResult',{Result:0,msg:"赠送失败,金钱不足"});
			}
			
		}

		//检测昵称
		this.checkNickName = function(_socket,_info){
			//被赠送id
			//金额
			//log.info("收到来自" + _socket.userId + "检测ID");
			if (parseInt(_info.userId, 10) != _info.userId && _info.userId < 1){
				_socket.emit('checkNickNameResult',{Result:0,msg:"检测ID错误"});
				return;
			}
			var self = this;

			dao.checkNickName(_info.userId,function(result,nickName){
				if (self.userList[_socket.userId]){
					if (result){
							//log.info("发送" + _socket.userId + "检测ID");
							self.userList[_socket.userId]._socket.emit("checkNickNameResult",{resultCode:1,nickName:nickName});
						}else{
							self.userList[_socket.userId]._socket.emit("checkNickNameResult",{resultCode:0,nickName:""});	
						}
				}else{
					log.err("检测ID:" + _socket.userId + "不存在");
				}
			});
		}

		//修改昵称
		this.updateNickName = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.err("更新用户ID,用户" + _userId + "不存在");
				_socket.emit('updateNickNameResult',{Result:1,msg:"ID不存在"});
				return;
			}

			//金额
			if (_info.newNickName == ""){
				_socket.emit('updateNickNameResult',{Result:2,msg:"昵称不能为空"});
				return;
			}
			var self = this;

			dao.updateNickName(_socket.userId,_info.newNickName,function(result,nickName){
				if (self.userList[_socket.userId]){
					if (result){
							//log.info("发送" + _socket.userId + "检测ID");
						self.userList[_socket.userId]._socket.emit("updateNickNameResult",{Result:0,msg:"修改成功"});
					}else{
						self.userList[_socket.userId]._socket.emit("updateNickNameResult",{Result:3,msg:"修改失败"});
					}
				}
			});
		}


		//绑定支付宝
		this.bindZhifubao = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.err("绑定支付宝,用户" + _userId + "不存在");
				_socket.emit('bindZhifubaoResult',{Result:1,msg:"ID不存在"});
				return;
			}

			//支付宝账号
			//支付宝真实名字
			if (_info.zhifubao == ""){
				_socket.emit('bindZhifubaoResult',{Result:2,msg:"绑定支付宝账号不能为空"});
				return;
			}

			if (_info.name == ""){
				_socket.emit('bindZhifubaoResult',{Result:3,msg:"绑定支付宝实名制名字不能为空"});
				return;
			}

			if (this.userList[_socket.userId]._zhifubaoEnd == 1){
				_socket.emit('bindZhifubaoResult',{Result:4,msg:"支付宝与帐号已经终生绑定"});
				return;
			}
			var self = this;

			dao.bindZhifubao(_socket.userId,_info.zhifubao,_info.name,function(result,nickName){
				if (self.userList[_socket.userId]){
					if (!result){
						self.userList[_socket.userId]._zhifubao = _info.zhifubao;
						self.userList[_socket.userId]._zhifubaoName = _info.name;
							//log.info("发送" + _socket.userId + "检测ID");
						self.userList[_socket.userId]._socket.emit("bindZhifubaoResult",{Result:0,msg:"绑定支付宝成功"});
					}else{
						if(result == 1){
							self.userList[_socket.userId]._socket.emit("bindZhifubaoResult",{Result:4,msg:"绑定支付宝已被绑定"});
						}
						else if(result == 2){
							self.userList[_socket.userId]._socket.emit("bindZhifubaoResult",{Result:5,msg:"有订单正在兑换中"});
						}
					}
				}
			});
		}


		//绑定银行卡
		this.BankInfo = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.err("绑定银行卡,用户" + _userId + "不存在");
				_socket.emit('BankInfoResult',{Result:1,act:_info.act,msg:"ID不存在"});
				return;
			}

			if (!_info.act){
				_socket.emit('BankInfoResult',{Result:2,act:_info.act,msg:"银行卡操作码不能为空"});
				return;
			}

			if (_info.act == 1){
				if (_info.account == "" || _info.account.length > 30){
					_socket.emit('BankInfoResult',{Result:3,act:_info.act,msg:"添加银行卡账号错误"});
					return;
				}

				if (_info.name == "" || _info.name.length > 30){
					_socket.emit('BankInfoResult',{Result:4,act:_info.act,msg:"添加银行卡实名制名字错误"});
					return;
				}

				if (!_info.bankType){
					_socket.emit('BankInfoResult',{Result:5,act:_info.act,msg:"添加银行卡类型不能为空"})
					return;
				}

				var self = this;
				dao.addBank(_socket.userId,_info.account,_info.name,_info.bankType,function(result,nickName){
					if (self.userList[_socket.userId]){
						if (result){
								//log.info("发送" + _socket.userId + "检测ID");
							self.userList[_socket.userId]._cardList.push({cardId:result,name:_info.name,bankType:_info.bankType,account:_info.account});
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:0,act:_info.act,cardId:result,msg:"添加银行卡成功"});
						}else{
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:4,act:_info.act,cardId:0,msg:"添加银行卡失败"});
						}
					}
				});
			}else if(_info.act == 2){

				if (_info.cardId == ""){
					_socket.emit('BankInfoResult',{Result:3,act:_info.act,msg:"修改卡ID不能为空"});
					return;
				}

				if (_info.account == "" || _info.account.length > 30){
					_socket.emit('BankInfoResult',{Result:3,act:_info.act,msg:"添加银行卡账号错误"});
					return;
				}

				if (_info.name == "" || _info.name.length > 30){
					_socket.emit('BankInfoResult',{Result:4,act:_info.act,msg:"添加银行卡实名制名字错误"});
					return;
				}

				if (!_info.bankType){
					_socket.emit('BankInfoResult',{Result:5,act:_info.act,msg:"修改银行卡类型不能为空"});
					return;
				}

				var self = this;
				dao.editBank(_socket.userId,_info.account,_info.name,_info.bankType,_info.cardId,function(result,nickName){
					if (self.userList[_socket.userId]){
						if (result){
								//log.info("发送" + _socket.userId + "检测ID");
							
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:0,act:_info.act,cardId:_info.cardId,msg:"修改银行卡成功"});
						}else{
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:4,act:_info.act,cardId:_info.cardId,msg:"修改银行卡失败"});
						}
					}
				});
			}else if(_info.act == 3){
				if (_info.cardId == ""){
					_socket.emit('BankInfoResult',{Result:3,act:_info.act,msg:"删除卡ID不能为空"});
					return;
				}

				var self = this;
				dao.delBank(_socket.userId,_info.cardId,function(result,nickName){
					if (self.userList[_socket.userId]){
						if (result){
								//log.info("发送" + _socket.userId + "检测ID");
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:0,act:_info.act,cardId:_info.cardId,msg:"删除银行卡成功"});
						}else{
							self.userList[_socket.userId]._socket.emit("BankInfoResult",{Result:4,act:_info.act,cardId:_info.cardId,msg:"删除银行卡失败"});
						}
					}
				});
			}
		}

		//获取银行卡
		this.getBank = function(_socket){
			if (!this.userList[_socket.userId]){
				_socket.emit("getBankResult",{ResultCode:1,msg:"请先登录"})
				return;
			}

			var self = this;

			dao.getBank(_socket.userId,function(Result,row){
				// console.log(Result);
				if (Result){
					self.userList[_socket.userId]._cardList = row;
					//console.log(self.userList[_socket.userId]._cardList)
					_socket.emit('getBankResult',{ResultCode:0,data:{bankList:row}})
				}else{
					_socket.emit('getBankResult',{ResultCode:1,data:{bankList:[]}})
				}
			});
		}


		this.sendEmail = function(info){
			var self = this;

			dao.sendEmail(info,function(result,idx){
				if (result){
					if (self.userList[info.userId]){
						var prize = {id:idx,
							propId:info.winPropId,
							propCount:info.winPropCount,
							winScore:info.winScore,
							rankidx:0,
							isGetPrize:0,
							type:info.type,
							sendCoinUserId:info.sendCoinUserId,
							nickName:info.nickName};

						self.userList[info.userId]._socket.emit("addPrize",prize);
						//判断是否已经有此条记录
						var same = false;
						if (self.userList[info.userId] && self.userList[info.userId]._prize){
							for(var j = 0; j < self.userList[info.userId]._prize.length ; j++){
								if (self.userList[info.userId]._prize[j].id == prize.id){
									same = true;
									break;
								}
							}
						}
						
						if (!same){
							self.userList[info.userId]._prize.push(prize);
						}
						
					}
				}
			});
		}

		//发送绑定手机验证码
		this.sendbindPhoneNo = function(_socket,_info){
			//_info.phoneNo
			var phone = String(_info.phoneNo);
			
			//
			if (!_info.phoneNo || phone.length != 11){
				_socket.emit('sendbindPhoneNoResult',{Result:0,msg:"发送失败,手机号码错误"});
				return;
			}

			var info = {
			 	phone:phone,
 				userId:_socket.userId
 			}

			var self = this;
			//需要验证,这个号码是否已经绑定了
			//如果已经有手机号码了,不能再绑定
			dao.phoneCheck(info,function(ResultCode){
				if (ResultCode){
				var info = {
			 		Type:'A2',
 			 		Account:String(_socket.userId),
 			 		PhoneNo:String(_info.phoneNo),
 			 		Key:'89b5b987124d2ec3'
 			 	}
 			 	
 			 	//self.userList[_socket.userId].setPhoneNo(info.PhoneNo);
				info.checkNo = String(self.userList[_socket.userId].newCheckNo());
				self.checkNo[_socket.userId] = {phoneNo:info.PhoneNo,checkNo:info.checkNo};
				Post.postbindPhone(info,function(rusult){
			 		if (rusult){
			 			_socket.emit('sendbindPhoneNoResult',{Result:1,msg:"发送成功"});
			 		}
			 		else{
			 			_socket.emit('sendbindPhoneNoResult',{Result:0,msg:"发送失败"});
			 		}
				});
				}else{
					_socket.emit('sendbindPhoneNoResult',{Result:0,msg:"此手机号码已绑定!"});
				}
			})

		}

		//绑定手机
		this.bindPhone = function(_socket,_info){
			
			if (!this.checkNo[_socket.userId]){
				_socket.emit('bindPhoneResult',{Result:0,msg:"未获取验证码"});
				return;
			}

			if (_info.phoneNo != this.checkNo[_socket.userId].phoneNo){
				_socket.emit('bindPhoneResult',{Result:0,msg:"手机号码错误"});
				return;
			}


			//this.checkNo[_socket.userId] = {phoneNo:info.PhoneNo,checkNo:info.checkNo};
			if (_info.checkNo == "" || _info.checkNo != this.checkNo[_socket.userId].checkNo){
				_socket.emit('bindPhoneResult',{Result:0,msg:"验证码错误"});
				return;
			}

			var password = String(_info.password);
			var pass = String(_info.password);
			if (!password || password.length < 6){
				_socket.emit('bindPhoneResult',{Result:0,msg:"密码位数不对或密码为空"});
				return;
			}


			var key_login = "89b5b9871@@@24d2ec3@*&^sexx$%^slxxx";
			var content = password + key_login;
			var md5_sign = crypto.createHash('md5');
			md5_sign.update(content);
			
			password = md5_sign.digest('hex');

			this.userList[_socket.userId].cleanCheckNo();

			var info = {phoneNo:_info.phoneNo,Id:_socket.userId,password:password,pass:pass};
			this.userList[_socket.userId].setPhoneNo(this.checkNo[_socket.userId].phoneNo);


			delete this.checkNo[_socket.userId];

			//数据库更新电话号码
			dao.SetPhoneNo(info,function(ResultCode){
				if (ResultCode){
					_socket.emit('bindPhoneResult',{Result:1,msg:"绑定成功"});
				}else{
					_socket.emit('bindPhoneResult',{Result:-1,msg:"无法写入数据库"});
				}
			});
			
		}

		//获取未领奖列表
		this.getSendPrize = function(_userId,callback){

			if (!this.userList[_userId]){
				callback(0);
				return;
			}
			var self = this;
			dao.getSendPrize(_userId,function(result,rows){
				var values = [];
				if (result){
					for(var i = 0 ; i < rows.length; i++){
							values.push({id:rows[i].msgId,
							propId:rows[i].winPropId,
							propCount:rows[i].winPropCount,
							winScore:rows[i].winScore,
							rankidx:rows[i].rankIdx,
							isGetPrize:rows[i].isGetPrize,
							type:rows[i].type,
							sendCoinUserId:rows[i].sendCoinUserId,
							nickName:rows[i].nickName});
					}
				}
				if (self.userList[_userId]){
					self.userList[_userId]._prize = values;
				}
				
				callback(values);
			})
		}

		//每日活动
		this.getdaySendPrize = function(_userId,callback){

			if (!this.userList[_userId]){
				callback(0);
				return;
			}

			var self = this;
			dao.getdaySendPrize(_userId,function(result,rows){
				var resultBack = {};
				var values = [];
				//console.log(rows.length)
				if (result){
					//console.log(rows)
					for(var i = 0 ; i < rows.length; i++){
						resultBack.nowday = rows[i].nowday;
						if (rows[i].day){
							if (!rows[i].mark){
								values.push({id:rows[i].id,
								day:rows[i].day,
								mark:rows[i].mark});
							}
							if (rows[i].day == resultBack.nowday){
								resultBack.getcoin = -1;
							}

						}else{
							resultBack.getcoin = rows[i].getCoin;
						}
					}
				}
				if (self.userList[_userId]){
					self.userList[_userId]._dayprize = values;
				}
				resultBack.list = values;
				if (!resultBack.nowday){
					resultBack.nowday = 1;
				}
				if (!resultBack.getcoin){
					resultBack.getcoin = 0;
				}
				//console.log(resultBack);
				callback(resultBack);
			})
		}

		//领奖
		this.getPrize = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				return;
			}
			var prize = this.userList[_socket.userId]._prize;

			if (!prize || prize.length <= 0){
				_socket.emit('getPrizeResult',{Result:0,msg:"领奖列表为空"});
				return;
			}

			var found = false;
			for(var i = 0; i < prize.length; i++){
				if(_info.id == prize[i].id){
					found = true;
					if(!prize[i].isGetPrize){
						prize[i].isGetPrize = 1;
						_socket.emit('getPrizeResult',{Result:1,msg:"成功领取",data:{winPropId:prize[i].propId,winPropCount:prize[i].propCount,winScore:prize[i].winScore}});
						var myNowScore = this.userList[_socket.userId].getScore();
						log.info(_socket.userId + "领取前" + myNowScore);
						//内存添加金币
						this.userList[_socket.userId].addgold(prize[i].winScore);

						var myAfScore = this.userList[_socket.userId].getScore();
						log.info(_socket.userId + "成功领取" + prize[i].winScore);
						log.info(_socket.userId + "剩余" + myAfScore);
						//内存添加道具
						if (this.userList[_socket.userId]._proList[prize[i].propId]){
							this.userList[_socket.userId]._proList[prize[i].propId] += prize[i].propCount;
						}else{
							this.userList[_socket.userId]._proList[prize[i].propId] = prize[i].propCount;
						}
						var info = {userId:_socket.userId,propId:prize[i].propId,propCount:prize[i].propCount,roomid:0,typeid:3}
						//数据库添加道具
						dao.updateProp(info,function(result){});
						//数据库更新
						dao.getPrize(_info.id,function(Result){})

										//给自己做钱的记录
						var score_change = prize[i].winScore;
						if (prize[i].winScore > 0){
							var userInfo = {userid:_socket.userId,score_before:myNowScore,score_change:score_change,score_current:myAfScore,change_type:6,isOnline:true};
							this.score_changeLogList.push(userInfo);
						}

						return;
					}else{
						_socket.emit('getPrizeResult',{Result:0,msg:"奖品已经领取"});
						return;
					}
					break;
				}
			}

			if (!found){
				_socket.emit('getPrizeResult',{Result:0,msg:"未能找到领奖ID"});
				return;
			}
		}

		this.addPrize = function(_info){
			var self = this;
			dao.addPrize(_info,function(result,rows){
				if (result){
					var values = [];
					for(var i = 0 ; i < rows.length; i++){
						//查看当前ID的玩是否在线
						
						//如果在线，发送通知
						//并在添加自己领奖列表
						if (rows[i].rankIdx){
							if (self.userList[rows[i].userId]){
								var prize = {id:rows[i].msgId,
									propId:rows[i].winPropId,
									propCount:rows[i].winPropCount,
									winScore:rows[i].winScore,
									rankidx:rows[i].rankIdx,
									isGetPrize:rows[i].isGetPrize,
									type:rows[i].type,
									sendCoinUserId:rows[i].sendCoinUserId,
									nickName:rows[i].nickName};
								self.userList[rows[i].userId]._socket.emit("addPrize",prize);
								//判断是否已经有此条记录
								var same = false;
								if (self.userList[rows[i].userId] && self.userList[rows[i].userId]._prize){
									for(var j = 0; j < self.userList[rows[i].userId]._prize.length ; j++){
										if (self.userList[rows[i].userId]._prize[j].id == prize.id){
											same = true;
											break;
										}
									}
								}
								
								if (!same){
									self.userList[rows[i].userId]._prize.push(prize);
								}
								
							}
						}
					}
				}
				//console.log(values);

				//self.userList[_userId]._prize = values;
			})
		}

		//领每日奖品
		this.getDayPrize = function(_socket,_info){

			var dayprize = this.userList[_socket.userId]._dayprize;

			if (!dayprize || dayprize.length <= 0){
				_socket.emit('getDayPrizeResult',{Result:0,msg:"领奖列表为空"});
				return;
			}

			var found = false;
			for(var i = 0; i < dayprize.length; i++){
				if(_info.id == dayprize[i].id){
					found = true;
					if(!dayprize[i].mark){
						dayprize[i].mark = 1;
						var propId = activityConfig.dayprize[dayprize[i].day-1].propId;
						var propCount = activityConfig.dayprize[dayprize[i].day-1].propCount;
						_socket.emit('getDayPrizeResult',{Result:1,msg:"成功领取",data:{winPropId:propId,winPropCount:propCount}});
						//内存添加道具
						if (this.userList[_socket.userId]._proList[propId]){
						  	this.userList[_socket.userId]._proList[propId] += propCount;
						}else{
						  	this.userList[_socket.userId]._proList[propId] = propCount;
						}
						
						var info = {userId:_socket.userId,propId:propId,propCount:propCount,roomid:0,typeid:4}
						//数据库添加道具
						dao.updateProp(info,function(result){});
						//数据库更新
						dao.getDayPrize(_info.id,function(Result){})
						return;
					}else{
						_socket.emit('getDayPrizeResult',{Result:0,msg:"奖品已经领取"});
						return;
					}
					break;
				}
			}

			if (!found){
				_socket.emit('getDayPrizeResult',{Result:0,msg:"未能找到领奖ID"});
				return;
			}
		}

		this.getServerRank = function(_socket,_info){
			_socket.emit('getServerRankResult',{Result:1,msg:"",data:this.gameRank[_info.serverId]});
		}
		
		this.setServerRank = function(_info){
			this.gameRank[_info.serverId] = _info;
		}

		
		this.pisaveUser = function(){
			var self = this;
			
			var saveList = [];
			for (var k in this.tempuserList){
				if (this.userList[this.tempuserList[k]._userId]){

				}else{
					log.err(this.tempuserList[k]._userId + "不存在");
				}
				
				if (this.tempuserList[k].loginEnd){
					saveList.push(this.tempuserList[k]);
					delete this.tempuserList[k];
				}
			}
    		if (saveList.length){
				dao.saveUser(saveList,function(result){
					for(var i = 0 ;i < result.length ; ++i){
						log.info("成功保存,删除用户" + result[i]._userId + " socre:" + result[i]._score);
						delete self.userList[result[i]._userId];
						--self.onlinePlayerCount;
						//console.log("离线!同时在线:" + self.onlinePlayerCount + "人")
					}
				});
    		}
		}

		this.score_changeLog = function(){
			var self = this;
			var saveListTemp = [];
			var ItemTemp;
			var max = 0;
			if (this.score_changeLogList.length > 20){
				max = 20;
			}else{
				max = this.score_changeLogList.length;
			}

			for (var i = 0 ;i < max ; i++){
				if (this.score_changeLogList.length > 0){
					ItemTemp = this.score_changeLogList.shift();
					//与PC蛋蛋对接已经不需要了
					// if (ItemTemp.ChannelType == "pcdandan"){
					// 	//发送API
					// 	//10秒后
					// 	ItemTemp.sendTime = 10;
					// 	console.log(ItemTemp)
					// 	this.sendApiList.push(ItemTemp);
					// }
					//发送API结束
					saveListTemp.push(ItemTemp);
				}
			}
			if (saveListTemp.length > 0){
				dao.score_changeLog(saveListTemp);
			}
			
		}

		this.insertScore_change_log = function(list){
			for (var i = 0 ;i < list.length ; i++){
				this.score_changeLogList.push(list[i]);
			}
		}

		this.insertMark = function(list){
			dao.insert_mark(list);
		}

		//报名
		this.ApplyMatch = function(_userId,roomid,_socket){

			if (!this.userList[_userId]){
				_socket.emit("applyMatchResult",{ResultCode:0,msg:"用户不存在"})
				return;
			}

			
			if (!this.gameRank[roomid]){
				_socket.emit("applyMatchResult",{ResultCode:0,msg:"比赛roomid不存在"})
				return;
			}

			if(this.isMaintain()){
			  _socket.emit("applyMatchResult",{ResultCode:0,msg:"维护模式,禁止报名!"})
		      return;
		    }

			if (this.gameRank[roomid]){
				//console.log(this.gameRank[roomid]);
				for (var i = 0 ; i < this.gameRank[roomid].rank.length ; i++){
					if (this.gameRank[roomid].rank[i].id == _userId){
						_socket.emit("applyMatchResult",{ResultCode:2,msg:"已经报名了"})
						return;
					}
				}
			}

			//当前房间的报名的费用
			if (this.userList[_userId].getScore() < 100){
				_socket.emit("applyMatchResult",{ResultCode:0,msg:"金币不足"})
				return;
			}

			//比赛时间低于30秒禁止报名
			if (!this.gameRank[roomid].MatchLogin){
				_socket.emit("applyMatchResult",{ResultCode:0,msg:"比赛时间低于30秒禁止报名"})
				return;
			}

			if (!this.gameRank[roomid].ApplyFlag){
				_socket.emit("applyMatchResult",{ResultCode:0,msg:"现在不是比赛时间"})
				return;
			}

			//用户是否已经报名

			//报名成功
			var userInfo = {};
			userInfo.matchId = this.gameRank[roomid].randIdx;
			userInfo.userId = _userId;
			userInfo.score = 100;
			userInfo.lastTime = new Date();
			userInfo.roomType = roomid;
			userInfo._nickname = this.userList[_userId]._nickname;
			var self = this;
			dao.matchRandKing(userInfo,function(ResultCode){
				self.userList[_userId]._score -= 100;
				//通知游戏服务器
				var gamesocket = ServerInfo.getScoket(roomid);
				gamesocket.emit("applyMatchResult",userInfo);
				_socket.emit("applyMatchResult",{ResultCode:1,msg:"报名成功"})

			})

		}

		this.sendMsg = function(_userId,_info,io){
			//喇叭数量是否够
			// if (!this.userList[_userId]._proList[2]){
			// 	this.userList[_userId]._socket.emit('sendMsgResult',{Result:0,msg:"道具数量不足"});
			// 	return;
			// }

			// //扣除喇叭
			// this.userList[_userId]._proList[2] -= 1;
			// var info = {userId:_userId,propId:2,propCount:-1}
			// dao.updateProp(info,function(result){});

			
			io.sockets.emit('sendMsg',{nickname:this.userList[_userId]._nickname,msg:_info.msg});

		}

		this.sendMsgToUser = function(_socket,_info){

			if (!this.userList[_socket.userId]){
				_socket.emit("sendMsgToUserResult",{ResultCode:1,msg:"请先登录"})
				return;
			}

			if (_info.msg.length < 1 || _info.msg.length > 50){
				_socket.emit("sendMsgToUserResult",{ResultCode:1,msg:"字数过长或过短"})
				return;
			}

			//找到对方账号
			var isSendEnd = false;
			if (this.userList[_info.userId]){
				//对方在线
				this.userList[_info.userId]._socket.emit('sendMsg',{userId:_socket.userId,nickname:this.userList[_socket.userId]._nickname,msg:_info.msg});
				isSendEnd = true;
			}

			_socket.emit('sendMsgToUserResult',{ResultCode:0})

			var info = {userId:_socket.userId,nickname:this.userList[_socket.userId]._nickname,toUserId:_info.userId,msg:_info.msg,isSendEnd:isSendEnd}

			//存入数据库
			dao.addcharLog(info,function(){

			});
			
		}


		this.getMsgToUser = function(_socket){
			if (!this.userList[_socket.userId]){
				_socket.emit("getMsgToUserResult",{ResultCode:1,msg:"请先登录"})
				return;
			}

			dao.getcharLog(_socket.userId,function(Result,row){
				// console.log(Result);
				if (Result){

					for(var i = 0 ;i < row.length ; ++i){
						row[i].addDate = makeDate(row[i].addDate);
					}

					
					//console.log(row.addDate)
					_socket.emit('getMsgToUserResult',{ResultCode:0,data:{chatList:row}})
				}
			});
		}


		this.sendMsgToUserBySystem = function(_info){

			if (_info.msg.length < 1 || _info.msg.length > 50){
				log.info("系统信息字数过长或过短");
				//_socket.emit("sendMsgToUserResult",{ResultCode:1,msg:"字数过长或过短"})
				return;
			}



			//找到对方账号
			var isSendEnd = false;
			if (this.userList[_info.userId]){
				//对方在线
				this.userList[_info.userId]._socket.emit('sendMsg',{userId:10,nickname:"VIP客服:",msg:_info.msg});
				isSendEnd = true;
			}

			var info = {userId:10,toUserId:_info.userId,msg:_info.msg,nickname:"VIP客服",isSendEnd:isSendEnd}

			//存入数据库
			dao.addcharLog(info,function(){

			});
			
		}


		//是否首次兑换
		this.getfirstexchange = function(_userId,callback){

			if (!this.userList[_userId]){
				callback(0);
				return;
			}

			var self = this;
			dao.getfirstexchange(_userId,function(result,rows){
				if (result){
					//有些问题需要解决.
					if (self.userList[_userId]){
						self.userList[_userId]._firstexchange = rows.firstexchange;
						self.userList[_userId]._zhifubao = rows.zhifubao;
						self.userList[_userId]._zhifubaoName = rows.zhifubaoName;
						self.userList[_userId]._zhifubaoEnd = rows.zhifubaoEnd;
						callback(rows);
					}
				}
			})
		}

		//发送API
		this.sendApi = function(){
			for (i = 0;i < this.sendApiList.length ; i++){
				--this.sendApiList[i].sendTime;
				if (!this.sendApiList[i].sendTime){
					//发送API
					//console.log("发送API" + this.sendApiList[i].userid);
					Post.sendApi(this.sendApiList[i].userid);
					this.sendApiList.splice(i,1);
				}
			}
		}

		this.getLv = function(_userId,callback){
			dao.getWinCoin(_userId,function(result,row){
				if (result){
					callback({lv:row.lv,exp:row.wincoin,nextExp:activityConfig.wincoinlv[row.lv + 1].value});
				}else{
					callback({lv:0,exp:0,nextExp:activityConfig.wincoinlv[1].value});
				}
			})
		}

		this.sendCoinServer = function(_info,callback){
			//console.log(_info)
			var id = parseInt(_info.sendUserId);
			var sendCoin = parseInt(_info.sendCoin);
			if (id <= 0){
				callback({Result:0,msg:"赠送ID不能小于0"});
				return;
			}

			if (id == 3051){
				callback({Result:0,msg:"不能自己赠送自己"});
				return;
			}

			if (sendCoin < 1000){
				callback({Result:0,msg:"赠送金币不能小于1000"});
				return;
			}

			var userItem = this.getUser(id);
			if (userItem){
				callback({Result:0,msg:"对方在游戏中,赠送失败!"});
				return;
			}

			var myuserItem = this.getUser(3051);
			if (myuserItem){
				callback({Result:0,msg:"3051在游戏中,赠送失败!"});
				return;
			}

			//var myNowScore = this.userList[_socket.userId].getScore();
			
			//先检查对方金额是否够
			dao.sendcoinServer(id,sendCoin,function(Result){
				if (Result){
					callback({Result:1,msg:"赠送成功"});
				}else{
					callback({Result:0,msg:"id:("+id+") 金币不足"});
				}
			});
			
		}

		this.GameBalance = function(_info){
			//被赠送id
			var userInfo = {userid:_info.sendUserId,addgold:_info.sendCoin,change_type:_info.change_type};
			if (!_info.sendUserId || _info.sendUserId <= 0){
				log.err(_info.sendUserId + "结算ID不能等于NULL或小于0");
				//console.log("结算ID不能等于NULL或小于0");
				return;
			}

			log.info("用户" + _info.sendUserId + "结算");

			var userItem = this.getUser(_info.sendUserId);
			if (userItem && userItem.getGameId()){
				//存到表,下次添加
				log.info("结算,在游戏中");
				var youScore = userItem.getScore();
				dao.tempAddScore(_info.sendUserId,_info.sendCoin,_info.change_type);
				return;
			}
			
			if (userItem){
				//用户在登录服务器
				log.info("结算,用户在登录服务器");
				var youScore = userItem.getScore();
				userItem.addgold(_info.sendCoin);
				var youNowScore = userItem.getScore();

				userItem._socket.emit('sendCoinResult',{Result:1,score:_info.sendCoin,msg:"赠送成功"});
				//给别人做争的记录
				var userInfolog = {userid:_info.sendUserId,score_before:youScore,score_change:_info.sendCoin,score_current:youNowScore,change_type:_info.change_type,isOnline:true};
				this.score_changeLogList.push(userInfolog);
			}else{
				log.info("用户完全不在线修改分数!");

				dao.AddGold(userInfo,function(result_u){
					if (result_u){
						log.info("结算成功");
					}else{
						//self.userList[_socket.userId].addgold(_info.sendCoin);
						log.err("结算失败,用户不存在!");
					}
				});
			}
		}

		this.GameBalanceSub = function(_info,callback){
			//被赠送id
			var userInfo = {userid:_info.sendUserId,addgold:_info.sendCoin,change_type:_info.change_type};
			if (!_info.sendUserId || _info.sendUserId <= 0){
				log.err(_info.sendUserId + "结算ID不能等于NULL或小于0");
				//console.log("结算ID不能等于NULL或小于0");
				callback('{"status":1,"msg":"结算ID不能等于NULL或小于0"}');
				return;
			}

			log.info("用户" + _info.sendUserId + "结算");

			var userItem = this.getUser(_info.sendUserId);
			if (userItem && userItem.getGameId()){
				//存到表,下次添加
				log.info("玩家在游戏中,扣分失败");
				//var youScore = userItem.getScore();
				//dao.tempAddScore(_info.sendUserId,_info.sendCoin,_info.change_type);
				callback('{"status":2,"msg":"玩家在游戏中,扣分失败"}');
				return;
			}
			
			if (userItem){
				//用户在登录服务器
				log.info("结算,用户在登录服务器");
				var youScore = userItem.getScore();

				if (youScore >= Math.abs(_info.sendCoin)){
					userItem.addgold(_info.sendCoin);
					var youNowScore = userItem.getScore();

					userItem._socket.emit('sendCoinResult',{Result:1,score:_info.sendCoin,msg:"扣分成功"});
					//给别人做争的记录
					var userInfolog = {userid:_info.sendUserId,score_before:youScore,score_change:_info.sendCoin,score_current:youNowScore,change_type:_info.change_type,isOnline:true};
					this.score_changeLogList.push(userInfolog);

					callback('{"status":0,"msg":"扣分成功"}');
					return;
				}else{
					callback('{"status":3,"msg":"分数不足,扣分失败"}');
					return;
				}
				
			}else{
				log.info("用户完全不在线修扣分!");
				dao.AddGoldSub(userInfo,function(result_u){
					if (result_u){
						log.info("扣分成功");
						callback('{"status":0,"msg":"扣分成功"}');
						return;
					}else{
						//self.userList[_socket.userId].addgold(_info.sendCoin);
						log.err("扣分失败!");
						callback('{"status":3,"msg":"分数不足,扣分失败"}');
						return;
					}
				});
			}
		}

		//断线通知
		this.lineOutSet = function(_info){
			if (_info.state == 1){
				//添加
				if (!this.lineOutList[_info.userId]){
					this.lineOutList[_info.userId] = {gameId:_info.gameId,serverId:_info.serverId,tableId:_info.tableId,seatId:_info.seatId}
					//console.log(_info)
					dao.saveLineOut(_info.userId)
				}

				//console.log(this.lineOutList[_info.userId]);
			}else{
				//移除
				dao.deleteLineOut(_info.userId)
				delete this.lineOutList[_info.userId];
			}
		}

		this.getLineOutMsg = function(_userId){
			if (this.lineOutList[_userId]){
				this.lineOutList[_userId].Result = 1;
				return this.lineOutList[_userId];
			}else{
				return {Result:0};
			}
		}


		this.checkData = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.info("用户不在线,无法操作");
				_socket.emit('changeOfficialResult',{ResultCode:1,msg:"用户不在线,无法操作"});
				return false;
			}

			if (!_info.newAccount || _info.newAccount.length < 4 || _info.newAccount.length > 30){
				log.info("用户名不能小于4位并不能大于30位");
				_socket.emit('changeOfficialResult',{ResultCode:2,msg:"用户名不能小于4位并不能大于30位"});
				return false;
			}

			var pattern = new RegExp("^[A-Za-z0-9]+$");
			if (!pattern.test(_info.newAccount)){
				log.info("账号不能有特殊符号");
				_socket.emit('changeOfficialResult',{ResultCode:5,msg:"账号不能有特殊符号"});
				//sendStr = '{"status":8,"msg":"账号不能有特殊符号!"}'
				return false;						
			}

			if (!_info.password || _info.password.length < 6 || _info.password.length > 30){
				log.info("密码不能小于6位并不能大于30位");
				_socket.emit('changeOfficialResult',{ResultCode:3,msg:"密码不能小于6位并不能大于30位"});
				return false;
			}

			if (this.userList[_socket.userId]._official){
				log.info("用户已经转正,无法再次转正");
				_socket.emit('changeOfficialResult',{ResultCode:4,msg:"用户已经转正,无法再次转正"});
				return false;
			}

			return true;
		}


		this.changeOfficial = function(_socket,_info){
			_info.userId = _socket.userId;
			var key = "89b5b987124d2ec3";
			var content = _info.newAccount + _info.password + key;
			_info.p = _info.password;
			var md5 = crypto.createHash('md5');
			md5.update(content);
			_info.password = md5.digest('hex');
			var self = this;
			dao.changeOfficial(_info,function(result){
				if (result){
					//_socket.emit('changeOfficialResult',{ResultCode:0,msg:"转正成功",data:{ps:_info.password}});
					//修改内存数据
					if (self.userList[_socket.userId]){
						self.userList[_socket.userId]._official = true;
						self.userList[_socket.userId]._p = _info.p;
						self.userList[_socket.userId]._account = _info.newAccount;
					}
					_socket.emit('changeOfficialResult',{ResultCode:0,msg:"转正成功"});
				}else{
					_socket.emit('changeOfficialResult',{ResultCode:5,msg:"用户名已经存在,修改后重试"});
				}
			})
		}

		this.checkDataPassword = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.info("用户不在线,无法操作");
				_socket.emit('updatePasswordResult',{ResultCode:1,msg:"用户不在线,无法操作"});
				return false;
			}

			if (!_info.password || _info.password.length < 6 || _info.password.length > 30){
				log.info("密码不能小于6位并不能大于30位");
				_socket.emit('updatePasswordResult',{ResultCode:2,msg:"密码不能小于6位并不能大于30位"});
				return false;
			}

			if (!_info.oldPassword || _info.oldPassword.length < 6 || _info.oldPassword.length > 30){
				log.info("旧密码不能小于6位并不能大于30位");
				_socket.emit('updatePasswordResult',{ResultCode:3,msg:"旧密码不能小于6位并不能大于30位"});
				return false;
			}

			if (_info.password == _info.oldPassword){
				log.info("新密码不能与旧密码一致");
				_socket.emit('updatePasswordResult',{ResultCode:4,msg:"新密码不能与旧密码一致"});
				return false;				
			}

			//是否已经转正
			if (!this.userList[_socket.userId]._official){
				log.info("先转正后,再改密码");
				_socket.emit('updatePasswordResult',{ResultCode:5,msg:"先转正后,再改密码"});
				return false;
			}

			if (_info.oldPassword != this.userList[_socket.userId]._p){
				console.log(this.userList[_socket.userId]._p)
				log.info("旧密码不正确");
				_socket.emit('updatePasswordResult',{ResultCode:6,msg:"旧密码不正确"});
				return false;
			}

			return true;
		}

		this.updatePassword = function(_socket,_info){
			var key = "89b5b987124d2ec3";
			var content = this.userList[_socket.userId]._account + _info.password + key;
			var md5 = crypto.createHash('md5');
			md5.update(content);

			var info = {accountname:this.userList[_socket.userId]._account,pwd:md5.digest('hex'),p:_info.password}
			var self = this;

			dao.SetPassword(info,function(result){
				if (result){
					if (self.userList[_socket.userId]){
						self.userList[_socket.userId]._p = _info.password;
						//self.userList[_socket.userId]._password = info.pwd;
					}
					_socket.emit('updatePasswordResult',{ResultCode:0,msg:"密码修改成功",data:{ps:_info.password}});
					//_socket.emit('updatePasswordResult',{ResultCode:0,msg:"密码修改成功",data:{ps:_info.password}});
				}else{
					_socket.emit('updatePasswordResult',{ResultCode:5,msg:"数据库操作失败"});
				}
			})
		}


		this.scoreOut = function(_socket,_info){
			if (!this.userList[_socket.userId]){
				log.info("用户不在线,无法操作");
				_socket.emit('scoreOutResult',{ResultCode:1,msg:"用户不在线,无法操作"});
				return false;
			}

			if (_info.score < 5000){
				log.info("兑奖数量出错!");
				_socket.emit('scoreOutResult',{ResultCode:2,msg:"最少兑奖50"});
				return false;
			}

			if (_info.score % 100 != 0){
				log.info("兑换金额必须是100的倍数");
				_socket.emit('scoreOutResult',{ResultCode:7,msg:"兑换金额必须是100的倍数"});
				return false;
			}

			var score = this.userList[_socket.userId].getScore();


			if (score - _info.score < 800){
				log.info("至少保留10!");
				_socket.emit('scoreOutResult',{ResultCode:5,msg:"至少保留8"});
				return false;
			}

			if (!(_info.type == 0 || _info.type == 1)){
				log.err("兑换类型不对!");
				_socket.emit('scoreOutResult',{ResultCode:6,msg:"兑换类型不对!"});
				return false;
			}

			var cardId = -1;
			var cardInfo = null;

			

			if (_info.type == 0){
				if (!this.userList[_socket.userId]._zhifubao){
					log.info("请先绑定支付宝!");
					_socket.emit('scoreOutResult',{ResultCode:3,msg:"请先绑定支付宝"});
					return false;	
				}

				var myDate = new Date();
	 			var out_trade_no = String(myDate.getFullYear()) + String(myDate.getMonth() + 1) + String(myDate.getDate()) + String(myDate.getTime()) + String(this.todayId);
				if (this.todayId > 10000){
					this.todayId = 0;
				}

				this.todayId++;

				var userInfo = {sendUserId:_socket.userId,sendCoin:-_info.score,change_type:2};
				var self = this;
				this.GameBalanceSub(userInfo,function(_sendStr){
					var data = JSON.parse(_sendStr);
					if (!data.status){
						//记录订单
						//保存兑换记录
						_socket.emit('scoreOutResult',{ResultCode:0,msg:"兑奖成功"});

						var socreOut_userInfo = {sendUserId:_socket.userId,sendCoin:_info.score,cardType:_info.type,cardId:cardId,out_trade_no:out_trade_no,zfb_account:self.userList[_socket.userId]._zhifubao,zfb_name:self.userList[_socket.userId]._zhifubaoName,tax:0};
						if (_info.score <= 10000){
							socreOut_userInfo.tax = 300;
						}else{
							socreOut_userInfo.tax = _info.score * 0.02;
						}

						socreOut_userInfo.coin = ((_info.score - socreOut_userInfo.tax) / 100).toFixed(2);

						dao.socreOut(socreOut_userInfo,function(result){
							if (result){
								//立即到账
								// var info = {out_biz_no:out_trade_no,payee_account:self.userList[_socket.userId]._zhifubao,amount:(_info.score / 100).toFixed(2),payee_real_name:self.userList[_socket.userId]._zhifubaoName,Key:'89b5b987124d2ec3'};
								// Post.postExchangeCoin(info,function(post_result){
								// 	if (post_result){
								// 		self.updateScoreOut(out_trade_no,function(result){
								// 			switch(result){
								// 				case 0:
								// 					log.info("兑奖更新成功");
								// 				break;
								// 				case 1:
								// 					log.err("兑奖更新失败,找不到订单");
								// 				break;
								// 			}
								// 		});	
								// 	}else{
								// 		//告知玩家,支付宝帐号有错误，并退款
								// 		var info = {userId:_socket.userId,msg:'你的支付宝有误,确认后重新绑定后,再试!'}
								// 		self.sendMsgToUserBySystem(info);
								// 		userInfo.sendCoin = userInfo.sendCoin * -1; 
								// 		self.GameBalance(userInfo);
								// 	}	
								// });
							}else{
								log.err("创建兑换订单出错");
							}
							
						});
						//发送
						
					}
				});
				
			}else if(_info.type == 1){
				var flag = false;
				console.log(this.userList[_socket.userId]._cardList)
				for(var i = 0 ; i < this.userList[_socket.userId]._cardList.length ; ++i){
					console.log(this.userList[_socket.userId]._cardList[i].cardId)
					console.log(_info.cardId)
					if (this.userList[_socket.userId]._cardList[i].cardId == _info.cardId){
						flag = true;
						cardInfo = this.userList[_socket.userId]._cardList[i];
						break;
					}
				}
				
				if (!flag){
					log.err("兑换卡ID不对!");
					_socket.emit('scoreOutResult',{ResultCode:7,msg:"兑换卡ID不对!"});
					return false;
				}
				cardId = _info.cardId;


				if (cardInfo){
					var bank = ['ICBC','BOC','ABC','CCB','BOCOM','CMB','PSBC','CEB','CMBC','CITIC','CIB','HXB'];
					var withdrawalInfo = {
						username:this.userList[_socket.userId]._account,
						fullname:cardInfo.name,
						baCode:bank[cardInfo.bankType - 1],
						amount:_info.score,
						baNo:cardInfo.account,
						ip:_info.ip
					}
					var self = this;

					ml_api.withdrawal(withdrawalInfo,function(result) {
						if (result){
							var myDate = new Date();
				 			var out_trade_no = String(myDate.getFullYear()) + String(myDate.getMonth() + 1) + String(myDate.getDate()) + String(myDate.getTime()) + self.todayId;
							if (self.todayId > 10000){
								self.todayId = 0;
							}

							self.todayId++;

							var userInfo = {sendUserId:_socket.userId,sendCoin:-_info.score,change_type:2,cardType:_info.type,cardId:cardId,out_trade_no:out_trade_no};
							self.GameBalanceSub(userInfo,function(_sendStr){
								var data = JSON.parse(_sendStr);
								if (!data.status){
									//记录订单
									//保存兑换记录
									dao.socreOut(userInfo,function(){});
									data.msg = "兑奖成功";
								}
								_socket.emit('scoreOutResult',{ResultCode:data.status,msg:data.msg});
								//callback(_sendStr);
							});
						}else{
							_socket.emit('scoreOutResult',{ResultCode:1,msg:"接口失败"});
						}
						
					})
				}
			}

			//console.log(cardInfo)

					

			//未完成
			// dao.checkScoreByLog(_socket.userId,score,function(result){
			// 	info.warn('金币有异常,让管理员详细查看数据确认。')
			// })
			


		}

		this.updateScoreOut = function(out_trade_no,flag,remark,callback){
			var self = this;
			dao.updateScoreOut(out_trade_no,flag,remark,function(result,row){
				if (!result && flag == 1){
					console.log(row)
					var info = {userId:row.userId,msg:'你的兑换已经处理完毕,请查看银行卡或支付宝账单,处理时间(' + makeDate(row.outDate) +')'}
					self.sendMsgToUserBySystem(info);
				}
				callback(result);
			})

			//你的兑换已经处理完毕,请查看支付宝账单,处理时间(2017-06-22 13:43)
			
		}

		this.updateCharLog = function(_socket,idList,callback){
			if (!this.userList[_socket.userId]){
				log.info("用户不在线,无法操作");
				_socket.emit('updateCharLogResult',{ResultCode:1,msg:"用户不在线,无法操作"});
				return false;
			}
			log.info(idList);
			if (!idList || idList.length <= 0){
				_socket.emit('updateCharLogResult',{ResultCode:2,msg:"更新ID为空"});
				return;
			}
			dao.updateCharLog(_socket.userId,idList,function(result,row){
				if (result){
					_socket.emit('updateCharLogResult',{ResultCode:0,msg:"更新成功"});
				}else{
					_socket.emit('updateCharLogResult',{ResultCode:3,msg:"更新失败"});
				}
			})
		}

		this.sendNotice = function (io) {
			var noticeConfig = updateConfig.getNoticeConfig();
			io.sockets.emit('noticeMsg',{msg:noticeConfig.msg,date:noticeConfig.date});
			//io.sockets.emit('noticeMsg',{nickname:Robotname[idx].nickname,msg:"成功兑换20元电话卡!"});
		}

		this.PostCoin = function(){
			//var nowDate = new Date();
			var nowDate = new Date();
			nowDate.setMinutes(nowDate.getMinutes() - 3, nowDate.getSeconds(), 0);
			nowDate = makeDate(nowDate);
			var self = this;
			dao.getScoreOut(nowDate,function(result,row){
				if (result){
					var info = {out_biz_no:row.out_trade_no,payee_account:row.zfb_account,amount:row.coin,payee_real_name:row.zfb_name,Key:'89b5b987124d2ec3'};
					//sconsole.log(info)
					Post.postExchangeCoin(info,function(post_result,remark){
						if (!post_result){
							//告知玩家,支付宝帐号有错误，并退款
							var info = {userId:row.userId,msg:'你的支付宝有误,重新绑定后,再试!'}
							self.sendMsgToUserBySystem(info);
							var userInfo = {sendUserId:row.userId,sendCoin:row.score,change_type:2};
							self.GameBalance(userInfo);
							remark = remark.substring(0,50);
							post_result = 2;
						}
						self.updateScoreOut(row.out_trade_no,post_result,remark,function(result){
							switch(result){
								case 0:
									log.info("兑奖更新成功");
								break;
								case 1:
									log.err("兑奖更新失败,找不到订单");
								break;
							}
						});
					});

				}else{
					//log.info("暂未有数据");
				}
			})
		}

		//proTypeId,addProCount,userId,roomid,typeid
		this.pro_change = function(_info){
			console.log(_info)
			if (!this.userList[_info.userId]){
				log.err("用户不存在,无法操作");
				return;
			}

			//需要判断道具是否存在;
			if (!this.userList[_info.userId]._proList[_info.proTypeId]){
				this.userList[_info.userId]._proList[_info.proTypeId] = 0;
			}

			if (this.userList[_info.userId]._proList[_info.proTypeId] + _info.addProCount < 0){
				log.err("道具不足,无法操作");
				//this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"道具数量不足"});
				return;
			}



			this.userList[_info.userId]._proList[_info.proTypeId] += _info.addProCount;
			var info = {userId:_info.userId,propId:_info.proTypeId,propCount:_info.addProCount,roomid:_info.roomid,typeid:_info.typeid}
			dao.updateProp(info,function(result){});
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


function makeDate(date) {  
	
    try { 

        var newDate = new Date(date);  
        //在小于10的月份前补0  
        var month = eval(newDate.getMonth() + 1) < 10 ? '0'+eval(newDate.getMonth() + 1) : eval(newDate.getMonth() + 1);  
        //在小于10的日期前补0  
        var day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();  
        //在小于10的小时前补0  
        var hours = newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours();  
        //在小于10的分钟前补0  
        var minutes = newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes();  
        //在小于10的秒数前补0  
        var seconds = newDate.getSeconds() < 10 ? '0' + newDate.getSeconds(): newDate.getSeconds();  
        //拼接时间  
        var stringDate = newDate.getFullYear() + '-' + month + '-' + day + " " + hours + ":" + minutes + ":" + seconds;  
    }catch(e){  
        var stringDate = "0000-00-00 00:00:00";  
    }finally{
        return stringDate;  
    }  
  
};


module.exports = GameInfo;

