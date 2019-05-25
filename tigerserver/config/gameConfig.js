gameConfig = {};
gameConfig.gameId = 2;
gameConfig.serverId = 21;
gameConfig.logflag = 10;		//游戏记录表示


//筹码
gameConfig.coinConfig = [10,100,1000,10000];
gameConfig.tax = 0.99;
gameConfig.upMin = 100000;
gameConfig.upMax = 3000000;
gameConfig.downTimeMax = 30;

gameConfig.seatMax = 30;
gameConfig.tableMax = 10;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";

gameConfig.maintain = false;
gameConfig.maintainTime = 120;




module.exports = gameConfig;