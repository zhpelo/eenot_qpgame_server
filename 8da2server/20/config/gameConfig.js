gameConfig = {};
gameConfig.gameId = 3;			//第几个游戏ID
gameConfig.serverId = 13304;		//当前游戏的第几台服务器
gameConfig.logflag = 13304;		//游戏记录表示
gameConfig.port = 13304;		//游戏记录表示
gameConfig.gameName = "8da2";

//筹码
gameConfig.coinConfig = [1000,2000,5000,10000];
gameConfig.tax = 0.95;
gameConfig.upMin = 300000;
gameConfig.upMax = 1500000;
gameConfig.downTimeMax = 10;		//下注时间
gameConfig.changeBankerTimeMax = 3;	//换庄时间
gameConfig.doCountMax = 3;			//连续当庄次数
gameConfig.autoDown = 210000;

//单次下注最大金额
gameConfig.downMax = 100000;


gameConfig.gameState = {shuffle:0,noting:1,sendCardTime:2,downTime:3,downTimeEnd:4,open:5,openEnd:6,changeZhuang:7,noting2:8};

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