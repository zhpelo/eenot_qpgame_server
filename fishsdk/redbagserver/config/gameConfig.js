gameConfig = {};
gameConfig.gameId = 4;
gameConfig.serverId = 41;


//筹码
//gameConfig.coinConfig = [100,500,1000,3000,6000,8000,20000,66000,100000];
gameConfig.coinConfigMax = 300000;
gameConfig.coinConfigMin = 100;
gameConfig.tax = 0.97;
gameConfig.sandBagCoinMin = 100;					//最小需要发包金币
gameConfig.sendBagNumMax = 10;						//发送红包个数
gameConfig.downTimeMax = 60;						//自动关闭时间
gameConfig.sendRedBagMax = 20;						//允许存在多少个未抢红包
gameConfig.redbagListMax = 40;						//允许列队的最大数量

gameConfig.autoDown = 10000;

gameConfig.gameState = {downTime:0,downTimeEnd:1,open:2,openEnd:3,sendCoin:4,noting:5};


gameConfig.seatMax = 30;
gameConfig.tableMax = 10;
gameConfig.LoginServeSign = "slel3@lsl334xx,deka";
gameConfig.maintain = false;
gameConfig.maintainTime = 120;



gameConfig.lvActivity = true;

//比赛配置
gameConfig.isMatchRoom = false;
gameConfig.roomApplyCoin = 100;
gameConfig.randkingList = true;
gameConfig.randTime = 600;	//600秒


module.exports = gameConfig;