User = function(userInfo,_socket){
	//相关属性

	this._userId = "";			//数据库ID
	this._socket = "";			//socketID
	this._account = "";			//用户帐号
	this._score = 0;			//用户数据
	this._nickname = "";		//昵称
	this._ageinLogin = false;	//重新登录标签
	this.freeCount = 0;		//剩余免费游戏次数
	this.LoginCount = 0;		//登录次数
	this.LotteryCount = -10000;		//游戏次数
	this._winscoreTotal = 0;	//获得金币
	this.GameId = 0;			//游戏ID
	this.RoomId = 1;			//房间ID
	this.TableId = -1;			//桌子ID
	this.SeatId = -1;			//座位ID
	this.sign = "";
	this._isLeave = true;

	this.init = function(_userInfo,_socket){
		this._userId = _userInfo.userid;
		this.sign = _userInfo.sign;
		this._socket = _socket;
		this._islogin = false;
		//socket绑定用户id
		_socket.userId = _userInfo.userid;
		this._isLeave = false;
		//console.log("#########" + _userInfo.Id + "##########" + _socket.userId)
		//console.log(_socket.userId);
	};

	this.update = function(_userInfo){
		if (_userInfo._userId == this._userId){
			this._account = _userInfo._account;
			this._score = _userInfo._score;
			this._nickname = _userInfo._nickname;
			this.LoginCount = _userInfo.LoginCount;
			this._islogin = true;
		}
		
	}

	this.updateFreeGame = function(_userInfo){
		if (_userInfo.Id == this._userId){
			//console.log(_userInfo)
			this.freeCount = _userInfo.freeCount;
			this.LotteryCount = _userInfo.LotteryCount;
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
	
	this.getLotteryCount = function(){
		return this.LotteryCount;
	}

	this.getUserId = function(){
		return this._userId;
	}

	this.lottery = function(_lineCount){
		//console.log(this._score)
		if (this.freeCount > 0){
			--this.freeCount;
			++this.LotteryCount;
			return 2;
		}else if(this._score >= _lineCount){
			//摇奖成功
			//扣掉相应金额
			this._score -= _lineCount;
			++this.LotteryCount;
			return 1;
		}else{
			//摇奖失败
			return 0;
		}
	}

	this.getScore = function(){
		return this._score;
	}

	this.winscore = function(_score){
		this._winscoreTotal += _score;
		this._score += parseInt(_score);
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
	}}

	//添加游戏免费次数
	this.AddFreeCount = function(_count){
		if (_count >= 0)
			this.freeCount += _count;
		else
			console.log("添加免费次数参数不正确!");
	}

	//获得免费游戏次数
	this.getFreeCount = function(){
		return this.freeCount;
	}

	this.init(userInfo,_socket);
		
}

module.exports = User;