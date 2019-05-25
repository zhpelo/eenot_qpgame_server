gameConfig = {};
gameConfig.gameId = 4;			//第几个游戏ID
gameConfig.serverId = 13402;		//当前游戏的第几台服务器
gameConfig.logflag = 13402;		//游戏记录表示
gameConfig.port = 13402;		//游戏记录表示
gameConfig.gameName = "抢庄牛牛";


//筹码
gameConfig.tax = 0.95;
gameConfig.autoOut = 25000;
gameConfig.bet = 500;
gameConfig.callbet = [1,1,2,3,4];
gameConfig.rebet = [5,10,20,30];


gameConfig.readyPlayTime = 5;
gameConfig.callTime = 5;
gameConfig.reCallTime = 8;
gameConfig.selectBetTime = 10;




gameConfig.gameState = {gameBegin:0,sendCardTime:1,selectBet:2,coucow:3,open:4,sendCoin:5,openEnd:6,noting:7};

gameConfig.seatMax = 5;
gameConfig.tableMax = 100;
gameConfig.maintain = false;
gameConfig.maintainTime = 120;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";


module.exports = gameConfig;