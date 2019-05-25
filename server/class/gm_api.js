var gameInfo = require('./game').getInstand;
var ServerInfo = require('./../config/ServerInfo').getInstand;

var gm_api = function(info,callback){
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
			callback(userlist); 
			break;
		case "GetGameTotalData":
			//获得输赢情况
			callback(gameInfo.getGameTotalData()); 
			break;
		case "maintainServer":
			gameInfo.Setmaintain(true);
			console.log("服务器开始维护模式!")
			callback({rusult:1});
			break;
		case "colseServer":
			//先进入维护模式
			gameInfo.Setmaintain(true);
			var gameScoketList = ServerInfo.getScoketList();
			for (var item in gameScoketList){
				console.log("here");
				gameScoketList[item].emit("Setmaintain");
				//gameScoketList[item]
			}
			//通知所有服务器30秒后，自动关闭服务
			//ServerInfo.GameServerScoket_fish.emit('colseServer',{time:10})
			//使所有用户断线
			// var list = gameInfo.getOnlinePlayer();
			// for(var obj in gameInfo.getOnlinePlayer())
			// {
			// 	list[obj]._socket.disconnect();
			// }
			//保存所有数据
			  //保存用户数据
			  //gameInfo.saveAll();
			  //保存时间段的收益情况
			  //gameInfo.saveTimeScoreTotal();
			  //保存采池
			  //gameInfo.saveSocrePool();
			  //保存总收益情况
			  //gameInfo.saveTotal();
			console.log("服务器已经关闭!")
			callback({rusult:1});
			break;
		case "sendCoinServer":
			//console.log(gameInfo.sendCoinServer(info));
			gameInfo.sendCoinServer(info,function(res){
				callback(res)
			});
			//return {rusult:1};

	}

}

module.exports = gm_api;

