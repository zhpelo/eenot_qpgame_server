User = function(_userInfo,_socket){
	//相关属性

	this._userId = "";			//数据库ID
	this._socket = "";			//socketID
	this._account = "";			//用户帐号
	this._score = 0;			//用户数据
	this._diamond = 0;			//钻石
	this._giftTicket = 0;		//礼品券
	this._nickname = "";		//昵称
	this._ageinLogin = false;	//重新登录标签
	this.LoginCount = 0;		//登录次数
	this.LotteryCount = 0;		//游戏次数
	this.GameId = 0;			//游戏ID
	this.RoomId = 1;			//房间ID
	this.TableId = -1;			//桌子ID
	this.SeatId = -1;			//座位ID
	this._proList = {};			//道具列表
	this._phoneNo = "";			//电话号码
	this._email = "";			//电子邮件
	this._sex = -1;				//性别
	this._city = "";			//城市
	this._province = "";		//省份
	this._country = "";			//国家
	this._headimgurl = "";		//头像地址
	this._chckeNo = "";
	this._prize = [];
	this._dayprize = [];
	this._firstexchange = 1;
	this._ChannelType = "";
	this._Robot = false;
	this._uncouunt = 0;
	this._official = false;
	this._p = "";
	this._cardList = [];
	this.deleteFlag = false;

	this.init = function(_userInfo,_socket){

		this._userId = _userInfo.Id;
		this._account = _userInfo.Account;
		this._score = _userInfo.score;
		this._nickname = _userInfo.nickname;
		this._socket = _socket;
		this._islogin = true;
		this.freeCount = _userInfo.freeCount;
		this.LoginCount = _userInfo.LoginCount + 1;
		this.LotteryCount = _userInfo.LotteryCount;
		this._sign = _userInfo.sign;
		this._loginTime = new Date();
		//socket绑定用户id
		_socket.userId = _userInfo.Id;
		this._diamond = _userInfo.diamond;			//钻石
		this._giftTicket = _userInfo.giftTicket;	//礼品券
		this._proList = _userInfo.propList;			//道具表

		this._phoneNo = _userInfo.phoneNo;			//电话号码
		this._email = _userInfo.email;				//电子邮件
		this._sex = _userInfo.sex;					//性别
		this._city = _userInfo.city;				//城市
		this._province = _userInfo.province;		//省份
		this._country = _userInfo.country;			//国家
		this._headimgurl = _userInfo.headimgurl;	//头像地址
		this._Robot = _userInfo.Robot;
		this._ChannelType = _userInfo.ChannelType;
		this._official = _userInfo.official;
		this._p = _userInfo.p;


		//console.log(this._ChannelType);

		//读取数据库,获取账户道具
		this.initProp();
		//console.log("#########" + _userInfo.Id + "##########" + _socket.userId)
		//console.log(_socket.userId);
	};

	//更换socket
	// this.changeSocke = function(_socket,_sign){
	// 	this._socket = _socket;
	// 	_socket.userId = _userInfo.Id;
	// 	this.GameId = 0;
	// 	this.RoomId = 0;
	// 	this.SeatId = -1;
	// 	this._sign = _sign;
	// 	this._loginTime = new Date();
	// }

	//进入游戏
	this.loginGame = function(gametype){
		this.GameId = gametype; 
	}

	this.resetGame = function(){
		this.GameId = 0; 
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

	this.getScore = function(){
		return this._score;
	}

	this.winscore = function(_score){
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
		}
	}

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

	this.logincheck = function(nowdate){
		if (nowdate.getTime() - this._loginTime.getTime() > 5000)
		{
			return 1;
		}else{
			return 0;
		}
		
	}

	this.initProp = function(){

	}

	//获得道具数量
	this.getPropCount = function(_idx){
		// for(var obj in this._proList){
  		//	this._proList[obj];
  		//}
  		if (this._proList[_idx]){
  			return this._proList[_idx];
  		}else{
  			return 0;
  		}
	}

	this.getPropList = function(){

	}

	this.getCheckNo = function(){
		return this._chckeNo;
	}

	this.newCheckNo = function(){
		this._chckeNo = Math.floor(Math.random()*9000) + 1000;
		return this._chckeNo;
	}

	this.setPhoneNo = function(_phoneNo){
		this._phoneNo = _phoneNo;
	}

	this.getPhoneNo = function(){
		return this._phoneNo;
	}

	this.cleanCheckNo = function(){
		this._chckeNo = null;
	}



	this.init(_userInfo,_socket);
		
}

module.exports = User;