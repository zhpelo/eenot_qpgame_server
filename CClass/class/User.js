User = function(userInfo,_socket){
	//相关属性

	this._userId = "";			//数据库ID
	this._socket = "";			//socketID
	this._account = "";			//用户帐号
	this._score = 0;			//用户数据
	this._nickname = "";		//昵称
	this._ageinLogin = false;	//重新登录标签
	this.freeCount = 0;			//剩余免费游戏次数
	this._diamond = 0;			//钻石
	this._giftTicket = 0;		//礼品券
	this.LoginCount = 0;		//登录次数
	this.LotteryCount = 0;		//游戏次数
	this.shootTotal = 0;		//消耗统计
	this._winscoreTotal = 0;	//获得金币
	this.GameId = 0;			//游戏ID
	this.RoomId = 1;			//房间ID
	this.TableId = -1;			//桌子ID
	this.SeatId = -1;			//座位ID
	this.sign = "";
	this.bulletList = {};
	this._shootTime = 50;
	this._proList = {};			//道具列表
	this._headimgurl = "";		//头像地址
	this._Apply = false;		//是否已经报名
	this._bankScore = -1;		//存储分数
	this._lastTime = "";		//比赛最后时间
	this._matchId = 0;			//比赛ID
	this._Robot = false;
	this._isLeave = true;

	this.init = function(_userInfo,_socket){
		this._userId = _userInfo.userid;
		this.sign = _userInfo.sign;
		this._socket = _socket;
		this._islogin = false;
		//socket绑定用户id
		_socket.userId = _userInfo.userid;
		this.initShootTime();
		this._isLeave = false;
		//console.log("#########" + _userInfo.Id + "##########" + _socket.userId)
		//console.log(_socket.userId);
	};

	this.initShootTime = function(){
		this._shootTime = 50;
	}

	this.update = function(_userInfo){
		if (_userInfo._userId == this._userId){
			this._account = _userInfo._account;
			this._score = _userInfo._score;
			this._diamond = _userInfo._diamond;
			this._giftTicket = _userInfo._giftTicket;
			this._nickname = _userInfo._nickname;
			this.freeCount = _userInfo.freeCount;
			this.LoginCount = _userInfo.LoginCount;
			this.LotteryCount = _userInfo.LotteryCount;
			this._islogin = true;
			this._proList = _userInfo.propList;
			this._headimgurl = _userInfo._headimgurl;	//头像地址
			this._Robot = _userInfo._Robot;
		}
	}

	this.matchUpdate = function(_data){
		if (_data.userId == this._userId){
			this._Apply = true;
			this._bankScore = this._score;
			this._score = _data.score;
			this._lastTime = _data.lastTime;
			this._matchId = _data.matchId;
		}
	}

	//更换socket
	this.changeSocke = function(_socket){
		this._socket = _socket;
		_socket.userId = _userInfo.Id;
		this.GameId = 0;
		this.RoomId = 0;
		this.SeatId = -1;
	}

	//进入游戏
	this.loginGame = function(gametype){
		this.GameId = gametype; 
	}
	
	//进入房间
	this.loginRoom = function(roomid){
		this.RoomId = roomid;
	}

	//进入桌子
	this.loginTable = function(tableid){
		this.TableId = tableid;
	}

	//获得桌子ID
	this.getTable = function(){
		return this.TableId;
	}

	//进入座位
	this.loginSeat = function(seatid){
		this.SeatId = seatid;
	}

	//获得座位ID
	this.getSeat = function(){
		return this.SeatId;
	}

	//获得游戏ID
	this.getGameId = function(){
		return this.GameId;
	}
	
	//获得房间ID
	this.getRoomId = function(){
		return this.RoomId;
	}

	//离开房间
	this.LogoutRoom = function(){
		this.RoomId = -1;			//房间ID
		this.TableId = -1;			//桌子ID
		this.SeatId = -1;			//座位ID
	}
	
	this.getLotteryCount = function(){
		return this.LotteryCount;
	}

	this.getUserId = function(){
		return this._userId;
	}

	this.getShootTotal = function(){
		return this.shootTotal;
	}

	this.fishShoot = function(_bet,_serverBet,_bulletId){
		var tbet = _bet * _serverBet;
		if(this._score >= tbet){
			//有足够的钱
			//扣掉相应金额
			this._score -= tbet;
			this.shootTotal += tbet;
			if (!_bulletId){
				console.log("子弹错误!");
			}
			//添加子弹
			if (this.bulletList[_bulletId]){
				console.log("user:" + this._userId + "子弹id重复! bulletId:" + _bulletId);
			}else{
				this.bulletList[_bulletId] = _bet;
				//console.log(this.bulletList);
			}
			this.initShootTime();
			return 1;
		}else{
			//摇奖失败
			console.log("user:" + this._userId + "发射子弹,金额不够！")
			return 0;
		}
	}

	this.downCoin = function(downCoin){
		if(this._score >= downCoin){
			//有足够的钱
			//扣掉相应金额
			this._score -= downCoin;
			return true;
		}else{
			return false;
		}
	}

	this.getScore = function(){
		return this._score;
	}

	this.winscore = function(_score){
		this._winscoreTotal += _score;
		this._score += parseInt(_score);
		this._lastTime = new Date();
	}

	this.balance = function(){
		this._winscoreTotal = 0;
		this.shootTotal = 0;
	}

	this.Islogin = function(){
		return this._islogin;
	}

	this.addgold = function(_score){
		if (_score > 0){
			//正数,加分
			this._score += parseInt(_score);
			return 1;
		}else{
			if (this._score >= Math.abs(_score)){
				this._score += parseInt(_score);
				return 1;
			}else{
				return 0;
			}
		}
	}

	this.getUseCoin = function(){
		return this.shootTotal;
	}


	this.getWinCoin = function(){
		return this._winscoreTotal;
	}

	this.isBulletLife = function(_bulletId){
		if (this.bulletList[_bulletId]){
			return true;
		}else{
			return false;
		}
	}

	this.removeBulletLife = function(_bulletId){
		//console.log("将要删掉子弹" + _bulletId)
		if (!_bulletId) {
			console.log("userId:" + this._userId + "没传输子弹信息!")
			return 0;
		}

		if (this.bulletList[_bulletId]){
			var bet = this.bulletList[_bulletId]
			delete this.bulletList[_bulletId];
			//console.log(this.bulletList);
			return bet;
		}else{
			//console.log(this.bulletList)
			console.log("userId:" + this._userId +"bulletId:" + _bulletId + "子弹不存在!")
			return 0;
		}
	}


	//添加道具
	this.addProp = function(_propId,_propCount){
		if (_propId){
			if (this._proList[_propId]){
				this._proList[_propId] += _propCount; 
			}else{
				this._proList[_propId] = _propCount;
			}
		}
	}

	this.init(userInfo,_socket);
		
}

module.exports = User;