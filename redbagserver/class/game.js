var User = require("./User");
var gameDao = require("./../dao/gameDao");
var sever = require("./sever");
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
			//红包列表数据
			this.sendBagList = [];
			//红包等待发送列表
			this.watiSendBagList = [];
			//查看红包列表
			this.viewBagList = [];
			//红包ID
			this.redbagId = 0;

			//在线人数为0
			this.onlinePlayerCount = 0;
			//统计
			this.winTotal = 0;

			//维护模式
			this.maintain = false;
			this._io = {};
			this.GameList = new Array();
			this.matchRandKingList = [];

			this.lineOutList = {};

			this.score_changeLogList = [];

			this.sendBegCount = 0;

			var self = this;

			//获得比赛最大ID
			gameDao.getRedbagId(function(_maxId){
				//初始化捕鱼
				self.redbagId = _maxId + 1;
			})

			this.robotTotalNum = 0;
			//获得机器人池
			gameDao.getPool(function(robotTotalNum){
				self.robotTotalNum = robotTotalNum;
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
				//减少红包时间
				for(var i = 0 ; i< self.sendBagList.length ; i++){
					if (self.sendBagList[i].isDown <= 0){

						if (self.viewBagList.length > 100){
							self.viewBagList.shift();
						}
						var redbag = self.sendBagList.splice(i,1)[0];
						//红包还有余额反钱
						self.returnCoin(redbag);
						
						self.viewBagList.push(redbag);
					}else{
						--self.sendBagList[i].isDown;
					}
				}

				//发送
				if (self.watiSendBagList.length > 0 && self.sendBegCount < gameConfig.sendRedBagMax){
					var redbag = self.watiSendBagList.shift();
					self.sendBagList.push(redbag);
					self.noticeBag(redbag);
					self.sendBegCount++;
				}
				self.score_changeLog();

			});
		}

		//创建包
		this.createBag = function(_redbag){
			//先初始化9个包的尾数
			if (_redbag.robot){
				console.log("机器人发包")
				this.robotTotalNum -= _redbag.remainMoneyMax;
				//console.log(this.robotTotalNum);
			}
			var valuetotal = 0;
			var redbagEndNum = [];

			if (this.robotTotalNum < -1000000 && !Math.floor(Math.random()*10) && _redbag.robot){
				//console.log("作弊")	
				redbagEndNum[Math.floor(Math.random()*10)] = _redbag.boomNum;
			}

			for(var i = 0; i < 9 ; i++){
				if (!redbagEndNum[i]){
					redbagEndNum[i] = Math.floor(Math.random()*10) + 1;
					if (this.robotTotalNum > 1000000 && !Math.floor(Math.random()*10) && redbagEndNum[i] == _redbag.boomNum && _redbag.robot){
						//console.log("反作弊")
						++redbagEndNum[i];
					}
					
				}
				valuetotal += redbagEndNum[i];
			}

			//计算第10个包
			if (valuetotal % 10){
					var remain = 10 - (valuetotal % 10);
					redbagEndNum[9] = remain;
			}else{
				redbagEndNum[9] = 0;
			}
			valuetotal += redbagEndNum[9];

			var tempRedBag = {remainMoney:(Math.floor(_redbag.remainMoney / 10) - Math.floor(valuetotal / 10)),sendBagNum:10}

			for(var i = 0; i < 10 ; i++){
				redbagEndNum[i] += this.getMoney(tempRedBag) * 10;

			}

			_redbag.bagList = redbagEndNum;
		}

		//获得包的金额
		this.getBag = function(redbag){
			--redbag.sendBagNum;
			return redbag.bagList[redbag.sendBagNum];
		}

		//发布发包
		this.noticeBag = function(redbag){
			//通知全桌人自己上庄
			var tablestring  = "table" + redbag.tableid;
			var tempNotice = {redbagId:redbag.redbagId,userId:redbag.userId,sendBagCoin:redbag.sendBagCoin,boomNum:redbag.boomNum,nickname:redbag.nickname,headimgurl:redbag.headimgurl}
			this._io.sockets.in(tablestring).emit('noticeRedBag', tempNotice);
		}

		//发红包
		this.sendRedBag = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"发红包失败,用户不存在"});
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;
			if (tableid < 0){
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			if (info.boomNum > 9 || info.boomNum < 0 || parseInt(info.boomNum, 10) != info.boomNum){
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"炸弹数不正确"});
				return;
			}

			//判断单包金币是否满足条件
			if (info.coin < gameConfig.coinConfigMin){
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"不满足发包要求,最少发" + gameConfig.coinConfigMin + "金币红包"});
				return;
			}

			//红包列队是否已经满
			if (this.watiSendBagList.length > gameConfig.redbagListMax){
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"发包数量已经满"});
				return;				
			}
			var youScore = this.userList[_socket.userId].getScore();
			//扣掉自己的钱
			if (!this.userList[_socket.userId].downCoin(info.coin)){
				_socket.emit("sendRedBagResult", {ResultCode:0,msg:"没有足够的金币"});
				return;
			}


			var youNowScore = this.userList[_socket.userId].getScore();
			var userInfolog = {userid:_socket.userId,score_before:youScore,score_change:-info.coin,score_current:youNowScore,change_type:8,isOnline:true};
			this.score_changeLogList.push(userInfolog);

			//税收
			var remainMoney = Math.floor((info.coin / 10) * gameConfig.tax) * 10;
			var tax = info.coin - remainMoney;
			var tableid = this.userList[_socket.userId].getTable();
			var url = 0;
			if (this.userList[_socket.userId]._headimgurl){
				url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_socket.userId]._headimgurl);
			}
			var redbag = {redbagId:this.redbagId,userId:_socket.userId,sendBagCoin:info.coin,remainMoney:remainMoney,remainMoneyMax:remainMoney,sendBagNum:gameConfig.sendBagNumMax,nickname:this.userList[_socket.userId]._nickname,isDown:60,boomNum:info.boomNum,lootBagList:[],bagList:[],redbagWin:0,tax:tax,tableid:tableid,balance:false,headimgurl:url,robot:this.userList[_socket.userId]._Robot}
			this.createBag(redbag);
			this.watiSendBagList.push(redbag);

			gameDao.redbaglog(redbag);

			_socket.emit("sendRedBagResult", {ResultCode:1,msg:"成功申请发包",sendBagCoin:info.coin});

			++this.redbagId;
		}

		//抢包
		this.lootRedBag = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}

			if (this.userList[_socket.userId].TableId < 0){
				console.log("用户没有进入桌子");
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			var hereRedBag = null;
			for(var i = 0 ; i < this.sendBagList.length ; i++){
				if (this.sendBagList[i].redbagId == info.redBagId){
					hereRedBag = this.sendBagList[i];
					break;
				}
			}

			if (!hereRedBag){
				for(var i = 0 ; i < this.viewBagList.length ; i++){
					if (this.viewBagList[i].redbagId == info.redBagId){
						hereRedBag = this.viewBagList[i];
						break;
					}
				}
			}

			if (!hereRedBag){
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"抢包ID错误",redbagId:info.redBagId});
				console.log("抢包ID错误")
				return;
			}

			if (hereRedBag.isDown <= 0){
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"此包时间已过",redbagId:info.redBagId});
				return;
			}

			if (hereRedBag.sendBagNum <= 0){
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"此包已经被抢光",redbagId:info.redBagId});
				return;
			}

			if (this.userList[_socket.userId].getScore() < hereRedBag.sendBagCoin){
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"金币不足无法抢包",redbagId:info.redBagId});
				return;
			}

			var flag = false;
			for(var i = 0; i < hereRedBag.lootBagList.length ; i++){
				if (hereRedBag.lootBagList[i].userId == _socket.userId){
					flag = true;
					break;
				}
			}

			if (flag){
				_socket.emit("lootRedBagResult", {ResultCode:0,msg:"此红包已经抢过了!",redbagId:info.redBagId});
				return;
			}

			var myScore = this.userList[_socket.userId].getScore();

			var getCoin = this.getBag(hereRedBag);
			var winscore = 0;
			var lostCoin = 0;
			console.log("获得:" + getCoin);
			if ((getCoin % 10) == hereRedBag.boomNum){
				winscore = (getCoin - hereRedBag.sendBagCoin);
				hereRedBag.redbagWin += hereRedBag.sendBagCoin;
				lostCoin = hereRedBag.sendBagCoin;

				if (hereRedBag.robot){
					this.robotTotalNum += hereRedBag.remainMoneyMax;
				}
			}else{
				winscore = getCoin;
				lostCoin = 0;
			}

			//加钱
			this.sendCoinByUser(_socket.userId,winscore);
			//console.log(_socket.userId + "|" + this.userList[_socket.userId]._nickname + "|" + this.userList[_socket.userId]._userId)
			hereRedBag.lootBagList.push({userId:_socket.userId,nickname:this.userList[_socket.userId]._nickname,getCoin:getCoin,winscore:winscore});

			//如果等于0个包,就发钱给包主
			if (!hereRedBag.sendBagNum){
				this.returnCoin(hereRedBag);
			}

			//var tableid = this.userList[_socket.userId].getTable();

			//var tablestring  = "table" + tableid;

			//_socket.broadcast.to(tablestring).emit('otherDownCoin', {userNickname:this.userList[_socket.userId]._nickname,selectId:info.selectId,downCoin:gameConfig.coinConfig[info.chips]});
			//console.log(hereRedBag)
			//var redbagtemp = {userId:hereRedBag.userId,nickname:hereRedBag.nickname,sendBagCoin:hereRedBag.sendBagCoin,boomNum:hereRedBag.boomNum,headimgurl:hereRedBag.headimgurl,lootBagList:hereRedBag.lootBagList}
			var redbagtemp = {userId:hereRedBag.userId,redbagId:hereRedBag.redbagId,sendBagCoin:hereRedBag.sendBagCoin,boomNum:hereRedBag.boomNum,winscore:winscore,lootBagList:hereRedBag.lootBagList}
			_socket.emit("lootRedBagResult", {ResultCode:1,redbag:redbagtemp});
		}

		this.returnCoin = function(hereRedBag){
			if (!hereRedBag.balance){
				//设置税金
				var redbagWin = 0;
				if (hereRedBag.redbagWin > hereRedBag.sendBagCoin){
					redbagWin = Math.floor((hereRedBag.redbagWin - hereRedBag.sendBagCoin) * gameConfig.tax) + hereRedBag.sendBagCoin;
					console.log(redbagWin);
				}else{
					redbagWin = hereRedBag.redbagWin;
				}

				hereRedBag.tax += hereRedBag.redbagWin - redbagWin;
				//记录被抢记录
				gameDao.lootbaglog(hereRedBag);

				//console.log(hereRedBag.bagList);
				for(var i = 0; i < hereRedBag.sendBagNum ; i++){
					redbagWin += hereRedBag.bagList[i];

					if (hereRedBag.robot){
						this.robotTotalNum += hereRedBag.bagList[i];
					}
				}

				if (hereRedBag.robot){
					gameDao.setPool(this.robotTotalNum)
				}
				//console.log(this.robotTotalNum);
				//更新当前红包的收益情况
				gameDao.updateRedBag({earnings:redbagWin - hereRedBag.sendBagCoin,redbagId:hereRedBag.redbagId});
				console.log("红包结束")
				//加钱
				this.sendCoinByUser(hereRedBag.userId,redbagWin);
				//给包主发信息
				if (this.userList[hereRedBag.userId]){
					this.userList[hereRedBag.userId]._socket.emit("redbagEnd",{redbagId:hereRedBag.redbagId,winScore:redbagWin,earnings:redbagWin - hereRedBag.sendBagCoin})
				}
				hereRedBag.balance = true;
				--this.sendBegCount;
			}
		}

		this.checkRedBag = function(_socket,info){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}

			if (this.userList[_socket.userId].TableId < 0){
				console.log("用户没有进入桌子");
				_socket.emit("checkRedBagResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			var hereRedBag = null;
			for(var i = 0 ; i < this.viewBagList.length ; i++){
				if (this.viewBagList[i].redbagId == info.redBagId){
					hereRedBag = this.viewBagList[i];
					break;
				}
			}

			if (!hereRedBag){
				for(var i = 0 ; i < this.sendBagList.length ; i++){
					if (this.sendBagList[i].redbagId == info.redBagId){
						//如果自己是发包人
						if (this.sendBagList[i].userId != _socket.userId){
							var myloot = false;
							for (var j = 0 ; j < this.sendBagList[i].lootBagList.length ; j++){
								if (this.sendBagList[i].lootBagList[j].userId == _socket.userId){
									myloot = true;
									break;
								}
							}
							if (myloot){
								hereRedBag = this.sendBagList[i];
							}else{
								_socket.emit("checkRedBagResult", {ResultCode:0,msg:"此ID的包自己没抢,不能查看"});
								return;
							}
						}else{
							hereRedBag = this.sendBagList[i];
						}
						break;
					}
				}
			}

			if (!hereRedBag){
				//console.log("此ID的包不在内存,需要去数据库查找");
				//如果此红包与自己没有关系，也不让他查
				gameDao.checkRedBag(info.redBagId,function(Result,redbag){
					if (Result){
						var redbagtemp = {};
						var lootBagListTemp = [];
						if (redbag[0].rcode == 1){
							//只有这个状态，才有抢包数据
							
							for (var i = 0; i < redbag.length; i++) {
								var lootTemp = {getCoin:redbag[i].getscore,nickname:redbag[i].nickname,userId:redbag[i].userId,winscore:redbag[i].winCoin}
							 	lootBagListTemp.push(lootTemp)
							 }
						}
						//var url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(redbag[0].headimgurl);
						//redbagtemp = {userId:redbag[0].sendId,nickname:redbag[0].nickname,sendBagCoin:redbag[0].sendBagCoin,boomNum:redbag[0].boomNum,headimgurl:url,lootBagList:lootBagListTemp}
						redbagtemp = {userId:redbag[0].sendId,sendBagCoin:redbag[0].sendBagCoin,boomNum:redbag[0].boomNum,lootBagList:lootBagListTemp,redbagId:info.redBagId}
						_socket.emit("checkRedBagResult", {ResultCode:1,redbag:redbagtemp});
					}else{
						_socket.emit("checkRedBagResult", {ResultCode:0,msg:"查包ID错误"});
						return;
					}
				})
			}else{
				//var redbagtemp = {userId:hereRedBag.userId,nickname:hereRedBag.nickname,sendBagCoin:hereRedBag.sendBagCoin,boomNum:hereRedBag.boomNum,headimgurl:hereRedBag.headimgurl,lootBagList:hereRedBag.lootBagList}
				var redbagtemp = {userId:hereRedBag.userId,sendBagCoin:hereRedBag.sendBagCoin,nickname:hereRedBag.nickname,boomNum:hereRedBag.boomNum,lootBagList:hereRedBag.lootBagList,redbagId:info.redBagId}
				_socket.emit("checkRedBagResult", {ResultCode:1,redbag:redbagtemp});
			}
		}

		this.getMoney = function(_redbag){
			if (_redbag.sendBagNum == 1){
				_redbag.sendBagNum--;
				return _redbag.remainMoney;
			}

			var max = _redbag.remainMoney / _redbag.sendBagNum * 2;
			var money =  Math.floor(Math.random()*max);

			_redbag.sendBagNum--;
			_redbag.remainMoney -= money;
			return money;
		}

		//发钱
		this.sendCoinByUser = function(userItem,_socre){
			if (this.userList[userItem]){
				var youScore = this.userList[userItem].getScore();
				this.userList[userItem].winscore(_socre);
				var youNowScore = this.userList[userItem].getScore();
				//记录金钱变化量
				userInfolog = {userid:userItem,score_before:youScore,score_change:_socre,score_current:youNowScore,change_type:8,isOnline:true};
				this.score_changeLogList.push(userInfolog);
			}else{
				this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:_socre,change_type:8})
			}
		}

		//断线保存
		this.lineOutSet = function(_info){
			if (_info.state == 1){
				//添加
				this.lineOutList[_info.userId] = {tableId:_info.tableId,seatId:_info.seatId}
				//console.log(this.lineOutList[_info.userId]);
			}else{
				//移除
				this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:_info.userId})
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
			for(var Item in this.lineOutList){
				var tableid = this.lineOutList[Item].tableId;
				var tablestring  = "table" + tableid;
                this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
				this.sever.cleanLineOut(tableid,this.lineOutList[Item].seatId)
				this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item})
			}
			this.lineOutList = {};
		}

		this.getHistory = function(_socket){
			if (!this.userList[_socket.userId]){
				//console.log("用户" + _socket.userId + "不存在");
				return;
			}

			var tableid = this.userList[_socket.userId].TableId;
			if (tableid < 0){
				_socket.emit("getHistoryResult", {ResultCode:0,msg:"用户没有进入桌子"});
				return;
			}

			//获得自己发的历史包
			gameDao.getHistory(_socket.userId,function(Result,redbagList){
				if (Result){
					redbagList.sort(function(a,b){
						return a.redbagId - b.redbagId;
					})

					_socket.emit("getHistoryResult", {ResultCode:1,redbagList:redbagList});
				}else{
					_socket.emit("getHistoryResult", {ResultCode:0,msg:"没有发过任何包"});
				}
			})
		}


		this.setIo = function(_io,_Csocket){
			//this.sever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
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
			this.userList[userInfo._userId].update(userInfo);

			this.LoginGame(userInfo._userId,this.serverId);
			++this.onlinePlayerCount;

			var socketItem = this.userList[userInfo._userId]._socket;
			var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
			result = {resultid:1,msg:'login redbagserver succeed!',Obj:resultObj};
			socketItem.emit('loginGameResult',result);

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
				gameDao.score_changeLog(saveListTemp);
			}
			
		}

		//删除用户
		this.deleteUser = function(_socket){
			if (_socket.userId){
				//判断是否还有牌局在继续
				var tableid = this.userList[_socket.userId].getTable();
				if (tableid >= 0){
					//发送信息给其他人
					var tablestring  = "table" + tableid;
					_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
					console.log("9用户离开!userid:" + this.userList[_socket.userId]._userId
						+ " Account:" + this.userList[_socket.userId]._account
						+ " score:" + this.userList[_socket.userId]._score);
					this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
					delete this.userList[_socket.userId];
					--this.onlinePlayerCount;
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
							
			var ResultData = {TableId:LoginResult.tableId,seatId:LoginResult.seatId,userList:tableUserList,sendRedBagMin:gameConfig.coinConfigMin,sendRedBagMax:gameConfig.coinConfigMax,tax:gameConfig.tax}
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
		this.LogoutRoom = function(_socket){
			if (!this.userList[_socket.userId]){
				console.log("用户" + _socket.userId + "不存在");
				return;
			}
			//用户离开,告诉同桌人
			var tableid = this.userList[_socket.userId].getTable();
			//发送信息给其他人
			
			var tablestring  = "table" + tableid;
			_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});

			//移除桌子
			this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
			this.userList[_socket.userId].LogoutRoom();
		}

		this.disconnectAllUser = function(){
			for(var itme in this.userList){
				this.userList[itme]._socket.disconnect();
			}
			console.log("服务器开启维护，已经全部离线");
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

