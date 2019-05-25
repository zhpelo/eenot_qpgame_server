var total = 0;
function count(){

	var m_j = 6;
	var m_i = 14;
	
	var prT = 0;
	var exit = false;
	var ay = [[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]];
	//console.log(1)
	function f(i,j){

		if (exit) return;
		var row = Math.floor(i / 5);
		var col = i % 5;
		ay[row][col] = j;

		if (i > 0){
			f(i - 1,m_j);
		}else if (i == 0){
			//console.log(ay);
			//console.log("score:" + check(ay))
			++total;

			//if (total > 100) {exit = true;}
			
		}
		if (j > 0){
			f(i,j - 1);
		}
	}

	f(m_i,m_j);

}

count();


console.log(total)


//f(m_i,m_j);