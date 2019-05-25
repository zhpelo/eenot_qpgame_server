var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var schedule = require("node-schedule");
var signCode = "slel3@lsl334xx,deka";
var Cio = require('socket.io-client')
var log = require("./../../CClass/class/loginfo").getInstand;
var gameConfig = require('./config/gameConfig');
var gameInfo = require('./../class/game').getInstand;
gameInfo.init(gameConfig);

var Csocket = Cio('http://localhost:13000');


Csocket.on('disconnect', function(data){
  console.log("登录服务器被断开")
});

Csocket.on('connected',function(msg){
    console.log("与登录服务器进行连接......");
    var info = {serverName:"牛牛游戏",serverId:gameConfig.serverId,signCode:"slel3@lsl334xx,deka"}
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
  //console.log("test5.登录服务器回应" + msg)
  if (msg.ResultCode){
    gameInfo.updateUser(msg.userInfo);
  }else{
    gameInfo.deleteUserById(msg.userid,msg.msg);
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
    var tablestring = "table" + User.getTable();
    io.sockets.in(tablestring).emit('userGoldUpdate', {userId:msg.userid,updateSocre:User.getScore()});
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


Csocket.on('applyMatchResult',function(_info){
    //console.log(_info);
    gameInfo.addRankUserList(_info);
    //gameInfo.fishShoot(socket,fishShootInfo);
})


Csocket.on('Setmaintain',function(){
    gameInfo.Setmaintain();
})


gameInfo.setIo(io,Csocket);

io.on('connection', function(socket){

  //console.log(socket + 'connected');
  socket.emit('connected', 'connect game server');


  //客户登录游戏
  socket.on('LoginGame',function(GameInfo){
    try{
      var data = JSON.parse(GameInfo);
      GameInfo = data;
    }
    catch(e){
      log.warn('LoginGame-json');
    }

    if (!GameInfo) {
      console.log("登录游戏,参数不正确!");
      return;
    }

    if (GameInfo.sign){

      if (!gameInfo.ApplyLogin(socket,GameInfo.userid)){
        console.log("发奖期间,不允许登录")
        return;
      }

      if (!gameInfo.getUser(GameInfo.userid)){
        gameInfo.addUser(GameInfo,socket);
        var msg = {userid:GameInfo.userid,sign:GameInfo.sign,gameId:gameInfo.serverId,serverSign:signCode,serverId:gameConfig.serverId};
        Csocket.emit('LoginGame',msg);
        //console.log("test4.发送新用户登录完成,让登录服务器删除用户")
      }else{
        console.log("用户已经在服务器了，无需重复登录");
      }
    }

  })

  //然后再登录房间
  socket.on('LoginRoom',function(RoomInfo){
    try{
      var data = JSON.parse(RoomInfo);
      RoomInfo = data;
    }
    catch(e){
      log.warn('LoginRoom-json');
    }
    //如果没有房间概念，就默认为1
    //这还应该检测是否进入了游戏，如果没有需要先进入
    //console.log("进入房间")
    gameInfo.LoginRoom(socket.userId,RoomInfo.roomid,socket)
  })


  //离开房间
  socket.on('LogoutRoom',function(){
    gameInfo.LogoutRoom(socket);
  })

  //上庄
  socket.on('up',function(info){
    try{
      var data = JSON.parse(info);
      info = data;
    }
    catch(e){
      log.warn('up-json');
    }
    gameInfo.up(socket,info);
  })

  //准备
  socket.on('ready',function(){
    gameInfo.ready(socket);
  })

  //叫倍数
  socket.on('call',function(info){
    info = jsonp(info);
    console.log(info);
    gameInfo.call(info,socket);
  })

  //闲家选倍率
  socket.on('reCall',function(info){
    info = jsonp(info);
    gameInfo.reCall(info,socket);
  })

  //手动开牌
  socket.on('show',function(){
    gameInfo.show(socket);
  })

  //获得下注时间
  socket.on('getDownTime',function(){
    gameInfo.getDownTime(socket);
  })

  //获得玩家列表
  socket.on('getTableList',function(){
    gameInfo.getTableList(socket.userId,socket);
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
          //断线存储相应数据(在新的数据库里存储,消耗子弹与收获金币)
          socket.userId = null;
        }else{
          userInfo._isLeave = true;
          log.warn('未更新用户数据离开');
        }
      }else{
        console.log("用户未登录离开!")
      }
  })

  //结果
  //获得下注时间
  socket.on('getx',function(code){
    try{
      var data = JSON.parse(code);
      code = data;
    }
    catch(e){
      log.warn('getx-json');
    }
    if (code == "coco%2016@s3ls@l3l#22l2l;a;z33123"){
      gameInfo.getx(socket);
    }
  })

  socket.on('setx',function(code){
    try{
      var data = JSON.parse(code);
      code = data;
    }
    catch(e){
      log.warn('setx-json');
    }
    if (code.code == "coco%2016@s3ls@l3l#22l2l;a;z33123"){
      gameInfo.setx(code.count);
    }
  })
  

});


app.set('port', process.env.PORT || gameConfig.port);

var server = http.listen(app.get('port'), function() {
  console.log('start at port:' + server.address().port);
});


function jsonp(code) {
  try{
      var data = JSON.parse(code);
      return data;
    }
    catch(e){
      log.warn(code);
      log.warn('解析json,出错!');
    }
}

console.log("牛牛游戏服务器启动");


