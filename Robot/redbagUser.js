redbagUser = function(_userInfo){
	//相关属性

	this._userId = 0;
	this.x = 0;
	this.RandCount = 0;
	this.TotalCount = Math.floor(Math.random()*1200) + 120;
	//this.TotalCount = Math.floor(Math.random()*30) + 50;
	this.timer;

	this.isDown = false;
	this.nowZhuang = false;
	this.sendBagTime = 20;
	this.lootBagTime = {};
	this.lootBagId = 0;

	//离线后再次登录时间
	this._online = true;
	this._out = false;
	this.setDownCoinMax = 0;

	this.setBagFlag = true;

	this.coinConfig = [100,500,1000,3000,6000,8000,20000,50000,100000];
	this.coinCoifigRand = [2,3,4,7,13,13,13,13,5];
	this.coinIdx = [];
	this.coinIdxLength = [];

	this.init = function(_userInfo){
		this.setAccount(_userInfo.account);
		this._socre = 100;
		this.connect();
		this.time();
		var idx = 0;
		for(var i = 0; i < this.coinCoifigRand.length ; ++i){
			for (var j = 0; j < this.coinCoifigRand[i] ; ++j){
				this.coinIdx.push(i);
				++idx;
			}
			this.coinIdxLength.push(idx);
		}

		//console.log(this.coinIdxLength)

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
		this._socket = io.connect('http://192.168.1.170:13000');
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
	      	console.log(self._userId + "进入红包游戏");
	      	self._socre = result.Obj.score;
	      	self._online = true;

    	})

	    this._socket.on('ServerListResult',function(msg){

	    	var idx = 0;
	        self._ip = msg.GameInfo[3].serverInfo.normal[idx].ip;
	        self._port = msg.GameInfo[3].serverInfo.normal[idx].prot;

	        //进入游戏
	        self.connectGame();
	    })

	}

	this.down = function(){
		if (this._out){
			return;
		}

		--this.TotalCount;

		for(var item in this.lootBagTime){
			//console.log(this.lootBagTime[item])
			if (this.lootBagTime[item] > 0){
				--this.lootBagTime[item];
			}else if(!this.lootBagTime[item]){
				--this.lootBagTime[item];
				this.lootbag(item);
			}
		}

		if (!this.sendBagTime){
			//发包
			this.DownCoin();
			--this.sendBagTime;
		}else if(this.sendBagTime > 0){
			--this.sendBagTime;
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

		})

	    //红包监听
	    this._gameSocket.on('noticeRedBag',function(msg){
	       	self.sendBagTime = 10;
	       	if (msg.userId != self._userId){
	       		//console.log("here")
	       		if (!Math.floor(Math.random()*0)){
	       			self.lootBagTime[msg.redbagId] = Math.floor(Math.random()*20)+5;
	       		}
	       		//console.log(self.lootBagTime[msg.redbagId]);
	       	}
	    })

	    this._gameSocket.on('sendRedBagResult',function(msg){
	        self._socre -= msg.sendBagCoin
	    })

	    this._gameSocket.on('lootRedBagResult',function(msg){
	    	if (msg.ResultCode){
	        	self._socre += msg.redbag.winscore;
	    	}
	    })

	    this._gameSocket.on('redbagEnd',function(msg){
	        self._socre += msg.winScore;
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
		//console.log("发包")
		var sendbagflag = Math.floor(Math.random()*20);
		if (!sendbagflag){
			//console.log("成功发包")
			var boomNum = Math.floor(Math.random()*10);
			var maxcoinId = -1;
			for (var i = 0; i < this.coinConfig.length; i++) {
				if (this._socre > this.coinConfig[i]){
					maxcoinId = i;
				}
			}
			if (maxcoinId != -1){
				var coinIdx = this.coinIdx[Math.floor(Math.random()*this.coinIdxLength[maxcoinId])];
				//console.log(coinIdx)
				this._gameSocket.emit('sendRedBag',{boomNum:boomNum,coin:this.coinConfig[coinIdx],count:10});
			}
        	
		}

		this.sendBagTime = 10 + Math.floor(Math.random()*10);
	}

	this.lootbag = function(_id){
		//console.log("抢包" + _id);
        this._gameSocket.emit('lootRedBag',{redBagId:_id});
		delete this.lootBagTime[_id];
	}

	

	this.init(_userInfo);
		
}
