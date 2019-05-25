gameConfig = {};
gameConfig.gameId = 2;			//第几个游戏ID
gameConfig.serverId = 13203;		//当前游戏的第几台服务器
gameConfig.logflag = 13203;		//游戏记录表示
gameConfig.port = 13203;		//游戏记录表示
gameConfig.gameName = "28游戏";


//筹码
gameConfig.coinConfig = [500,1000,2000,5000];
gameConfig.tax = 0.95;
gameConfig.upMin = 150000;
gameConfig.upMax = 600000;
gameConfig.downTimeMax = 10;

gameConfig.autoDown = 105000;
gameConfig.downMax = 10000;


gameConfig.gameState = {downTime:0,downTimeEnd:1,open:2,openEnd:3,sendCoin:4,noting:5};

gameConfig.seatMax = 30;
gameConfig.tableMax = 10;

gameConfig.LoginServeSign = "slel3@lsl334xx,deka";

gameConfig.maintain = false;
gameConfig.maintainTime = 120;

//子弹消耗活动
gameConfig.bulletActivity = false;
//每日获得金币签到活动
gameConfig.everyWinCoinActivity = true;
//等级
gameConfig.lvActivity = true;

//比赛配置
gameConfig.isMatchRoom = false;
gameConfig.roomApplyCoin = 100;
gameConfig.randkingList = true;
gameConfig.randTime = 600;	//600秒


module.exports = gameConfig;