gameConfig = {};
gameConfig.gameId = 7;			//第几个游戏ID
gameConfig.serverId = 13702;		//当前游戏的第几台服务器
gameConfig.logflag = 13702;		//游戏记录表示
gameConfig.port = 13702;		//游戏记录表示
gameConfig.gameName = "斗地主";


//筹码
gameConfig.tax = 0.95;
gameConfig.autoOut = 5000;
gameConfig.bet = 100;
gameConfig.callbet = [1,1,2,3,4];
gameConfig.rebet = [5,10,20,30];


gameConfig.readyPlayTime = 5;
gameConfig.callTime = 5;
gameConfig.reCallTime = 8;
gameConfig.selectBetTime = 10;
gameConfig.Theendpoints=100;


gameConfig.carcd=[
		{val:14,type:5},
		{val:15,type:5},
		{val:1,type:1},{val:2,type:1},{val:3,type:1},{val:4,type:1},{val:5,type:1},{val:6,type:1},{val:7,type:1},{val:8,type:1},{val:9,type:1},{val:10,type:1},{val:11,type:1},{val:12,type:1},{val:13,type:1},
		{val:1,type:2},{val:2,type:2},{val:3,type:2},{val:4,type:2},{val:5,type:2},{val:6,type:2},{val:7,type:2},{val:8,type:2},{val:9,type:2},{val:10,type:2},{val:11,type:2},{val:12,type:2},{val:13,type:2},
		{val:1,type:3},{val:2,type:3},{val:3,type:3},{val:4,type:3},{val:5,type:3},{val:6,type:3},{val:7,type:3},{val:8,type:3},{val:9,type:3},{val:10,type:3},{val:11,type:3},{val:12,type:3},{val:13,type:3},
		{val:1,type:4},{val:2,type:4},{val:3,type:4},{val:4,type:4},{val:5,type:4},{val:6,type:4},{val:7,type:4},{val:8,type:4},{val:9,type:4},{val:10,type:4},{val:11,type:4},{val:12,type:4},{val:13,type:4},]

gameConfig.gameState = {gameBegin:0,sendCardTime:1,selectBet:2,coucow:3,open:4,sendCoin:5,openEnd:6,noting:7};

gameConfig.seatMax = 3;
gameConfig.tableMax = 100;
gameConfig.maintain = false;
gameConfig.maintainTime = 120;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";


module.exports = gameConfig;