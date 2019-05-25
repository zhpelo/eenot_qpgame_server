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

//读取文件包


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
			//log.info("test3" + "添加用户!");
			//log.info(userInfo)
			log.info("登录成功!userid:" + userInfo.Id + " Account:" + userInfo.Account);
			//用户登录游戏服务器的密码
			//
			var newDate = new Date();
			var key = "slezz;e3";
			var md5 = crypto.createHash('md5');
			var content = userInfo.Id + userInfo.score + newDate + key;
			var sign = md5.digest('hex');
			userInfo.sign = sign;

			//先判断原来用户是否在线,如果在线，强行断开
			if (this.userList[userInfo.Id]){
				//目前功能暂时停用
				log.info(this.userList[userInfo.Id].getGameId())
				if (this.userList[userInfo.Id].getGameId()){
					//1.只在游戏状态
					//先让游戏下线,然后再新开一个用户
					log.info("用户不应该在这里" + userInfo.Id);

					callback_a(0);
				}
				else{
					//2.只在登录服务器状态
					log.info("强制" + userInfo.Id + "下线");
				}
				
			}else{
				//在没有添加用户之前找到道具列表
				var self = this;
				dao.getPropByUserId(userInfo.Id,function(result,row){
					//完全不在线状态
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
						phoneNo:self.userList[userInfo.Id]._phoneNo};
					result = {resultid:'1',msg:'login succeed!',Obj:resultObj};

					var goCount = 0;
					
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

						if (self.userList[userInfo.Id]._score < 5000){
							dao.dongshanzaiqi(userInfo.Id,function(Result,k){
								//log.info(Result)
								//log.info(k)
								if (k){
									var youScore = self.userList[userInfo.Id]._score;
									self.userList[userInfo.Id]._score += 5000;
									result.Obj.score += 5000;
									var youNowScore = self.userList[userInfo.Id]._score;
									var userInfolog = {userid:userInfo.Id,score_before:youScore,score_change:5000,score_current:youNowScore,change_type:7,isOnline:false};
									self.score_changeLogList.push(userInfolog);
									socket.emit('dongshanzaiqi',{addCoin:5000,times:k});
								}
								//log.info(result);
								socket.emit('loginResult',result);
							 	++self.onlinePlayerCount;
							 	log.info("上线!同时在线:" + self.onlinePlayerCount + "人")
							 	callback_a(1);
							})
						}else{
							socket.emit('loginResult',result);
						 	++self.onlinePlayerCount;
						 	log.info("上线!同时在线:" + self.onlinePlayerCount + "人")
						 	callback_a(1);
						}

					})
				})

				// dao.getUseCoin(userInfo.Id,function(result,row){
				// 	if (result){
				// 		var i =0;
				// 		for (i = 0 ;i < activityConfig.bulletValue.length;i++){
				// 			if (row.useCoin < activityConfig.bulletValue[i].value){
				// 				if (i > 1){
				// 					row.useCoin -= activityConfig.bulletValue[i - 1].value;
				// 				}
				// 				break;
				// 			}						
				// 		}
				// 		socket.emit('fishUseCoin',{useCoin:row.useCoin,lv:row.getprizelv,nextExp:activityConfig.bulletValue[i].value,nextpropId:activityConfig.bulletValue[i].propId,nextpropCount:activityConfig.bulletValue[i].propCount});

				// 	}else{
				// 		socket.emit('fishUseCoin',{useCoin:0,lv:0,nextExp:activityConfig.bulletValue[0].value,nextpropId:activityConfig.bulletValue[0].propId,nextpropCount:activityConfig.bulletValue[0].propCount});
				// 	}
				// })
			}
			//log.info("test4" + "添加用户完毕!");
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
				if (this.userList[_userinfo.userId]){
					this.userList[_userinfo.userId].resetGame();
				}
			}
		}
		
		//删除用户
		this.deleteUser = function(_userinfo){
			//log.info("delete")
			//log.info(_userinfo)
			if (_userinfo.userId){
				//指定用户储存
				if (this.userList[_userinfo.userId] && !this.userList[_userinfo.userId].getGameId()){
					var score_change = _userinfo.userScore - this.userList[_userinfo.userId]._score;
					var score_before = this.userList[_userinfo.userId]._score;
					this.tempuserList[_userinfo.userId] = this.userList[_userinfo.userId];
					if (_userinfo.userScore != null){
						this.tempuserList[_userinfo.userId]._score = _userinfo.userScore;
						//储存玩家游戏金钱变化量
						if (!_userinfo.nolog){
							var info = {userid:_userinfo.userId,score_before:score_before,score_change:score_change,score_current:_userinfo.userScore,change_type:(_userinfo.gameId + 10),isOnline:true,ChannelType:this.userList[_userinfo.userId]._ChannelType}
							this.score_changeLogList.push(info);
						}
						//dao.score_changeLog(info);
					}

					// log.info("用户离开!userid:" + this.userList[_userinfo.userId]._userId
					// 	+ " Account:" + this.userList[_userinfo.userId]._account
					// 	+ " score:" + this.userList[_userinfo.userId]._score);
					// delete this.userList[_userinfo.userId];
					// --this.onlinePlayerCount;
					// log.info("离线!同时在线:" + this.onlinePlayerCount + "人")
				}

			}
		}

		this.deleteUserNoLoginGame = function(userid,flag){
			if (this.userList[userid]){
				//log.info("进入这里" + this.userList[userid].getRoomId())
				if (!this.userList[userid].getGameId() && !this.userList[userid]._ageinLogin){
					delete this.userList[userid];
					--this.onlinePlayerCount;
					log.info("未登录游戏离线!同时在线:" + this.onlinePlayerCount + "人")
				}

				if (flag){
					delete this.userList[userid];
					--this.onlinePlayerCount;
					log.info("未登录游戏离线!同时在线:" + this.onlinePlayerCount + "人")

				}
				//log.info(this.userList);
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
		
		//保存所有用户
		this.saveAll = function(){
			dao.saveAll(this.userList,function(Result){

			})
		}

		//用户是否在线
		this.IsPlayerOnline = function(_userId){
			if (!_userId){	//传输ID错误
				log.info("查询在线,参数错误");
				return 0;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//log.info("查询在线,未找到" + _userId + "用户");
				return 1;
			}else{
				return 0;
			}
		}

		//获得用户当前分数
		this.getPlayerScore = function(_userId,_callback){
			if (!_userId){	//传输ID错误
				log.info("查询分数,参数错误");
				return -1;
			}
			var sendStr;
			if (this.userList[_userId]) {//未找到用户
				if (this.userList[_userId].getGameId()){
					//游戏在线
					var gameScoket = ServerInfo.getScoket(this.userList[_userId].getGameId())
					gameScoket.emit('getgold',{userid:_userId})
					gameScoket.on('getgoldResult',function(msg){
						//log.info(msg);
						if (msg.Result){
							sendStr = msg.score.toString();
							_callback(sendStr);
						}else{
							sendStr = '{"status":1,"msg":"在线查询分数失败"}'
							_callback(sendStr);
						}
						gameScoket.removeAllListeners('getgoldResult');
					})
				}else{
					//只是在登录服务器
					sendStr = this.userList[_userId].getScore().toString();
					log.info(sendStr)
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
				log.info("加分,未登录")
				return 0;
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				log.info("加分,未登录")
				return 0
			}else{
				log.info(ServerInfo)
				var gameScoket = ServerInfo.getScoket(this.userList[_userId].getGameId())
				//log.info("1111");
				var self = this;
				gameScoket.emit('addgold',{userid:_userId,addgold:score})
				gameScoket.on('addgoldResult',function(msg){
					//log.info(msg);
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
		this.LoginGame = function(_userId,_sign,gametype){
			//用户添加游戏ID
			if (!this.userList[_userId]){
				log.info("用户" + _userId + "不存在");
				return {_userId:0,msg:"用户不存在"};
			} 

			//先获得是否在断线列表中****
			// var linemsg = this.getLineOutMsg(_userId);
   //          if (linemsg.Result){
   //            if (gametype != linemsg.serverId){
   //            	log.info("用户有在其他游戏中未退出!")
   //            	return {_userId:0,msg:"您还在游戏中未退出,请等待上一个牌局结束"};
   //            }
   //          }

            // if (this.userList[_userId].getGameId()){
            //   	return {_userId:0,msg:"您已经在其他游戏中了"};
            // }

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

				if (userInfo._Robot && userInfo._score < 50000){
					var score = Math.floor(Math.random()*30000000) + 100000;
					userInfo._score = score;
					this.userList[_userId]._score = score;
				}else if (userInfo._Robot && userInfo._score > 300000000){
					var score = Math.floor(Math.random()*30000000) + 100000;
					userInfo._score = score;
					this.userList[_userId]._score = score;
				}
				log.info(_userId + "成功进入游戏:" + gametype);
				return userInfo;
			}else{
				log.info("用户" + _userId + "密码错误!");
				return {_userId:0,msg:"密码错误!"};
			}

		}

		this.addLoginList = function(user){
			//已经存在删掉前面的push后面的
			//列队状态1.排队,2.离线中,3.登录中，5.完成登录
			this.deleteLoginList(user.userName)
			user.state = 1;
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
						log.info("用户在线" + this.userList[this._loginList[i].id].getGameId())
						var gameScoket = ServerInfo.getScoket(this.userList[this._loginList[i].id].getGameId())
						this.userList[this._loginList[i].id]._socket.disconnect();
						gameScoket.emit('disconnectUser',{userId:this._loginList[i].id})
						this._loginList[i].state = 2;

					//this.userList[userInfo.Id].changeSocke(socket,sign);
					}
					else{
						log.info("用户只在登录服务器")
						//先判断socket 是否有真的连接
						if (this.userList[this._loginList[i].id]._socket.connected){
							this.userList[this._loginList[i].id]._socket.disconnect();
							this._loginList[i].state = 2;
						}else{
							delete this.userList[this._loginList[i].id];
							//--this.onlinePlayerCount;
							//log.info("离线!同时在线:" + this.onlinePlayerCount + "人")
						}
					}
				}else{
					//完全不在线了,再让他登录一下
					log.info("完全下线了")
					var self = this;
					this._loginList[i].state = 3;
				    dao.login(this._loginList[i],this._loginList[i].socket,function(rows){
				      if (rows){
				      		//如果状态不为3
				      		if (self.getLoginState(rows.Account,3)){
				      			//如果状态为3,才添加
				      			self.addUser(rows,rows.socket,function(rusult){
				      				self.deleteLoginList(rows.Account);
				          			log.info("完成添加")
				          			//发送服务器列表
				          			rows.socket.emit('ServerListResult',{GameInfo:ServerInfo.getServerAll()});
				          			
				          			self.getSendPrize(rows.Id,function(result){

						            	rows.socket.emit('prizeListResult',{prizeList:result});
						            })
						            //发送每日活动信息
						            self.getdaySendPrize(rows.Id,function(result){
						              rows.socket.emit('dayListResult',{nowday:result.nowday,getcoin:result.getcoin,unclaimedList:result.list});
						            })

						            //是否有首次兑换
						            self.getfirstexchange(rows.Id,function(result){
						              rows.socket.emit('firstExchagerResult',{firstExchager:result.firstexchange});
						            })

						            //发送等级信息
						            self.getLv(rows.Id,function(result){
						              //log.info(result)
						              rows.socket.emit('lv',result);
						            })

						            var linemsg = self.getLineOutMsg(rows.Id);
						            if (linemsg.Result){
						              rows.socket.emit('lineOutMsg',{gameId:linemsg.gameId,serverId:linemsg.serverId,tableId:linemsg.tableId,seatId:linemsg.seatId});
						            }

						            if (gameConfig.recharge_first){
						              //首充信息
						              self.firstrecharge(rows.Id,function(result){
						                //log.info(result)
						                result.addPropId = 0;
						                result.addPropCount = 0;
						                rows.socket.emit('firstrecharge',result);
						              })
						            }
          						});

				      		}else{
				      			log.info("状态不为3,又重新登录了")
				      		}
				          
				      }else{
				        var result = {};
				        result = {resultid:'0',msg:'Account or password error,login fail!'};
				        this._loginList[i].socket.emit('loginResult',result);
				        //log.info(user.userName + "登录失败");
				      }
				    })
										
				}
			}
		}

		//是否每日首次充值
		this.firstrecharge = function(_userId,callback){
			if (!this.userList[_userId]){
				callback(0);
				return;
			}

			var self = this;
			dao.firstrecharge(_userId,function(result,rows){
				if (result){
					//self.userList[_userId]._firstexchange = rows.firstexchange;
					callback(rows);
				}
			})
		}

		//更新首充
		this.updateFirstRecharge = function(info){
			//先获得数据
			var selfinfo = info;
			var self = this;
			dao.updateFirstrecharge(info.userId,info.goodsid,function(result,rows){
				if (result){
					log.info(rows);
					//处理赠送
					var addCount = 0;
					var addScore = 0;
					if (rows.c_first){
						addCount += 50; 
					}
					if (rows.c_any){
						addCount += 10; 
					}

					if (rows.c_goods1){
						addScore += 60000; 
					}
					if (rows.c_goods2){
						addScore += 180000; 
					}
					if (rows.c_goods3){
						addScore += 500000; 
					}
					if (rows.c_goods4){
						addScore += 1000000; 
					}
					if (rows.c_goods5){
						addScore += 2000000; 
					}

					//加钱
					if (addScore){
						var userInfo = {sendUserId:selfinfo.userId,sendCoin:addScore,change_type:0};
						//console.log(userInfo)
						self.GameBalance(userInfo);
					}

					
					if (addCount > 0){
						var info1 = {userId:selfinfo.userId,propId:1,propCount:addCount,roomid:0,typeid:5}
						dao.updateProp(info1,function(result){});
					}

					if (self.userList[selfinfo.userId]){
						self.userList[selfinfo.userId]._proList[1] += addCount;
						self.userList[selfinfo.userId]._socket.emit("firstrecharge",{first:rows.first,any:rows.any,addPropId:1,addPropCount:addCount,goods1:rows.goods1,goods2:rows.goods2,goods3:rows.goods3,goods4:rows.goods4,goods5:rows.goods5});
					}
				}
			})
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

			// var firstValue = 1;
			// if (!this.userList[_userId]._firstexchange){
			// 	firstValue = 0.5
			// }

			_info.deleteCount = _info.proCount * 10;
			if (this.userList[_userId]._proList[1] < _info.deleteCount){
				this.userList[_userId]._socket.emit('exchangeResult',{Result:0,msg:"道具数量不足"});
				return;
			}

			var info = {
				Type:'A1',
 				Account:this.userList[_userId]._userId,
 				PhoneNo:this.userList[_userId]._phoneNo,
 				OrderId:'1',
 				CardNum:_info.proCount,
 				Key:'89b5b987124d2ec3'
 			}

 			//this.userList[_userId]._firstexchange = true;
			
			//调用接口
			//返回后
			//发送兑换结果
			//减掉道具
			//存储兑换记录
			var self = this;
			Post.postExchange(info,function(rusult){
				if (rusult){
					self.userList[_userId]._proList[1] -= _info.deleteCount;
					//var myNowScore = self.userList[_userId]._score;
					//self.userList[_userId]._score -= (cost * firstValue);
					//var NowScore = self.userList[_userId]._score;
					//log.info(self.userList[_userId]._score)
					var info = {userId:_userId,propId:1,propCount:-_info.deleteCount,roomid:0,typeid:2}
					dao.updateProp(info,function(result){});
					//dao.updateFirstexchange(_userId);

					//var score_change = parseInt(cost * firstValue);
					//var userInfo = {userid:_userId,score_before:myNowScore,score_change:-score_change,score_current:NowScore,change_type:4,isOnline:true};
					//self.score_changeLogList.push(userInfo);

					self.userList[_userId]._socket.emit('exchangeResult',{Result:1,msg:"兑换成功",deleteCount:-_info.deleteCount,deleteCoin:0});
					io.sockets.emit('sendMsg',{nickname:self.userList[_userId]._nickname,msg:"成功兑换" + _info.proCount + "元电话卡!"});

				}

			});
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

				var info = {userId:_info.sendUserId,winPropId:0,winPropCount:0,winScore:_info.sendCoin,type:1,sendCoinUserId:_socket.userId,nickName:this.userList[_socket.userId]._nickname};
				this.sendEmail(info);

				//给自己做钱的记录
				var score_change = parseInt(_info.sendCoin);
				var userInfo = {userid:_socket.userId,score_before:myNowScore,score_change:-score_change,score_current:myNowScore - score_change,change_type:3,isOnline:true};
				this.score_changeLogList.push(userInfo);

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
			if (parseInt(_info.userId, 10) != _info.userId && _info.userId < 1){
				_socket.emit('checkNickNameResult',{Result:0,msg:"检测ID错误"});
				return;
			}
			var self = this;
			dao.checkNickName(_info.userId,function(result,nickName){
				if (self.userList[_socket.userId]){
				if (result){
						self.userList[_socket.userId]._socket.emit("checkNickNameResult",{resultCode:1,nickName:nickName});
					}else{
						self.userList[_socket.userId]._socket.emit("checkNickNameResult",{resultCode:0,nickName:""});	
					}
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
						if (self.userList[info.userId]._prize){
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
					_socket.emit('bindPhoneResult',{Result:0,msg:"无法写入数据库"});
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
				self.userList[_userId]._prize = values;
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
				//log.info(rows.length)
				if (result){
					//log.info(rows)
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
				self.userList[_userId]._dayprize = values;
				resultBack.list = values;
				if (!resultBack.nowday){
					resultBack.nowday = 1;
				}
				if (!resultBack.getcoin){
					resultBack.getcoin = 0;
				}
				//log.info(resultBack);
				callback(resultBack);
			})
		}

		//领奖
		this.getPrize = function(_socket,_info){

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
						//内存添加金币
						this.userList[_socket.userId].addgold(prize[i].winScore);

						var myAfScore = this.userList[_socket.userId].getScore();
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
								if (self.userList[rows[i].userId]._prize){
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
				//log.info(values);

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
			var saveList = this.tempuserList;
			dao.saveUser(this.tempuserList,function(result){
				for(var idx in saveList){
					log.info("删除用户" + idx);
					delete self.tempuserList[idx];
					delete self.userList[idx];
					--self.onlinePlayerCount;
					log.info("离线!同时在线:" + self.onlinePlayerCount + "人")
				}
			});
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
					// 	log.info(ItemTemp)
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
				//log.info(this.gameRank[roomid]);
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

			if (this.userList[_userId]){
				io.sockets.emit('sendMsg',{nickname:this.userList[_userId]._nickname,msg:_info.msg});
			}
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
					self.userList[_userId]._firstexchange = rows.firstexchange;
					callback(rows);
				}
			})
		}

		//发送API
		this.sendApi = function(){
			for (i = 0;i < this.sendApiList.length ; i++){
				--this.sendApiList[i].sendTime;
				if (!this.sendApiList[i].sendTime){
					//发送API
					//log.info("发送API" + this.sendApiList[i].userid);
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
			log.info(_info)
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
				log.info("结算ID不能等于NULL或小于0");
				return;
			}

			log.info("用户" + _info.sendUserId + "结算")

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
						log.info("结算失败,用户不存在!");
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
					//log.info(_info)
					dao.saveLineOut(_info.userId)
				}

				//log.info(this.lineOutList[_info.userId]);
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

		//充值
		this.recharge = function(_userId,_socket,Info){
		//先获得自己的账号,openId
			if (this.userList[_userId]){
				//生成订单号
				var myDate = new Date();
 				var out_trade_no = String(myDate.getFullYear()) + String(myDate.getMonth() + 1) + String(myDate.getDate()) + String(myDate.getTime()) + this.todayId;
				if (this.todayId > 10000){
					this.todayId = 0;
				}

				this.todayId++;
				var userInfo = {userId:_userId,Account:this.userList[_userId]._account,total_fee:Info.total_fee,out_trade_no:out_trade_no,goodsid:Info.goodsId};
				var self = this;
				//直接操作数据库
				dao.create_rechargeSDK(userInfo,function(Rusult){
					if (Rusult){
					//成功
						_socket.emit("rechargeResult",{Result:0,data:{goodsId:Info.goodsId,out_trade_no:out_trade_no,openId:self.userList[_userId]._account}});
					}
					else{
					//失败
						log.err("充值失败");
					}
					//callback(sendStr);
				});
			}else{
				log.err("充值,用户不存在");
			}
		}

		//运行初始化
		this.init();
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

