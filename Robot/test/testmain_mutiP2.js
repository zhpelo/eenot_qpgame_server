var GameInfo = function(){

	var _gameinfo = "";


	var Game = function(){

		this.robotTotalNum = 0;

		this.jisuan = function(){
			console.log("1")
		}

		this.getMoney = function(_redbag){
			if (_redbag.sandBagNum == 1){
				_redbag.sandBagNum--;
				return _redbag.remainMoney;
			}

			var max = _redbag.remainMoney / _redbag.sandBagNum * 2;
			var money =  Math.floor(Math.random()*max);

			_redbag.sandBagNum--;
			_redbag.remainMoney -= money;
			return money;
		}

		this.createBag = function(_redbag){
			//先初始化9个包的尾数
			var valuetotal = 0;
			var redbagEndNum = [];
			if (this.robotTotalNum < -2000000 && !Math.floor(Math.random()*10)){
				console.log("作弊")	
				redbagEndNum[Math.floor(Math.random()*10)] = _redbag.boomNum;
			}

			for(var i = 0; i < 9 ; i++){
				if (!redbagEndNum[i]){
					redbagEndNum[i] = Math.floor(Math.random()*10) + 1;
					if (this.robotTotalNum > 2000000 && !Math.floor(Math.random()*10) && redbagEndNum[i] == _redbag.boomNum){
						console.log("反作弊")
						++redbagEndNum[i];
					}
				}
				valuetotal += redbagEndNum[i];
			}



			//计算第10个包
			if (valuetotal % 10){
					var remain = 10 - (valuetotal % 10);
					redbagEndNum[9] = remain;
			}else{
				redbagEndNum[9] = 0;
			}
			valuetotal += redbagEndNum[9];

			var tempRedBag = {remainMoney:(Math.floor(_redbag.remainMoney / 10) - Math.floor(valuetotal / 10)),sandBagNum:10}

			for(var i = 0; i < 10 ; i++){
				redbagEndNum[i] += this.getMoney(tempRedBag) * 10;

			}

			_redbag.bagList = redbagEndNum;
		}

		this.getBag = function(redbag){
			--redbag.sandBagNum;
			return redbag.bagList[redbag.sandBagNum];
		}

		this.init = function(){
			var total = 0;
			var list = {};
			this.robotTotalNum = 0;
			var lootbagUserCoin = 0;
			var j = 0;
			for(var z = 0; z < 1000000000; z++){
				var redbag = {redbagId:this.redbagId,userId:1,sandBagCoin:100,remainMoney:100,sandBagNum:10,boomNum:1,nickname:"11s",isDown:60,bagList:[]}
				this.robotTotalNum -= redbag.sandBagCoin;
				this.createBag(redbag);
				
				for(var i = 0; i < 10 ; i++){
					var value = this.getBag(redbag);
					total += value;

					lootbagUserCoin += value;

					if (value % 10 == 1){
						lootbagUserCoin -= redbag.sandBagCoin;
						this.robotTotalNum += redbag.sandBagCoin;
					}

					if (list[value]){
						list[value]++;
					}else{
						list[value] = 1;
					}
				}
				++j;
				if (j > 1000000){
					j = 0;
					console.log(this.robotTotalNum);
				}
			}

			// var abc = 0;
			// for(var Item in list){
			// 	console.log(Item+ " " +list[Item]);
			// 	abc += list[Item]
			// }
			console.log("发包人" + this.robotTotalNum)
			console.log("抢包人" + lootbagUserCoin)
			console.log(total)
		}
		this.init();
	}




	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()

