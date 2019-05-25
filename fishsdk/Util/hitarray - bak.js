var bet = [[2,5,20],[3,10,40],[5,15,60],[7,20,100],[10,30,160],[15,40,200],[20,80,400],[50,200,1000],[0,0,2000]];
var linesPoint = [[5,6,7,8,9],[0,1,2,3,4],[10,11,12,13,14],[0,6,12,8,4],[10,6,2,8,14],[0,1,7,3,4],[10,11,7,13,14],[5,11,12,13,9],[5,1,2,3,9]]

	
check = function(reArray){
		//console.log("###check")
		//检查分数总和
		var scoreCount = 0;
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

				if (reArray[row][col] == sameCard || reArray[row][col] == 8){
					//console.log("reArray["+row+"]["+col+"]:" + reArray[row][col] + " sameCard:" + sameCard)
					++sameCardCount;
					
				}else{
					//不能再找到相同的
					if (sameCard == 8 && reArray[row][col] != -1){
						sameCard = reArray[row][col];
						++sameCardCount;
					}else{
						break;
					}
				}
				
			}
			//得出结果
			if(sameCardCount > 2){
				//console.log("left===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
				scoreCount += bet[sameCard][sameCardCount - 3]

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

					if (reArray[row][col] == sameCard || reArray[row][col] == 8){
						//console.log("reArray["+row+"]["+col+"]:" + reArray[row][col] + " sameCard:" + sameCard)
						++sameCardCount;
						
					}else{
						//不能再找到相同的
						if (sameCard == 8 && reArray[row][col] != -1){
							sameCard = reArray[row][col];
							++sameCardCount;
						}else{
							break;
						}
					}
				}
				//得出结果
				if (sameCardCount > 2){
					//console.log("right===line:" + (i+1) + " sameCard:" + sameCard + " sameCardCount:" + sameCardCount + " score:" + bet[sameCard][sameCardCount - 3]);
					scoreCount += bet[sameCard][sameCardCount - 3]
				}
			}
		}

		return scoreCount;
}
// }
// 
//

//var ay = [[8,8,8,8,8],[8,8,8,1,0],[8,8,8,8,8]];
//console.log(check(ay))



var scoreA = [];
var times = 1000000;
//0-9出现概率调整



for(var k = 0; k < 20000 ; k++){
	scoreA[k] = 0;
}

var betAcd = [10000,9000,8000,7000,6000,5000,4000,3000,2000];
var betRand = [];
var betTotal = 0;
for(var k = 0; k < betAcd.length ; k++){
	for (var j = 0 ; j < betAcd[k] ; j++){
		betRand[j + betTotal] = k;
	}
	betTotal += betAcd[k];
}

for(var k = 0 ;k < times; k++){
	var samebet = [0,0,0,0,0,0,0,0];
	var ResultArray = new Array();
	for(var i=0;i<3;i++){
		ResultArray[i] = new Array();
		for(var j=0;j<5;j++){
			ResultArray[i][j] = betRand[Math.floor(Math.random()*betTotal)]
		}
	}
	//console.log(k);
	if (Math.random()* 1000 > 840)
		++scoreA[check(ResultArray)];
	//console.log(samebet);

}


var Totolscore = 0;
for(var k = 0; k < 20000 ; k++){
	if (scoreA[k]){
		Totolscore += scoreA[k] * k;
		//console.log("k:" + k  + " | score:" + scoreA[k]);
	}
}

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




