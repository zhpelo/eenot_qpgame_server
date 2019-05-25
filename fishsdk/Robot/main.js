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

		this.MatchFishRobotCount = 0;
		this.FishRobotCount = 0;
		this.Game28RobotCount = 0;
		this.redbagRobotCount = 0;
		this.jia82RobotCount = 0;
		this.cowRobotCount = 0;

		this.xuniwin = 0;

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
			setInterval(this.time.bind(this),1000);
		}

		this.time = function(){
			//捕鱼比赛机器人

			 var date = new Date();
			 var hour = date.getHours();
			 var min = date.getMinutes() % 10;
			 var second = date.getSeconds();
			 var timeout = true;
			 if (hour >= 8){
			 	if (min >= 0 && min < 9){
			 		if (min == 0 && second > 30){
			 			//console.log(min + "|" +  second);
			 			timeout = false;
			 		}else if(min > 0){
			 			//console.log(min + "|" +  second);
			 			timeout = false;
			 		}else{
			 			//console.log("时间以外")
			 			if (!min && second == 10){
			 				//删掉所有用户
			 				for(var item in this.MatchFishRobotList){
			 					this.MatchFishRobotList[item].disconnect();
			 					delete this.MatchFishRobotList[item];
			 				}
			 				//console.log(this.robotidlist);
			 				this.MatchFishRobotCount = 0;
			 				this.MatchFishRobotMax = Math.floor(Math.random()*this.MatchMax) + this.MatchMin;
			 			}
			 		}
			 	}
			 }

			 if (!timeout){
			 	if (this.MatchFishRobotCount < this.MatchFishRobotMax){
			 		if (Math.floor(Math.random()*(10 + this.MatchFishRobotMax - this.MatchFishRobotCount))){

			 		}else{
			 			var idx = this.getNullRobotIdx();
					 	if (!this.MatchFishRobotList[idx]){
					 		console.log(idx + "进入捕鱼比赛房间");
					 		var account = "Robot" + idx;
							var userInfo = {account:account,robotMatch:true};
							var Robot = new FishMatchUser(userInfo);
							this.MatchFishRobotList[idx] = Robot;
							++this.MatchFishRobotCount;
					 	}
			 		}
			 	}
			 }

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
					var userInfo = {account:account,robotMatch:false};
					var Robot = new FishUser(userInfo);
					this.FishRobotList[idx] = Robot;
					++this.FishRobotCount;
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
					var userInfo = {account:account,robotMatch:false};
					var Robot = new game28User(userInfo);
					this.Game28RobotList[idx] = Robot;
					++this.Game28RobotCount;
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
					var userInfo = {account:account,robotMatch:false};
					var Robot = new jia82User(userInfo);
					this.jia82RobotList[idx] = Robot;
					++this.jia82RobotCount;
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
		 	
		}

		//获得一个空的机器人ID
		this.getNullRobotIdx = function(){
			var idx = Math.floor(Math.random()*1000);
			var flag = true;
			while(flag){
				if (this.MatchFishRobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
				}
				if (this.FishRobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
				}
				if (this.Game28RobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
				}
				if (this.redbagRobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
				}
				if (this.jia82RobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
				}
				if (this.cowRobotList[idx]){
					idx = Math.floor(Math.random()*1000);
					break;
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

