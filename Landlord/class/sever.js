var User = require("./../../CClass/class/User");
var schedule = require("node-schedule");
var io = require('socket.io');
var gameConfig = require("./../config/gameConfig")
var gameDao = require("./../../CClass/dao/gameDao");
var log = require("./../../CClass/class/loginfo").getInstand;
var xipai=require("./../routers/xipai");

var Sever = function(){

	//当前比赛剩余时间
	//this.MatchTime = -100;
//	this.isSendEndMsg = false;
//	this.matchId = 0;
//	this.MatchLogin = true;
//	this.isSendPrize = false;
//	this.cleanRank = false;
//	this.ApplyFlag = true;

	this.init = function(){

		//创建桌子
		//暂定500张
		this.seatMax = gameConfig.seatMax;				//座位最大数量
		this.tableMax = gameConfig.tableMax;			//100
		this.tableList = new Array(this.tableMax);		//判断桌子是否达到100桌;
		this.onlienPepole = 0;
		this.roomid = 1;

		
		//每桌一个数组
//		this.fishList = new Array(500);
		this.delfishList = new Array();
		//this.state = gameConfig.gameState.noting;//7

		this.yupai = new Array(this.tableMax);//this.tableMax=5
		//console.log(this.yupai)
		this.majiang = new Array(this.tableMax);
		this.time = new Array(this.tableMax);
		//this.state = new Array(this.tableMax);

		//初始化桌子
		for(var i = 0 ; i < this.tableMax ;i++){
			this.tableList[i] = new Array(this.seatMax + 1);
			//初始化扑克
//			this.yupai[i] = [];
//			this.majiang[i] = [];
//			this.state[i] = gameConfig.gameState.noting;
//			this.time[i] = -1;
//			//
//			for (var j = 0; j < 4; j++){
//				for (var z = 1; z < 14 ; z++){
//					this.yupai[i].push(z + (j * 13));
//				}
//			}

		}
		//console.log(this.time)
//		this.cardPoint = [];
//		//初始化扑克牌权利值
//		for(var i = 0  ; i < 4 ; ++i){
//			for (var j = 1 ; j <= 13 ; j++){
//				this.cardPoint[i * 13 + j] = ((j - 1) * 4) + 1 + i;
//			}
//		}

		//定时器
	　　var rule = new schedule.RecurrenceRule();

	　　var times = [];

	　　for(var i=0; i<60; i++){
	　　　　times.push(i);
	　　}
	　　rule.second = times;
		var c = 0;
		var self = this;

	}

//	this.getReadyPlayTime = function(tableId){

	//斗地主的牌
	this.getdouCarcd=function(tableId){
		
			var Shufflecard=xipai.Shuff(gameConfig.carcd);
			var carcd=xipai.tocarcd(Shufflecard);
			
			return {carcd:carcd};
		
	}


	//每局重置
	this.jureset = function(tableId){
		this.time[tableId] = 0;
	}
	//获取当前时间
	this.getTime=function() {
	    var date = new Date();
	    var seperator1 = "-";
	    var seperator2 = ":";
	    var month = date.getMonth() + 1;
	    var strDate = date.getDate();
	    if (month >= 1 && month <= 9) {
	        month = "0" + month;
	    }
	    if (strDate >= 0 && strDate <= 9) {
	        strDate = "0" + strDate;
	    }
	    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
	            + " " + date.getHours() + seperator2 + date.getMinutes()
	            + seperator2 + date.getSeconds();
	    return currentdate;
	}
	
	this.TrialCarcd=function(carcd){
		var Trial=[];
		for(var i=0;i<carcd.length;i++){
			if(carcd[i].type==1){
				Trial.push(carcd[i].val);

			}else if(carcd[i].type==2){
				Trial.push(this.type2(carcd[i].val));

			}else if(carcd[i].type==3){
				Trial.push(this.type3(carcd[i].val));

			}else if(carcd[i].type==4){
				Trial.push(this.type4(carcd[i].val));

			}else if(carcd[i].type==5){
				if(carcd[i].val==14){
					Trial.push(53);
				}else{
					Trial.push(54);
				}
			}else{
				console.log('错误falsh')
			}
		}

		return Trial;
	}



	this.type2=function(vip){
		switch(vip){
			case 1:
				return 14
			case 2:
				return 15
			case 3:
				return 16
			case 4:
				return 17
			case 5:
				return 18
			case 6:
				return 19
			case 7:
				return 20
			case 8:
				return 21
			case 9:
				return 22
			case 10:
				return 23
			case 11:
				return 24
			case 12:
				return 25
			case 13:
				return 26
		}		
	}


	this.type3=function(vip){
		switch(vip){
			case 1:
				return 27
			case 2:
				return 28
			case 3:
				return 29
			case 4:
				return 30
			case 5:
				return 31
			case 6:
				return 32
			case 7:
				return 33
			case 8:
				return 34
			case 9:
				return 35
			case 10:
				return 36
			case 11:
				return 37
			case 12:
				return 38
			case 13:
				return 39
		}		
	}


this.type4=function(vip){
		switch(vip){
			case 1:
				return 40
			case 2:
				return 41
			case 3:
				return 42
			case 4:
				return 43
			case 5:
				return 44
			case 6:
				return 45
			case 7:
				return 46
			case 8:
				return 47
			case 9:
				return 48
			case 10:
				return 49
			case 11:
				return 50
			case 12:
				return 51
			case 13:
				return 52
		}		
	}



	//设置io
	this.setIo = function(_io,_Csocket){
		this.io = _io;
		this.Csocket = _Csocket;
	}


	//进入房间
	this.LoginRoom = function(_user,_socket){
		if (this.onlienPepole > this.tableMax * this.seatMax){
			 log.warn("已经大于当前房间人数");
			 return {tableId:-1,seatId:-1};
		}
		++this.onlienPepole;
		var tableidx = -1;
		var seatidx = -1;
		var nullseat = false;

		for(var i = 0; i < this.tableMax ; i++){
			for (var j = 0 ; j < this.seatMax; j++){
				if (!this.tableList[i][j]){
					nullseat = true;
					tableidx = i;
					seatidx = j;
					break;
				}
			}
			if (nullseat){
				break;
			}
		}

		if (tableidx == -1 || seatidx == -1){
			log.err("error:找座位出错");
			return {tableId:-1,seatId:-1};
		}
		console.log("server loginRoom")
		//log.info("座位:" + tableidx + "桌," + seatidx + "个位置");
		var tablestring = "table"+tableidx;
		_user.loginTable(tableidx); //进入桌子
		_user.loginSeat(seatidx); //进入座位

		//分配座位
		//寻找空座位
		this.tableList[tableidx][seatidx] = _socket.userId;
		this.tableList[tableidx][this.seatMax] = 1; 

		//把当前socket加入当前桌子分组
		var tablestring = "table"+tableidx;
		_socket.join(tablestring);	

		return {tableId:tableidx,seatId:seatidx};
	}

	//离开房间
	this.LogoutRoom = function(_User,_socket){
		//log.info("有人离开桌子");
		var tableid = _User.getTable();
		var seatid = _User.getSeat()
		//没有任何座位信息
		if (tableid == -1 || seatid == -1) return;
		//log.info("座位," + tableid + "桌," + seatid + "个位置");
		//分配座位
		//寻找空座位
		this.tableList[tableid][seatid] = null;
		--this.onlienPepole;

		//检测当前桌子还是否有人
		var isOnline = false;
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[tableid][i]){
				isOnline = true;
				break;
			}
		}
		if (!isOnline){
			this.tableList[tableid][this.seatMax] = 0;
		}

		var tablestring = "table"+tableid;
		_socket.leave(tablestring);	
	}

	//断线
	this.lineOut = function(_User,_socket){
		var tableid = _User.getTable();
		var tablestring = "table"+tableid;
		_socket.leave(tablestring);	
	}

	//进入房间
	this.LoginRoombyLineOut = function(_user,_socket,_tableidx,_seatidx){
		var tableidx = _tableidx;
		var seatidx = _seatidx;

		var tablestring = "table"+tableidx;
		_user.loginTable(tableidx);
		_user.loginSeat(seatidx);

		this.tableList[tableidx][seatidx] = _socket.userId;

		//把当前socket加入当前桌子分组
		var tablestring = "table"+tableidx;
		_socket.join(tablestring);	

		return {tableId:tableidx,seatId:seatidx};
	}

	//清理已经断线的用户
	this.cleanLineOut = function(_tableid,_seatid){
		var tableid = _tableid;
		var seatid = _seatid;
		//没有任何座位信息
		if (tableid == -1 || seatid == -1) return;

		this.tableList[tableid][seatid] = null;
		--this.onlienPepole;

		//检测当前桌子还是否有人
		var isOnline = false;
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[tableid][i]){
				isOnline = true;
				break;
			}
		}
		if (!isOnline){
			this.tableList[tableid][this.seatMax] = 0;
		}
	}

	this.getTablePlayers = function(_tableId){
		console.log("=======getTablePlayers611=========")
		console.log(_tableId)        
		var playerList = [];
		for(var i = 0 ; i < this.seatMax ; i++){
			if (this.tableList[_tableId][i])
				playerList.push(this.tableList[_tableId][i])
		}
		return playerList;
	}

	this.getTablePlayerBySeatId = function(_tableId,_seatId){		
		return this.tableList[_tableId][_seatId];
		
	}

	this.init();

}


module.exports = Sever;

