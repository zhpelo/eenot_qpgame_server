jia82User = function(_userInfo){
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

	this.jieguo = [0,0,0];
	this.win = 0;
	this.winfalg = false;
	this._addscore = 0;

	this.init = function(_userInfo){
		this.setAccount(_userInfo.account);
		this._socre = 100;
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
		//this._socket = io.connect('http://localhost:3000');
		this._socket = io.connect('http://192.168.1.170:3000');
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
	      	console.log(self._userId + "进入八加二游戏");
	      	self._socre = result.Obj.score;
	      	self._online = true;

    	})

	    this._socket.on('ServerListResult',function(msg){

	    	var idx = 0;
	        self._ip = msg.GameInfo[4].serverInfo.normal[idx].ip;
	        self._port = msg.GameInfo[4].serverInfo.normal[idx].prot;

	        //进入游戏
	        self.connectGame();
	    })

	}

	this.down = function(){
		if (this._out){
			return;
		}

		--this.TotalCount;
		if (!this.goDownTime){
			//下注
			this.DownCoin();
			--this.goDownTime;
		}else if(this.goDownTime > 0){
			--this.goDownTime;
		}
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

			self._gameSocket.emit('getDownTime');
		})

		this._gameSocket.on('getDownTimeResult',function(msg){
			//console.log(msg);
			var flag = Math.floor(Math.random()*0)
			this.upCount = msg.upUserList.length;
			if (self._socre > 100000 && msg.upUserList.length < 2 && !flag){
				//console.log(self._socre)
				//console.log(msg.upUserList.length)
	      		self.goUp = true;
	      	}
		})


		this._gameSocket.on('addgoldResult',function(msg){
			console.log(msg);
		})

		this._gameSocket.on('downEnd',function(msg){

	        self.jieguo = [0,0,0]
	    })

	    this._gameSocket.on('downCoinBegin',function(msg){
	        self._gameSocket.emit('getx',"coco%2016@s3ls@l3l#22l2l;a;z33123");
	        
	        self.goDownTime = Math.floor(Math.random()*10);
	        //self
	    })

	   	this._gameSocket.on('getx',function(msg){
	   		if (msg.Result){
	   			self.jieguo = msg.data.jieguo;
	   		}
	        //self
	    })

	    this._gameSocket.on('upResult',function(msg){
	        //console.log(msg);
	    })

	    this._gameSocket.on('downCoinResult',function(msg){
	        //console.log(msg);
	        if (msg.ResultCode){
	        	self.isDown = true;
	        }
	    })

	    this._gameSocket.on('otherDownCoin',function(msg){
	        //console.log(msg);
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
	    	self._addscore += msg;

	    	if (self._addscore > 200000){
	    		 self._gameSocket.emit('down',{});
	    	}



	    })

	    this._gameSocket.on('otherUp',function(msg){
	    	++this.upCount;
	        //console.log(msg);
	    })

	    this._gameSocket.on('downResult',function(msg){
	        //console.log(msg);
	    })

	    this._gameSocket.on('otherDown',function(msg){
	        --this.upCount;
	       	var flag = Math.floor(Math.random()*5)
	       	//console.log(this.upCount)
	       	//console.log(self._socre)
			if (self._socre > 100000 && this.upCount < 2 && !flag){
	      		self.goUp = true;
	      		//console.log("here");
	      	}
	    })

	    this._gameSocket.on('getDownTimeResult',function(msg){
	        //console.log(msg);
	    })
	};

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
		//console.log(this.TotalCount)
		//console.log(this.isDown)
		return this.TotalCount > 0 || this.isDown;
	}

	this.DownCoin = function(){
		if (this.goUp){
			this.goUp = false;
			var upcoin = 100000 + parseInt((this._socre - 100000) % 500000);
			this._gameSocket.emit('up',{Coin:upcoin});
		}
	
		if (this.TotalCount > 10){
			var randIdx = 3;
			if (this._socre < 10000)
				randIdx = 2;
			else if(this._socre < 1000){
				randIdx = 1;
			}
			this.chipid = Math.floor(Math.random()*randIdx);
			if (this.chipid == 0){
				rand = 5;
			}
			else if(this.chipid == 1){
				rand = 10;
			}
			else{
				rand = 13;
			}

			this.chipnum = Math.floor(Math.random()*rand) + 1;
			this.selectid = -1;
			for(var i = 0 ; i < 3 ; ++i){
				if (this.jieguo[i] > 0){
					this.selectid = i; 
				}
			}
			if (Math.floor(Math.random()*10000)){
				this.selectid = Math.floor(Math.random()*3);
			}else{
				if (this.selectid > -1){
					this.winfalg = true;
					//console.log(this.selectid);
					//console.log(this.jieguo);
				}

			}

			if (this.selectid > -1){
				this.sendDownCointimer = setInterval(this.sendDownCoin.bind(this),Math.floor(Math.random()*200) + 200);
			}
			// for(var i = 0 ; i < chipnum; i++){
			// 	this._gameSocket.emit('downCoin',{chips:chipid,selectId:selectid});		
			// }
			
		}
		

	}

	this.sendDownCoin = function(){
		if (this.chipnum > 0){
			this._gameSocket.emit('downCoin',{chips:this.chipid,selectId:this.selectid});
		}else{
			clearInterval(this.sendDownCointimer);
		}

		this.chipnum--;
	}

	

	this.init(_userInfo);
		
}
