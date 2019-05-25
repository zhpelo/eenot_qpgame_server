var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){
		//运行初始化
		//this.init();

		this.timer = 0;
		this.robotidlist = {};
		this.robotCount = 0;
		//this.robotMax = Math.floor(Math.random()*10) + 10;
		this.robotMax = 3

		this.timetest = function(){
			setInterval(this.time.bind(this),1000);
		}

		this.time = function(){

			//得到当前时间
			 var date = new Date();
			 var hour = date.getHours();
			 var min = date.getMinutes() % 10;
			 var second = date.getSeconds();
			 var timeout = true;
			 // if (hour >= 6){
			 // 	if (min >= 0 && min < 9){
			 // 		if (min == 0 && second > 30){
			 // 			//console.log(min + "|" +  second);
			 // 			timeout = false;
			 // 		}else if(min > 0){
			 // 			//console.log(min + "|" +  second);
			 // 			timeout = false;
			 // 		}else{
			 // 			//console.log("时间以外")
			 // 			if (!min && second == 10){
			 // 				//删掉所有用户
			 // 				for(var item in this.robotidlist){
			 // 					this.robotidlist[item].disconnect();
			 // 					delete this.robotidlist[item];
			 // 				}
			 // 				console.log(this.robotidlist);
			 // 				this.robotCount = 0;
			 // 				this.robotMax = Math.floor(Math.random()*10) + 10;
			 // 			}
			 // 		}
			 // 	}
			 // }
			for(var item in this.robotidlist){
				if (!this.robotidlist[item].isOnline()){
					this.robotidlist[item].disconnect();
			 		delete this.robotidlist[item];
			 		--this.robotCount;
				}
			 }


		 	if (this.robotCount < this.robotMax){
		 		// if (Math.floor(Math.random()*(10 + this.robotMax - this.robotCount))){
		 		// 	return;
		 		// }
		 		var idx = Math.floor(Math.random()*500) + 500;
			 	if (!this.robotidlist[idx]){
			 		var account = "Robot" + idx;
					var userInfo = {account:account,robotMatch:false};
					var Robot = new User(userInfo);
					this.robotidlist[idx] = Robot;
					++this.robotCount;
			 	}
		 	}
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

