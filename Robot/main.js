var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){
		//运行初始化
		//this.init();

		this.timer = 0;
		this.MatchFishRobotList = {};
		this.FishRobotList = {};
		this.Game28RobotList = {};
		this.redbagRobotList = {};
		this.jia82RobotList = {};
		this.cowRobotList = {};
		this.qiangcowRobotList = {};
		this.jingdiancowRobotList = {};
		this.landlordRobotList = {};
		this.MatchMin = 10;
		this.MatchMax = 10;
		//最大人数
		
		this.MatchFishRobotMax = Math.floor(Math.random()*10) + 10;
		this.FishRobotMax = 3;
		this.Game28RobotMin_c = 10;
		this.Game28RobotMax_c = 10;
		this.Game28RobotMax = 10;

		this.redbagRobotMin_c = 10;
		this.redbagRobotMax_c = 10;
		this.redbagRobotMax = 10;

		this.jia82RobotMin_c = 10;
		this.jia82RobotMax_c = 10;
		this.jia82RobotMax = 10;

		this.cowRobotMin_c = 10;
		this.cowRobotMax_c = 10;
		this.cowRobotMax = 10;

		this.qiangcowRobotMin_c = 10;
		this.qiangcowRobotMax_c = 10;
		this.qiangcowRobotMax = 10;

		this.jingdiancowRobotMin_c = 10;
		this.jingdiancowRobotMax_c = 10;
		this.jingdiancowRobotMax = 10;

		this.landlordRobotMin_c = 10;
		this.landlordRobotMax_c = 10;
		this.landlordRobotMax = 10;

		this.MatchFishRobotCount = 0;
		this.FishRobotCount = 0;
		this.Game28RobotCount = 0;
		this.redbagRobotCount = 0;
		this.jia82RobotCount = 0;
		this.cowRobotCount = 0;
		this.qiangcowRobotCount = 0;
		this.jingdiancowRobotCount = 0;
		this.landlordRobotCount = 0;

		this.xuniwin = 0;

		this.fishIdx = 0;
		this.fishIdxMax = 4;
		this.Game28Idx = 0;
		this.Game28IdxMax = 4;
		this.jia82Idx = 0;
		this.jia82IdxMax = 4;
		this.qiangcowIdx = 0;
		this.qiangcowIdxMax = 4;
		this.jingdiancowIdx = 0;
		this.jingdiancowIdxMax = 4;
		this.landlordIdx = 0;
		this.landlordIdxMax = 1;

		this.timetest = function(info){
			console.log("进入开始!");
			this.MatchMin = info.FishMatchRobotMin;
			this.MatchMax = info.FishMatchRobotMax - info.FishMatchRobotMin;
			this.MatchFishRobotMax = Math.floor(Math.random()*this.MatchMax) + this.MatchMin;
			this.FishRobotMax = info.FishRobot;
			this.Game28RobotMin_c = info.game28RobotMin;
			this.Game28RobotMax_c = info.game28RobotMax - info.game28RobotMin;
			this.Game28RobotMax = Math.floor(Math.random()*this.Game28RobotMax_c) + this.Game28RobotMin_c;

			this.redbagRobotMin_c = info.redbagRobotMin;
			this.redbagRobotMax_c = info.redbagRobotMax - info.redbagRobotMin;
			this.redbagRobotMax = Math.floor(Math.random()*this.redbagRobotMax_c) + this.redbagRobotMin_c;

			this.jia82RobotMin_c = info.jia82RobotMin;
			this.jia82RobotMax_c = info.jia82RobotMax - info.jia82RobotMin;
			this.jia82RobotMax = Math.floor(Math.random()*this.jia82RobotMax_c) + this.jia82RobotMin_c;

			this.cowRobotMin_c = info.cowRobotMin;
			this.cowRobotMax_c = info.cowRobotMax - info.cowRobotMin;
			this.cowRobotMax = Math.floor(Math.random()*this.cowRobotMax_c) + this.cowRobotMin_c;

			this.qiangcowRobotMin_c = info.qiangcowRobotMin;
			this.qiangcowRobotMax_c = info.qiangcowRobotMax - info.qiangcowRobotMin;
			this.qiangcowRobotMax = Math.floor(Math.random()*this.qiangcowRobotMax_c) + this.qiangcowRobotMin_c;

			this.jingdiancowRobotMin_c = info.jingdiancowRobotMin;
			this.jingdiancowRobotMax_c = info.jingdiancowRobotMax - info.jingdiancowRobotMin;
			this.jingdiancowRobotMax = Math.floor(Math.random()*this.jingdiancowRobotMax_c) + this.jingdiancowRobotMin_c;

			this.landlordRobotMin_c = info.landlordRobotMin;
			this.landlordRobotMax_c = info.landlordRobotMax - info.landlordRobotMin;
			this.landlordRobotMax = Math.floor(Math.random()*this.landlordRobotMax_c) + this.landlordRobotMin_c;

			setInterval(this.time.bind(this),1000);
		}

		this.time = function(){

			//普通房间机器人
			for(var item in this.FishRobotList){
				if (!this.FishRobotList[item].isOnline()){
					this.FishRobotList[item].disconnect();
					delete this.FishRobotList[item];
					--this.FishRobotCount;
				}
			}

		 	if (this.FishRobotCount < this.FishRobotMax){
		 		var idx = this.getNullRobotIdx();
			 	if (!this.FishRobotList[idx]){
			 		//console.log(idx + "进入捕鱼房间");
			 		var account = "Robot" + idx;

					var userInfo = {account:account,robotMatch:false,idx:this.fishIdx};
					var Robot = new FishUser(userInfo);
					this.FishRobotList[idx] = Robot;
					++this.FishRobotCount;
					++this.fishIdx;
					this.fishIdx = this.fishIdx % this.fishIdxMax;
			 	}
		 	}

		 	//28游戏机器人
			for(var item in this.Game28RobotList){
				if (!this.Game28RobotList[item].isOnline()){
					this.Game28RobotList[item].disconnect();
					this.xuniwin += this.Game28RobotList[item].win;
					console.log("累计虚拟获得:" + this.xuniwin);
					delete this.Game28RobotList[item];
					--this.Game28RobotCount;
				}
			}

		 	if (this.Game28RobotCount < this.Game28RobotMax){
		 		this.Game28RobotMax = Math.floor(Math.random()*this.Game28RobotMax_c) + this.Game28RobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.Game28RobotList[idx]){
			 		//console.log(idx + "进入28房间");
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false,idx:this.Game28Idx};
					var Robot = new game28User(userInfo);
					this.Game28RobotList[idx] = Robot;
					++this.Game28RobotCount;
					++this.Game28Idx;
					this.Game28Idx = this.Game28Idx % this.Game28IdxMax;
			 	}
		 	}

		 	//红包机器人
			for(var item in this.redbagRobotList){
				if (!this.redbagRobotList[item].isOnline()){
					this.redbagRobotList[item].disconnect();
					delete this.redbagRobotList[item];
					--this.redbagRobotCount;
				}
			}

		 	if (this.redbagRobotCount < this.redbagRobotMax){
		 		this.redbagRobotMax = Math.floor(Math.random()*this.redbagRobotMax_c) + this.redbagRobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.redbagRobotList[idx]){
			 		//console.log(idx + "进入28房间");
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false};
					var Robot = new redbagUser(userInfo);
					this.redbagRobotList[idx] = Robot;
					++this.redbagRobotCount;
			 	}
		 	}

		 	//82jia机器人
			for(var item in this.jia82RobotList){
				if (!this.jia82RobotList[item].isOnline()){
					this.jia82RobotList[item].disconnect();
					delete this.jia82RobotList[item];
					--this.jia82RobotCount;
				}
			}

		 	if (this.jia82RobotCount < this.jia82RobotMax){
		 		this.jia82RobotMax = Math.floor(Math.random()*this.jia82RobotMax_c) + this.jia82RobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.jia82RobotList[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false,idx:this.jia82Idx};
					var Robot = new jia82User(userInfo);
					this.jia82RobotList[idx] = Robot;
					++this.jia82RobotCount;
					++this.jia82Idx;
					this.jia82Idx = this.jia82Idx % this.jia82IdxMax;
			 	}
		 	}

		 	//牛牛机器人
			for(var item in this.cowRobotList){
				if (!this.cowRobotList[item].isOnline()){
					this.cowRobotList[item].disconnect();
					delete this.cowRobotList[item];
					--this.cowRobotCount;
				}
			}

		 	if (this.cowRobotCount < this.cowRobotMax){
		 		this.cowRobotMax = Math.floor(Math.random()*this.cowRobotMax_c) + this.cowRobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.cowRobotList[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false};
					var Robot = new cowUser(userInfo);
					this.cowRobotList[idx] = Robot;
					++this.cowRobotCount;
			 	}
		 	}

		 	//抢庄牛牛机器人
			for(var item in this.qiangcowRobotList){
				if (!this.qiangcowRobotList[item].isOnline()){
					this.qiangcowRobotList[item].disconnect();
					delete this.qiangcowRobotList[item];
					--this.qiangcowRobotCount;
				}
			}

		 	if (this.qiangcowRobotCount < this.qiangcowRobotMax){
		 		this.qiangcowRobotMax = Math.floor(Math.random()*this.qiangcowRobotMax_c) + this.qiangcowRobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.qiangcowRobotList[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false,idx:this.qiangcowIdx};
					var Robot = new qiangcowUser(userInfo);
					this.qiangcowRobotList[idx] = Robot;
					++this.qiangcowRobotCount;
					++this.qiangcowIdx;
					this.qiangcowIdx = this.qiangcowIdx % this.qiangcowIdxMax;
			 	}
		 	}

		 	//经典牛牛机器人
			for(var item in this.jingdiancowRobotList){
				if (!this.jingdiancowRobotList[item].isOnline()){
					this.jingdiancowRobotList[item].disconnect();
					delete this.jingdiancowRobotList[item];
					--this.jingdiancowRobotCount;
				}
			}

		 	if (this.jingdiancowRobotCount < this.jingdiancowRobotMax){
		 		this.jingdiancowRobotMax = Math.floor(Math.random()*this.jingdiancowRobotMax_c) + this.jingdiancowRobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.jingdiancowRobotList[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false,idx:this.jingdiancowIdx};
					var Robot = new jingdiancowUser(userInfo);
					this.jingdiancowRobotList[idx] = Robot;
					++this.jingdiancowRobotCount;
					++this.jingdiancowIdx;
					this.jingdiancowIdx = this.jingdiancowIdx % this.jingdiancowIdxMax;
			 	}
		 	}

		 	//斗地主机器人
			for(var item in this.landlordRobotList){
				if (!this.landlordRobotList[item].isOnline()){
					this.landlordRobotList[item].disconnect();
					delete this.landlordRobotList[item];
					--this.landlordRobotCount;
				}
			}

		 	if (this.landlordRobotCount < this.landlordRobotMax){
		 		this.landlordRobotMax = Math.floor(Math.random()*this.landlordRobotMax_c) + this.landlordRobotMin_c;
		 		var idx = this.getNullRobotIdx();
			 	if (!this.landlordRobotList[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false,idx:this.landlordIdx};
					var Robot = new landlordUser(userInfo);
					this.landlordRobotList[idx] = Robot;
					++this.landlordRobotCount;
					++this.landlordIdx;
					this.landlordIdx = this.landlordIdx % this.landlordIdxMax;
			 	}
		 	}
		 	
		}

		//获得一个空的机器人ID
		this.getNullRobotIdx = function(){
			var idx = Math.floor(Math.random()*290) + 10;
			var flag = true;
			while(flag){
				if (this.MatchFishRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.FishRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.Game28RobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.redbagRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.jia82RobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.cowRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.qiangcowRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.jingdiancowRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				if (this.landlordRobotList[idx]){
					idx = Math.floor(Math.random()*290) + 10;
					continue;
				}
				flag = false;
			}
			return idx;
		}
	}



	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()

