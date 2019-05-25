gameConfig = {};
gameConfig.serverId = 2;
gameConfig.gameBet = 500;
gameConfig.controlBet = 0.99;
//子弹消耗活动
gameConfig.bulletActivity = false;
//每日获得金币签到活动
gameConfig.everyWinCoinActivity = true;
//等级
gameConfig.lvActivity = true;

//维护
gameConfig.maintainTime = 60;
gameConfig.maintain = false;

//比赛配置
gameConfig.isMatchRoom = false;
gameConfig.roomApplyCoin = 100;
gameConfig.randkingList = true;
gameConfig.randTime = 600;	//600秒


module.exports = gameConfig;