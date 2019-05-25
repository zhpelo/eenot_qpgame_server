FishUser = function(_userInfo){
	//相关属性

	this.bulletid = 0;
	this.addBulletid = 0;
	this._userId = 0;
	this.x = 0;
	this.RandCount = 0;
	this.TotalCount = Math.floor(Math.random()*1000) + 400;
	//this.TotalCount = Math.floor(Math.random()*2);
	this.timer;

	//离线后再次登录时间
	this._online = true;
	this._out = false;
	this._matchRoot = false;
	this.Applyflag = false;
	this.idx = 0;

	this.init = function(_userInfo){
		this.setAccount(_userInfo.account);
		this.setRobotType(_userInfo.robotMatch);
		this.idx = _userInfo.idx;
		//console.log(_userInfo)
		this._socre = 100;
		this.bulletid = 1;
		this.addBulletid = 1;
		this.sendUser = [];
		this.connect();
		this.time();

	};

	this.setRobotType = function(_flag){
		this._matchRoot = _flag;
	}

	this.setAccount = function(_Account){
		this._account = _Account;
	}

	this.getAccount = function(){
		return this._account;
	}

	this.EnterLoginServer = function(){
		this._socket.emit('login',{"userName":this.getAccount(),"sign":'cocogame2016`@33922200@@@@',"gameId":1})
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
            this._gameSocket.emit('LoginGame',{"userid":this._userId,"sign":this._sign})
        }
     }

    //进入房间
    this.loginroom = function(){
    	if (this._matchRoot){
    		this._gameSocket.emit('LoginRoom',{"roomid":11});
    	}else{
    		this._gameSocket.emit('LoginRoom',{"roomid":1});
    	}
        //生成随机数据
        this.randMake();
    }

    //随即生成
    this.randMake = function(){
    	//this.TotalCount += Math.floor(Math.random()*20);
    	//射击与不射击比例
    	this.stop = Math.floor(Math.random()*5);
    	//每次进鱼场射击的时间 与 休息时间
    	this.RandCount = Math.floor(Math.random()*20) + 5;
        this.x = Math.floor(Math.random()*800) + 70;
        this.y = Math.floor(Math.random()*500) + 70;
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
	      	self._socre = result.Obj.score;
	      	self._online = true;

			//未进入桌子
			if (self._matchRoot){
				self.ApplyMatch();
			}

    	})

	    this._socket.on('ServerListResult',function(msg){
	    	//console.log(msg)
	    	if (self._matchRoot){
	    		var idx = 0;
		        self._ip = msg.GameInfo[0].serverInfo.match[idx].ip;
		        self._port = msg.GameInfo[0].serverInfo.match[idx].prot;

	    	}else{
		    	console.log(self._userId + "进入捕鱼" + parseInt(self.idx + 1) +"倍房间!");
		        self._ip = msg.GameInfo[0].serverInfo.normal[self.idx].ip;
		        self._port = msg.GameInfo[0].serverInfo.normal[self.idx].prot;
		        //self._ip = msg.GameInfo[0].serverInfo.normal[0].ip;
		        //self._port = msg.GameInfo[0].serverInfo.normal[0].prot;
	    	}

	        //进入游戏
	        self.connectGame();
	    })

	    this._socket.on('applyMatchResult',function(msg){
			//console.log(msg);
			if (msg.ResultCode){
				self.Applyflag = true;
			}else if(msg.msg == "已经报名了"){
				self.Applyflag = true;
			}else{
				self.Applyflag = false;
			}
			
		})

	}

	this.shoot = function(){
		//console.log("again:" + this.again + " RandCount:" + this.RandCount + " TotalCount:" + this.TotalCount)
		if (this._out){
			return;
		}
		if (this.bulletid > 100000){
			this.bulletid = 0;
		}

		--this.TotalCount;
		--this.RandCount;
		this.bulletid++;

		//console.log(this._userId)

		if (!this._socre){
			//console.log("here");
			this.TotalCount = 0;
		}

		if (this.RandCount <= 0){
			this.randMake();
		}

		//console.log(this.bulletid)
		if (this.sendUser.length > 0 && this._socre){
			if (this.stop){
				if (this._matchRoot){
					//比赛模式打慢一些
					var shoot = Math.floor(Math.random()*5);
					if (!shoot){
						this._gameSocket.emit('fishShoot',{"userid":this._userId,"bet":1,"bulletId":this.bulletid,"position":{"x":this.x,"y":this.y},"robot":1,"sendUser":this.sendUser[0]})
					}
			
				}else{
					this._gameSocket.emit('fishShoot',{"userid":this._userId,"bet":1,"bulletId":this.bulletid,"position":{"x":this.x,"y":this.y},"robot":1,"sendUser":this.sendUser[0]})
				}
				
			}
		}else{
			if (this._gameSocket){
				var shoot = Math.floor(Math.random()*50);
				if (!shoot){
					if (this._matchRoot && this.Applyflag && this._socre){
						//console.log("发射");
						this._gameSocket.emit('fishShoot',{"userid":this._userId,"bet":1,"bulletId":this.bulletid,"position":{"x":100,"y":100}})
						this._gameSocket.emit('fishHit',{"fishId":this.fishId,"bulletId":this.bulletid})

					}
					
				}
			}

		}
        
        //console.log(this._userId)
        //this._gameSocket.emit('fishHit',{fishId:this.fishId,bulletId:this.bulletid - 2})
	}

	this.time = function(){
		if (!this.timer){
			var second=200;
			this.timer = setInterval(this.shoot.bind(this),second);
		}
	}

	this.out = function(){
		this.disconnect();
		clearInterval(this.timer);
		this._out = true;
	}

	//报名
	this.ApplyMatch = function(){
		console.log("报名");
		this._socket.emit('applyMatch',{"roomid":11});
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

		this._gameSocket.on('FishOut',function(result){
			//console.log(result.fishId)
			self.fishId = result.fishId;
		})

		this._gameSocket.on('LoginRoomResult',function(msg){
			//console.log(msg);
			if (msg.ResultData){
				var idx = 0;
				//设置帮发用户
				for(var i = 0 ; i < msg.ResultData.userList.length ; i++){
					if (msg.ResultData.userList[i].userType == 0){
						self.sendUser.push(msg.ResultData.userList[i].userId);
						++idx;
						break;
					}
				}
				self._gameSocket.emit('getMoguiCount');
			}

			//console.log(self.sendUser)
			//登录成功
			//设置定时器
			//self.time();
			
		})

		this._gameSocket.on('playEnter',function(msg){
			//console.log(msg);
			if (!msg.ResultData.userType){
				self.sendUser.push(msg.ResultData.UserId);
			}
		})

		this._gameSocket.on('PlayerOut',function(msg){
			//console.log(msg);
			for(var i = 0 ; i < self.sendUser.length ; i++){
				if (self.sendUser[i] == msg.userId){
					self.sendUser.splice(i,1);
				}
			}
			//console.log(self.sendUser)
		})

		this._gameSocket.on('addgoldResult',function(msg){
			//console.log(msg);
		})

		this._gameSocket.on('match_countdown',function(msg){
			//console.log("match_countdown");
		})

		this._gameSocket.on('matchRank',function(msg){
			//console.log(msg);
		})

		this._gameSocket.on('HitResult',function(msg){
			//console.log(msg);
			if (self._userId == msg.ResultData.userId){
				self._socre = self._socre - 1 + msg.ResultData.hitSocre;
			}
			//console.log(self._socre);

		})

		this._gameSocket.on('fishShoot',function(msg){
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
		this.Applyflag = false;

		this.sendUser = [];
		clearInterval(this.timer);
	} 

	this.isOnline = function(){
		return this.TotalCount > 0;
	}

	this.init(_userInfo);
		
}

//module.exports = User;