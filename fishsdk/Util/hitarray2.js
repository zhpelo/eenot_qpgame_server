//			0J        1Q         2K           3A          4COIN       5元宝	    6财神
var bet = [[2,5,20],[5,15,60],[10,30,160],[20,80,400],[50,200,1000],[100,400,2000],[0,0,0]];
var linesPoint = [[5,6,7,8,9],[0,1,2,3,4],[10,11,12,13,14],[0,6,12,8,4],[10,6,2,8,14],[0,1,7,3,4],[10,11,7,13,14],[5,11,12,13,9],[5,1,2,3,9]]
var freeCountArr = [5,8,15];
var freeBetArr = [8,3,2];
var freeCount = 0;

var debug = false;
var debugTotal = true;
check = function(reArray){
		//console.log("###check")
		//检查分数总和
		var scoreCount = 0;

		//先取第一个
		var first = reArray[0][0];

		if (first == 5){
			//判断是否是全屏元宝
			var max_yuanbao = true;
			for(var i = 0 ;i < reArray.length && max_yuanbao; i++){
				for (var j = 0;j < reArray[0].length;j++){
					if (reArray[i][j] != 5) {
						max_yuanbao = false;
						break;
					}
				}
			}

			if (max_yuanbao) {
				console.log("全财神");
				return 5000;
			}
		}else if(first == 6){
			//判断全屏财神
			var tim = 0;
			var max_caisheng = true;
			for(var i = 0 ;i < reArray.length && max_caisheng; i++){
				for (var j = 0;j < reArray[0].length ; j ++){
					++tim;
					if (reArray[i][j] != 6) {
						max_caisheng = false;
						break;
					}
				}
			}
			if (tim > 12)
				console.log(tim);
			if (max_caisheng){
				console.log("全元宝");
				return 10000;
			} 
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
				if (debug)
					console.log("left===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
				scoreCount += bet[sameCard][sameCardCount - 3]
				//如果是财神,统计
				//3次8倍 10次3倍 15次10倍
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
					if (debug)
						console.log("right===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
					scoreCount += bet[sameCard][sameCardCount - 3]

					if (sameCard == 6){
						freeCount += freeCountArr[sameCardCount - 3];
						//freeBet = freeBetArr[sameCardCount - 3];
					}
				}
			}
		}
		//console.log("免费次数:" + freeCount)
		return scoreCount;
}
// }
// 
//
 
// var ay = [[6,6,6,6,0],
//           [1,1,5,0,0],
//           [1,4,4,0,1]];
//           
//var ay = [[6,6,6,6,6],[6,6,6,6,6],[6,6,6,6,6]]
//console.log(check(ay))



var scoreA = [];

var times = 100000;
if (debug)
	times = 10;
//0-9出现概率调整



for(var k = 0; k < 20000 ; k++){
	scoreA[k] = 0;
}

var betAcd = [5000,5000,5000,5000,5000,5000,5000];
var betRand = [];
var betTotal = 0;
var caishenCount = 0;
for(var k = 0; k < betAcd.length ; k++){
	for (var j = 0 ; j < betAcd[k] ; j++){
		betRand[j + betTotal] = k;
	}
	betTotal += betAcd[k];
}

var max_times = 0;
for(var k = 0 ;k < times + freeCount; k++){

	++max_times;

	var ResultArray = new Array();


	for(var i=0;i<3;i++){
		ResultArray[i] = new Array();
		for(var j=0;j<5;j++){
			//var temp = Math.floor(Math.random()*bet.length);
			var temp = 4 + Math.floor(Math.random() * 3);
			ResultArray[i][j] = temp;
		}
	}

	++scoreA[check(ResultArray)];

	if (debug)
	{
		for(var i = 0 ;i < 3 ;i++)
		{
			console.log(ResultArray[i])
		}
		
		console.log("-------")
	}
		//如果check得到免费开始再次计算

}


var Totolscore = 0;
for(var k = 0; k < 20000 ; k++){
	if (scoreA[k]){
		Totolscore += scoreA[k] * k;
		//if (debugTotal)
		//console.log("k:" + k  + " | score:" + scoreA[k]);
	}
}

console.log("一共次数:" + max_times); 
console.log("免费次数:" + freeCount);
console.log("支出:" + Totolscore);
console.log("收入:" + times);
console.log("收支平衡:" + (times - Totolscore));
console.log("税收:" + Math.floor((times - Totolscore) / times * 100) / 100 + "%");

//console.log(scoreA);



// var total = 0;
// function count(){

// 	var m_j = 7;
// 	var m_i = 14;
	
// 	var prT = 0;
// 	var exit = false;
// 	var ay = [[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]];
// 	//console.log(1)
// 	function f(i,j){

// 		if (exit) return;
// 		var row = Math.floor(i / 5);
// 		var col = i % 5;
// 		ay[row][col] = j;

// 		if (i > 0){
// 			f(i - 1,m_j);
// 		}else if (i == 0){
// 			console.log(ay);
// 			console.log("score:" + check(ay))
// 			++total;

// 			if (total > 100) {exit = true;}
			
// 		}
// 		if (j > 0){
// 			f(i,j - 1);
// 		}
// 	}

// 	f(m_i,m_j);

// }

//count();





//f(m_i,m_j);




