qiangcowUser = function(_userInfo){
	//相关属性
	this._userId = 0;
	this.RandCount = 0;
	this.TotalCount = Math.floor(Math.random()*1200) + 60;
	//this.TotalCount = Math.floor(Math.random()*30) + 50;
	this.timer;

	this.isDown = false;
	this.nowZhuang = false;
	this.goDownTime = 10;

	//离线后再次登录时间
	this._online = true;
	this._out = false;
	this.setDownCoinMax = 0;

	this.goUp = false;

	this.chipsConfig = [10,100,1000,10000];

	this.callRom = [0,0,0,0,1,1,1,2,2,2,3,3,4];

	this.reCallRom = [0,0,0,0,1,1,1,2,2,3];

	this.jieguo = [0,0,0];
	this.win = 0;
	this.winfalg = false;
	this._addscore = 0;
	this.point = -1;
	this.valueId = 0;

	this.init = function(_userInfo){
		this.setAccount(_userInfo.account);
		this._socre = 100;
		this.idx = _userInfo.idx;
		this.connect();
		this.time();
	};

	this.setAccount = function(_Account){
		this._account = _Account;
	}

	this.getAccount = function(){
		return this._account;
	}

	this.EnterLoginServer = function(){
		this._socket.emit('login',{userName:this.getAccount(),sign:'cocogame2016`@33922200@@@@',gameId:1})
	}


	this.connect = function(){
		//this._socket = io.connect('http://120.76.200.182:3000');
		//console.log("连接")
		this._socket = io.connect('http://localhost:13000');
		//this._socket = io.connect('http://192.168.1.170:3000');
		this.initNetWork();
		this.EnterLoginServer();
	}

	//连接游戏服务器
	this.connectGame = function(){
        this._gameSocket = io.connect('http://' + this._ip + ':' + this._port);
        //console.log(this._ip)
        this.initGameSocket();
        //进入游戏,被服务器分配房间
        this.logingame();
    }

    //进入游戏
    this.logingame = function(){
        if (this._gameSocket && this._userId){
            this._gameSocket.emit('LoginGame',{userid:this._userId,sign:this._sign})
        }
     }

    //进入房间
    this.loginroom = function(){
    	this._gameSocket.emit('LoginRoom',{roomid:1});
    }

	//接收大厅信息
	this.initNetWork = function(){
		var self = this;
		this._socket.on('connected',function(msg){
        	//console.log(msg);
    	})

    	this._socket.on('loginResult',function(result){
    		//console.log(result)
    		self._sign = result.Obj.sign;
	      	self._userId = result.Obj.id;
	      	//console.log(self._userId + "进入抢庄牛牛");
	      	self._socre = result.Obj.score;
	      	self._online = true;

    	})

	    this._socket.on('ServerListResult',function(msg){

    	//var idx = 0;
	    //    self._ip = msg.GameInfo[7].serverInfo.normal[idx].ip;
	    //    self._port = msg.GameInfo[7].serverInfo.normal[idx].prot;

	    	console.log(self._userId + "进入抢庄牛牛游戏" + parseInt(self.idx + 1) +"倍房间!");
	         self._ip = msg.GameInfo[7].serverInfo.normal[self.idx].ip;
	         self._port = msg.GameInfo[7].serverInfo.normal[self.idx].prot;

	        //进入游戏
	        self.connectGame();
	    })

	}

	this.down = function(){
		if (this._out){
			return;
		}
		--this.TotalCount;
	}

	this.time = function(){
		if (!this.timer){
			var second=1000;
			this.timer = setInterval(this.down.bind(this),second);
		}
	}

	this.out = function(){
		this.disconnect();
		clearInterval(this.timer);
		this._out = true;
	}

	this.checkPoint = function(cardArray){
		var point = -1;
		var totol = 0;
		if (cardArray && cardArray.length == 4){
			for (var i = 0 ;i < cardArray.length ;i++ ){
				cardArray[i] = cardArray[i] % 13;
				if (cardArray[i] > 10 && cardArray[i] == 0){
					cardArray[i] = 10;
				}
				totol += cardArray[i];
			}
			for(var i1 = 0 ;i1 < 2 && cardArray.length == 4; ++i1){
					for(var i2 = i1+1; i2 < 3 && cardArray.length == 4; ++i2){
						for(var i3 = i2+1; i3 < 4 && cardArray.length == 4; ++i3){
							if ((cardArray[i1] + cardArray[i2] + cardArray[i3] % 13) % 10 == 0){
								//log.info(i1 + " " + i2 + " " + i3);
								return totol % 10;
							}
						}
					}
				}
			
		}
		return point;
		
	}


	//接收游戏信息
	this.initGameSocket = function(){
		var self = this;
		this._gameSocket.on('connected',function(msg){
			//console.log(msg);
		})

		this._gameSocket.on('loginGameResult',function(msg){
			//console.log(msg);
			//结束与登录服务器通信
			self.loginroom();

			//self._gameSocket.emit('getDownTime');
		})

		this._gameSocket.on('getDownTimeResult',function(msg){

		})


		this._gameSocket.on('addgoldResult',function(msg){
			console.log(msg);
		})

		this._gameSocket.on('callResult',function(msg){
			console.log(msg);
		})
		

		this._gameSocket.on('sendCard',function(msg){
			//收到扑克
			//先判断自己有没有扑克，如果没有扑克,可不做处理
			if (msg.card && msg.card.length == 4){
				self.valueId = 0;
				self.point = self.checkPoint(msg.card);
				if (self.point == -1){
					//无牛,不叫
					self.valueId = self.callRom[Math.floor((Math.random() * self.callRom.length))];
				}else if(self.point > -1 && self.point <= 3){
					//4倍
					self.valueId = 4;
				}else if(self.point > 3 && self.point <= 5){
					//3倍
					self.valueId = 3;
				}else if(self.point > 5 && self.point <= 7){
					//2倍
					self.valueId = 2;
				}else{
					//2倍
					self.valueId = 2;
				}
				
				self.sendCardCointimer = setTimeout(self.call.bind(self),Math.floor((Math.random() * 4) * 1000) + 1000);
				//setTimeout("self.call(" + valueId +").bind("+self+")",Math.floor((Math.random() * 4) * 1000) + 1000);
			}
			
			//可以叫倍数
	    })

	    this._gameSocket.on('selectBet',function(msg){
	    	//收到选倍数
	    	if (msg.selectMaxBet != -1){
	    		self.valueId = 0;
	    		//根据自己的牌形叫倍数
	    		// console.log("selectBet")
	    		// console.log(self.point)
				if (self.point == -1){
					//5倍
					self.valueId = self.reCallRom[Math.floor((Math.random() * self.reCallRom.length))];
				}else if(self.point > -1 && self.point <= 3){
					//10倍
					self.valueId = 3;		
				}else if(self.point > 3 && self.point <= 5){
					//20倍
					self.valueId = 2;
				}else if(self.point > 5 && self.point <= 7){
					//30倍
					self.valueId = 1;
				}else{
					//5倍
					self.valueId = 2;
				}


				self.reCallCointimer = setTimeout(self.reCall.bind(self),Math.floor((Math.random() * 4) * 1000) + 1000);
				
	    	}
	    })

	   	this._gameSocket.on('couCow',function(msg){
	    	//收到选倍数
	    	if (msg.card && msg.card.length > 0){
				setTimeout(self.show.bind(self),Math.floor((Math.random() * 5) * 1000) + 3000);
	    	}
	    })


	   	this._gameSocket.on('getx',function(msg){
	   		if (msg.Result){
	   			self.jieguo = msg.data.jieguo;
	   		}
	        //self
	    })



	    this._gameSocket.on('openResult',function(msg){
	        //console.log(msg);
	        self.isDown = false;
	        if (self.TotalCount < 10){
	        	self.TotalCount = 5;
	        }
	    })

	    this._gameSocket.on('winResult',function(msg){
	    	if (self.winfalg){
	    		self.win += msg
	        	self.winfalg = false;
	        	//console.log("虚拟获得:" + self.win);
	    	}
	    	self._addscore += msg.winCoin;

	    	if (self._addscore > Math.floor(Math.random()*5000000) + 1000000){
	    		 self._gameSocket.emit('down',{});
	    	}

	    })


	    this._gameSocket.on('getDownTimeResult',function(msg){
	        //console.log(msg);
	    })
	};

	this.call = function(){
		clearInterval(this.sendCardCointimer);
		//console.log(this._userId);
		this._gameSocket.emit('call',JSON.stringify({callValueId:this.valueId}));
	}

	this.reCall = function(){
		clearInterval(this.reCallCointimer);
		this._gameSocket.emit('reCall',JSON.stringify({reCallValueId:this.valueId}));
	}

	this.show = function(){
		this._gameSocket.emit('show');
	}


	this.disconnect = function(){
		if (this._gameSocket){
			this._gameSocket.disconnect();
			this._gameSocket = null;
		}
		if (this._socket){
			this._socket.disconnect();
			this._socket = null;
		}
		this._online = false;
		console.log(this._userId +"离开游戏")
		clearInterval(this.timer);
	} 

	this.isOnline = function(){
		return this.TotalCount > 0 || this.isDown;
	}

	this.init(_userInfo);
		
}
