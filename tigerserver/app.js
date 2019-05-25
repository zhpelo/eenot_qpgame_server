var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var schedule = require("node-schedule");
var signCode = "slel3@lsl334xx,deka";
var Cio = require('socket.io-client')


var gameInfo = require('./class/game').getInstand;


var Csocket = Cio('http://localhost:3000');

Csocket.on('disconnect', function(data){
  console.log("登录服务器被断开")
});

Csocket.on('connected',function(msg){
    console.log("与登录服务器进行连接......");
    var info = {serverName:"连线游戏",serverId:gameInfo.serverId,signCode:"slel3@lsl334xx,deka"}
    Csocket.emit('GameServerConnect',info)
})
 
Csocket.on('GameServerConnectResult',function(msg){
  if (msg.resultCode){
    console.log("连接成功");
  }
})


Csocket.on('LoginGameResult',function(msg){
  if (!msg){
    return;
  }
  //console.log("****" + msg)
  //gameInfo.addUser(rows,socket);
  if (msg.ResultCode){
    gameInfo.updateUser(msg.userInfo);
    //console.log(msg)
  }
  else{
    gameInfo.deleteUserById(msg.userid,msg.msg);
    console.log("玩家登录不成功!");
  }
  
})

Csocket.on('addgold',function(msg){
  if (!msg){
    return;
  }
  console.log(msg);
  var result = gameInfo.addgold(msg.userid,msg.addgold);
  Csocket.emit('addgoldResult',{Result:result});

  //当前用户桌子广播
  var User = gameInfo.getUser(msg.userid);
  if (User){
    User._socket.emit('userGoldUpdate', {userId:msg.userid,updateSocre:User.getScore()});
  }
})

Csocket.on('getgold',function(msg){
  if (!msg){
    return;
  }

  console.log(msg);
  var score = gameInfo.getPlayerScore(msg.userid);
  Csocket.emit('getgoldResult',{Result:1,score:score});
  
})
+
Csocket.on('disconnectUser',function(msg){
  //console.log("disconnectUser" + msg.userId);
  var list = gameInfo.getOnlinePlayer();
  if (list[msg.userId]){
    list[msg.userId]._socket.disconnect();
  }else{
    console.log("用户不存在");
    var result = {ResultCode:0,userId:msg.userId};
    Csocket.emit("userDisconnect",result);
  }
})

Csocket.on('colseServer',function(msg){

  //让所有用户离线
  var list = gameInfo.getOnlinePlayer();
  for(var obj in gameInfo.getOnlinePlayer()){
    list[obj]._socket.disconnect();
  }
})

gameInfo.setIo(io);

io.on('connection', function(socket){

  //console.log(socket + 'connected');
  socket.emit('connected', 'connect game server');

  //客户登录游戏
  socket.on('LoginGame',function(GameInfo){
    //console.log(GameInfo)

    if (!GameInfo) {
      console.log("登录游戏,参数不正确!");
    }

    if (GameInfo.sign){
      //console.log("****" + GameInfo)
      gameInfo.addUser(GameInfo,socket);
      
      var msg = {userid:GameInfo.userid,sign:GameInfo.sign,gameId:gameInfo.serverId,serverSign:signCode}
      Csocket.emit('LoginGame',msg);
    }

  })

  //连线机
  socket.on('lottery',function(lottery){
    console.log("lottery")
    var result = gameInfo.lottery(socket.userId,lottery.bet);
    if (result.code < 1) {
      socket.emit('lotteryResult', {ResultCode:result.code});
    }else{
      socket.emit('lotteryResult', {ResultCode:result.code,ResultData:{userscore:result.userscore,winscore:result.winscore,viewarray:result.viewarray,winfreeCount:result.winfreeCount,freeCount:result.freeCount,score_pool:result.score_pool}});
    }
  	//获取当前用户的分数
    //var _userscore = gameInfo.getUserscore(socket.userId);
    //console.log(_userscore);
  })


  //离线操作
  socket.on('disconnect',function(){
    if (!socket.userId){
      return;
    }
    //通知登录服务器，已经下线存储游戏数据
    //console.log(socket.userId)
    var userInfo = gameInfo.getUser(socket.userId);
    if (userInfo){
      if (userInfo.Islogin()){
          gameInfo.deleteUser(socket);
          var result = {ResultCode:1,userId:userInfo._userId,userScore:userInfo._score,gameId:gameConfig.serverId,nolog:true};
          Csocket.emit("userDisconnect",result);
          socket.userId = null;
        }
      }else{
        console.log("用户未登录离开!")
      }
  })

});


app.set('port', process.env.PORT || 3102);

var server = http.listen(app.get('port'), function() {
  console.log('start at port:' + server.address().port);
});

console.log("连线游戏服务器启动");


var rule = new schedule.RecurrenceRule();
//每到55秒
//rule.seconds = 55;
//正常模式
rule.minute = 55;

var j = schedule.scheduleJob(rule, function(){
  //保存用户数据
  //gameInfo.saveAll();
  //保存时间段的收益情况
  //gameInfo.saveTimeScoreTotal();
  //保存采池
  gameInfo.saveSocrePool();
  //保存总收益情况
  //gameInfo.saveTotal();
  // console.log("自动保存数据!");
});
