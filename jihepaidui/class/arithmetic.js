var gameDao = require("./../dao/gameDao");

arithmetic = function(_idx){
	//相关属性
	//调试是否显示相关数据
	var debug = false;

	//算法说明：
	//游戏倍数分别为
	//2,5,20,3,10,40,5,15,60,7,20,100,30,200,1000,10,30,160,15,40,200,20,80,400,50,200,1000
	//所以以上的概率为50%,20%,5%
	//
	//
	//本算法说明，先选中组合，然后再尝试他的概率。
	var bet = [[2,5,20],[5,15,60],[10,30,160],[20,80,400],[50,200,1000],[100,400,2000],[0,0,0]];
	var linesPoint = [[5,6,7,8,9],[0,1,2,3,4],[10,11,12,13,14],[0,6,12,8,4],[10,6,2,8,14],[0,1,7,3,4],[10,11,7,13,14],[5,11,12,13,9],[5,1,2,3,9]]
	//所有击中的bet
	var pro = [2,5,10,15,20,30,60,50,80,100,160,200,400,1000,2000];
	var pro_p = [140,200,200,200,140,120,100,80,70,60,50,40,30,20,10];
	//免费次数
	var freeCountArr = [5,10,15];
	//可选择倍数
	var betCountObj = {};
	betCountObj[1] = 1;
	betCountObj[2] = 2;
	betCountObj[5] = 3;
	betCountObj[10] = 4;
	betCountObj[20] = 5;
	betCountObj[50] = 6;
	betCountObj[100] = 7;
	var betCount = [1,2,5,10,20,50,100];

	//pro 能整除最大值
	this.pro_max = new Array();
	//pro 个数
	this.pro_max_count = new Array();
	//外部控制倍率
	this.controlBet = 0.98;
	//超级大奖占成
	this.poolBet = 0.01;
	//最大公约数
	this.max_pro = 0;

	this._testMax = 0;

	//分数数组
	this.scoreArr = {};

	//虚拟奖池
	this.virtual_score_pool = 1000000;
	//实际奖池
	this.score_pool = [];

	this.printPool = function(){
		for(var i = 0 ; i < betCount.length ; ++i){
			console.log("i:" + i + "-" + this.score_pool[i]);
		}
	}

	//获得实际奖池
	this.getScorePool =function(_betIdx){
		if (this.score_pool[_betIdx]){
			this.printPool();
			return this.score_pool[_betIdx];
		}else{
			//this.printPool();
			return 0
		}
		
	}

	this.getScorePoolList = function(){
		return this.score_pool;
	}

	this.getScorePoolListLength = function(){
		return betCount.length;
	}

	//添加实际奖池
	this.addScorePool = function(_betIdx,_socre){
		if (this.score_pool[_betIdx]){
			this.score_pool[_betIdx] += parseInt(_socre);
		}else{
			this.score_pool[_betIdx] = 0;
			this.score_pool[_betIdx] += parseInt(_socre);
		}

		this.printPool();
	}

	//减少奖池
	this.subScorePool = function(_betIdx){
		if (this.score_pool[_betIdx]){
			this.score_pool[_betIdx] -= this.subValue;
		}else{
			this.score_pool[_betIdx] = 0;
		}
		this.printPool();
	}

	this.getAllcaishenValue = function(){
		//获得全财神的值
		return this.subValue;
	}

	//获得奖池
	this.getVirtualScorePool =function(){
		//var result = {virtual_score_pool:this.virtual_score_pool,score_pool}
		return this.virtual_score_pool;
	}

	//添加奖池
	this.addVirtualScorePool = function(score_bet){
		this.virtual_score_pool += parseInt(score_bet);
	}

	//减少虚拟奖池
	this.subVirtualScorePool = function(score_bet,flag){
		this.subValue = Math.floor((this.virtual_score_pool / 100 * score_bet * 0.9));
		//console.log(score_bet)
		//console.log(this.virtual_score_pool)
		//console.log(this.subValue)
		if (flag){
			this.virtual_score_pool -= this.subValue;
		}else{
			if (this.virtual_score_pool - this.subValue > 900000 || this.virtual_score_pool > 2000000){
				this.virtual_score_pool -= this.subValue;
			}
		}

	}

	this.init = function(){
		//this.betTimes = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
		//this.HitTimes = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
		//this.Total = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
		//this.Count = 0;

		//console.log(this.check([[1,1,5,6,7],[1,1,8,0,0],[3,4,5,2,2]]));
		
		//获得最大公约数
		//this.initMax_pro();

		//概率数组
		this.initBetArr()

		//生成一批分数数据
		this.initArrData();

		//初始化彩池
		this.initPool();

		//初始化集中概率
		this.initHitPro();
		//debug = true;

	}

	this.initHitPro = function(){
		this.hitpro = [];
		this.hitproMax = 0;
		for(var i = 0;i < pro_p.length ; ++i){
			
			for (var j = 0 ; j < pro_p[i] ; ++j){
				this.hitpro[this.hitproMax + j] = i;
			}
			this.hitproMax += pro_p[i];
		}

	}

	this.initBetArr = function(){
		this.proCount = new Array();
		this.HitTimes = new Array();
		for(var i = 0;i < pro.length ; ++i){
			this.proCount[i] = new Array();
			this.HitTimes[i] = new Array();
			this.pro_max_count[i] = Math.floor(10000 / pro[i]);
			this.pro_max[i] = this.pro_max_count[i] * pro[i];
			this.pro_max_count[i] = Math.floor(this.pro_max_count[i] * (this.controlBet - this.poolBet));
			//console.log("max:" + this.pro_max[i] + " bet:" + pro[i]);
			//console.log("count:" + this.pro_max_count[i]);
			for (var j = 0 ; j < betCount.length ; j++){
				//开始创建10000数组
				this.proCount[i][j] = new Array();
				this.HitTimes[i][j] = 0;
				for(var k = 0 ; k < 9999 ; ++k){
					//先把所有先定制为0;
					this.proCount[i][j][k] = 0;
				}
				var point = 0;

				for(var k = 0 ; k < this.pro_max_count[i] ; ++k){
					//插入数据
					point += Math.floor(Math.random()*pro[i]);
					this.proCount[i][j][point] = 1;
					++point;
				}
				//随机打乱
				for(var z = 0 ; z < 10 ; z++){
					for(var k = 0 ; k < 5000 ; ++k){
						var temp = this.proCount[i][j][k];
						var idx = Math.floor(Math.random()*this.pro_max[i]);
						this.proCount[i][j][k] = this.proCount[i][j][idx];
						this.proCount[i][j][idx] = temp;
					}
				}
				//console.log(this.proCount[i][j]);
			}
		}

		//测试
		// var ii = 0;
		// var jj = 2;
		// var iijjcount = 0;
		// for(var k = 0 ; k < this.pro_max[ii] ; ++k){
		// 	//先把所有先定制为0;
		// 	if (this.proCount[ii][jj][k] == 1)
		// 		iijjcount += (this.proCount[ii][jj][k] * pro[ii]);
		// }
		// console.log("应该等于:" + this.pro_max_count[ii] * pro[ii]);
		// console.log(iijjcount / this.pro_max[ii]);
	}

	this.initArrData = function(){
		//test
		this.createArr(100000);
		console.log("生成分数数据");
	}

	this.initPool = function(){
		var self = this;
		
		gameDao.getScore_pools(function(Result){
			self.score_pool[0] = Result.score_pool_value1;
			self.score_pool[1] = Result.score_pool_value2;
			self.score_pool[2] = Result.score_pool_value5;
			self.score_pool[3] = Result.score_pool_value10;
			self.score_pool[4] = Result.score_pool_value20;
			self.score_pool[5] = Result.score_pool_value50;
			self.score_pool[6] = Result.score_pool_value100;
			self.virtual_score_pool = Result.virtual_score_pool_value;
			console.log("读取采池数据完毕!")
		})

		
	}

	//获得当前概率
	this.getBet = function(){
		return this.controlBet;
	}

	//设置概率
	this.setBet = function(_bet){
		this.controlBet = _bet;
	}

	//_pro是鱼ID,_betIdx是倍率,hitCount次数
	this.hit = function(_pro,_betidx,hitCount){

		if (Math.floor((this.HitTimes[_pro][_betidx] / 10)) >= this.pro_max[_pro]){
			//已经达到重新计算阶段
			//console.log("this.HitTimes[_pro][_bet] " + (this.HitTimes[_pro][_bet] / 10))
			//console.log("this.pro_max[_pro] " + this.pro_max[_pro])
			console.log("重新计算_pro:" + _pro + " _bet" + betCount[_betidx]);
			//随机打乱
			for(var k = 0 ; k < 1000 ; ++k){
				var temp = this.proCount[_pro][_betidx][k];
				var idx = Math.floor(Math.random()*this.pro_max[_pro]);
				this.proCount[_pro][_betidx][k] = this.proCount[_pro][_betidx][idx];
				this.proCount[_pro][_betidx][idx] = temp;
			}


			this.HitTimes[_pro][_betidx] = 0;

			//入彩池
			this.addScorePool(_betidx,Math.floor(betCount[_betidx] * 10000 * this.poolBet));
		}

		if (this.HitTimes[_pro][_betidx] % 10 == 0){
			//可以整除
			
			var idx = Math.floor(this.HitTimes[_pro][_betidx] / 10);
			this.HitTimes[_pro][_betidx] += hitCount;
			++this._testMax;
			if (this.proCount[_pro][_betidx][idx]){
				console.log("**fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);				
			}else{
				console.log("fishType:" + _pro + " bet:" + _betidx + " idx:" + idx + " testMax:" + this._testMax + " maxpro" + this.pro_max_count[_pro] + " ag:" + this.pro_max[_pro]);
			}
			return this.proCount[_pro][_betidx][idx];
		}else{

			this.HitTimes[_pro][_betidx] += hitCount;
			return 0;
		}

	}

	this.CheckBet = function(_bet){
		if (betCountObj[_bet]){
			return true;
		}else{
			return false;
		}
	}

	//var hitCount_t = 0;
	//用户获得数组
	this.getArray = function(_bet,_LotteryCount){

		var betValue = 0;
		var betidx;
		//获取倍数,_bet是倍数的ID
		if (betCountObj[_bet]){
			betValue = _bet;
			betidx = betCountObj[_bet] - 1;
		}else{
			console.log(_bet + "没有这个概率");
			var ServerArray = [[1,2,3,4,6],
                [1,2,3,4,6],
                [1,2,3,4,6]]; 

  		       return ServerArray;
		}

		//获得前,先更新一下数组
		this.createArr(1);

		//产生随机数删掉虚拟池
		var rand = Math.floor(Math.random()*10000);
		
		if (rand == 0 && _LotteryCount > 5000){
			
			//检测实际实际奖池是否能发
			//console.log("this.getScorePool(betValue)" + this.getScorePool(betValue))
			//console.log("betValue" + betValue)
			if (this.getScorePool(betidx) > 10000 * betValue){
				//发奖励
				console.log("发大奖!");
				console.log("_LotteryCount:" + _LotteryCount);
				this.subVirtualScorePool(betValue,true);
				this.subScorePool(betidx);

				var ServerArray = [[6,6,6,6,6],
                [6,6,6,6,6],
                [6,6,6,6,6]]; 

  		       return ServerArray;
			}else{
				this.subVirtualScorePool(betValue,false);
			}
		}


		//尝试击中
		var total_temp = 0;
		
		var now_pro_p = Math.floor(Math.random()*this.hitproMax);

		var now_pro = this.hitpro[now_pro_p];
		//now_pro 是鱼的IDX, betidx 是倍率IDX
		//now_pro-为正常 
		//0-调试 只中2分
		now_pro = 1;
		if (this.hit(now_pro,betidx,10)){
				total_temp = pro[now_pro];
				//console.log("***" + total_temp);
		}

	
		//原计划是
		sourcetotal_temp = total_temp;
		//寻找相近的数组
		while (!(this.scoreArr[total_temp])){
			--total_temp;
		}
		
		// if ((sourcetotal_temp - total_temp)){
		// 	console.log("相差:" + (sourcetotal_temp - total_temp) + " total_temp:" + total_temp);
		// 	//加入实际彩池
		// }

		var idx = Math.floor(Math.random()*this.scoreArr[total_temp].length);

		//加入虚拟彩池
		if (total_temp == 0){
			var virtual_score_pool_before = this.getVirtualScorePool();
			this.addVirtualScorePool(betValue);
			var virtual_score_pool_current = this.getVirtualScorePool();
			//入库
			//var userInfo = {userid:_userId,score_pool_before:score_pool_before,score_pool_value:betValue,
			//	score_pool_current:score_pool_current,virtual_score_pool_before:virtual_score_pool_before,
			// 	virtual_score_pool_value:betValue,virtual_score_pool_current:virtual_score_pool_current}
			//gameDao.score_poolLog(userInfo);

		}else{
			if (debug){
				console.log(this.scoreArr[total_temp][idx])
			}
		}

  		//增加免费次数
  		if (total_temp == 5 || total_temp == 10 || total_temp == 15){
  			var i = 10;
  			while (this.check(this.scoreArr[total_temp][idx]).freeCount != total_temp && i > 0)
  			{
  				idx = Math.floor(Math.random()*this.scoreArr[total_temp].length);
  				i--;
  			}
  		}
 		
		return this.scoreArr[total_temp][idx];
	}

	this.createArr = function(_count){
		//生成_count个
		for(var times = 0; times < _count ; times++){
			var ResultArray = new Array();
			for(var i=0;i<3;i++){
				ResultArray[i] = new Array();
				for(var j=0;j<5;j++){
					ResultArray[i][j] = Math.floor(Math.random()*bet.length)
				}
			}
			//获得分数
			
			var info = this.check(ResultArray,0);
			

			if (this.scoreArr[(info.scoreCount + info.freeCount)]){
				//分数已经存在
				if (this.scoreArr[(info.scoreCount + info.freeCount)].length < 500){
					//只存500组
					this.scoreArr[(info.scoreCount + info.freeCount)].push(ResultArray);
				}else{
					this.scoreArr[(info.scoreCount + info.freeCount)].shift()
					this.scoreArr[(info.scoreCount + info.freeCount)].push(ResultArray);
				}
			}else{
				//分数还未存在
				this.scoreArr[(info.scoreCount + info.freeCount)] = new Array();
				this.scoreArr[(info.scoreCount + info.freeCount)].push(ResultArray);
			}
		}
	}

	//1.0 正式版本,免费次数版本
	this.check = function(reArray,_debug){

		//console.log("###check")
		//检查分数总和
		var scoreCount = 0;

		var freeCount = 0;

		//判断是否是全屏元宝
		var max_yuanbao = true;
		for(var i = 0 ;i < reArray.length && max_yuanbao ; i++){
			for (var j = 0;j < reArray[0].length ; j ++){
				if (reArray[i][j] != 5) {
					max_yuanbao = false;
					break;
				}
			}
		}
		
		if (max_yuanbao) {
			console.log("全元宝");
			return 0;
		}
		//判断全屏财神
		var max_caisheng = true;
		for(var i = 0 ;i < reArray.length && max_caisheng ; i++){
			for (var j = 0;j < reArray[0].length ; j ++){
				if (reArray[i][j] != 6) {
					max_caisheng = false;
					break;
				}
			}
		}
		
		if (max_caisheng){
			console.log("全财神");
			console.log("中奖:" + this.subValue)
			return {scoreCount:this.subValue,freeCount:0,bigScore:1};
		}

		for (var i = 0 ; i < 9 ; i++){
			
			//从左到右
			var j = 0;
			var sameCard = -1;
			var sameCardCount = 1;
			sameCardCount = 1;
			for(j = 0 ;j < linesPoint[0].length ; ++j){
				//获得坐标

				var row = Math.floor(linesPoint[i][j] / 5);
				var col = linesPoint[i][j] % 5;

				if (sameCard == -1){
					//得到第一个
					if (reArray[row][col] == -1) break;
					sameCard = reArray[row][col];
					continue;
				}

				if (reArray[row][col] == sameCard || (sameCard != 6 && reArray[row][col] == 5)){
					//console.log("reArray["+row+"]["+col+"]:" + reArray[row][col] + " sameCard:" + sameCard)
					++sameCardCount;
					
				}else{
					//不能再找到相同的
					if (sameCard == 5 && reArray[row][col] != -1 && reArray[row][col] != 6){
						sameCard = reArray[row][col];
						++sameCardCount;
					}else{
						break;
					}
				}
				
			}
			//得出结果
			if(sameCardCount > 2){
				if (debug && _debug)
				{
					console.log("left===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
				}
				scoreCount += bet[sameCard][sameCardCount - 3]
				//如果是财神,统计
				
				if (sameCard == 6){
					freeCount += freeCountArr[sameCardCount - 3];
				}

			}
			
			//从右到左
			if (sameCardCount != 5)
			{
				sameCard = -1;
				sameCardCount = 1;
				sameCardCount = 1;
				for(j = linesPoint[0].length - 1 ;j >= 0  ; --j){
					//获得坐标

					var row = Math.floor(linesPoint[i][j] / 5);
					var col = linesPoint[i][j] % 5;

					if (sameCard == -1){
						//得到第一个
						if (reArray[row][col] == -1) break;
						sameCard = reArray[row][col];
						continue;
					}

					if (reArray[row][col] == sameCard || (sameCard != 6 && reArray[row][col] == 5)){
						//console.log("reArray["+row+"]["+col+"]:" + reArray[row][col] + " sameCard:" + sameCard)
						++sameCardCount;
						
					}else{
						//不能再找到相同的
						if (sameCard == 5 && reArray[row][col] != -1 && reArray[row][col] != 6){
							sameCard = reArray[row][col];
							++sameCardCount;
						}else{
							break;
						}
					}
				}
				//得出结果
				if (sameCardCount > 2){
					if (debug && _debug)
						console.log("right===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
					scoreCount += bet[sameCard][sameCardCount - 3]

					if (sameCard == 6){
						freeCount += freeCountArr[sameCardCount - 3];
						//console.log(freeCount)
						//freeBet = freeBetArr[sameCardCount - 3];
					}
				}
			}
		}

		return {scoreCount:scoreCount,freeCount:freeCount,bigScore:0};
	}

	this.init();

}

module.exports = arithmetic;