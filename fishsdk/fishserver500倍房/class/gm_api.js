var gameInfo = require('./../class/game').getInstand;

var gm_api = function(info){
	switch(info.act){
		case "GetuserListOnline":
			var userlist = [];
			var i = 0;
			var list = gameInfo.getOnlinePlayer();
			//console.log(list);
			for(var obj in gameInfo.getOnlinePlayer())
			{
				userlist[i] = {};
				userlist[i]._userId = list[obj]._userId;
				userlist[i]._account = list[obj]._account;
				userlist[i]._score = list[obj]._score;
				//console.log(list[obj]._userId);
				++i;
				//console.log(obj.userid);
			}
			//console.log("list:" + list);
			return userlist;
			break;
		case "GetGameTotalData":
			//获得输赢情况
			return gameInfo.getGameTotalData();
			break;
		case "maintainServer":
			gameInfo.Setmaintain(true);
			console.log("服务器开始维护模式!")
			return {rusult:1};
			break;
		case "colseServer":
			//先进入维护模式
			gameInfo.Setmaintain(true);
			//使所有用户断线
			var list = gameInfo.getOnlinePlayer();
			for(var obj in gameInfo.getOnlinePlayer())
			{
				list[obj]._socket.disconnect();
			}
			//保存所有数据
			  //保存用户数据
			  gameInfo.saveAll();
			  //保存时间段的收益情况
			  gameInfo.saveTimeScoreTotal();
			  //保存采池
			  gameInfo.saveSocrePool();
			  //保存总收益情况
			  gameInfo.saveTotal();
			console.log("服务器已经关闭!")
			return {rusult:1};
			break;
	}

}

module.exports = gm_api;

