var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var schedule = require("node-schedule");
var signCode = "slel3@lsl334xx,deka";
var Cio = require('socket.io-client')
var log = require("./../../CClass/class/loginfo").getInstand;


var gameConfig = require('./config/gameConfig');
var fishConfig = require('./config/fishConfig');
var gameInfo = require('./../class/game').getInstand;
gameInfo.init(gameConfig,fishConfig);


var Csocket = Cio('http://localhost:13000');


Csocket.on('disconnect', function(data){
  log.info("登录服务器被断开")
});

Csocket.on('connected',function(msg){
    log.info("与登录服务器进行连接......");
    var info = {serverName:"捕鱼游戏",serverId:gameConfig.serverId,signCode:"slel3@lsl334xx,deka"}
    Csocket.emit('GameServerConnect',info)
})

Csocket.on('GameServerConnectResult',function(msg){
  if (msg.resultCode){
    log.info("连接成功");
  }
})


Csocket.on('LoginGameResult',function(msg){
  if (!msg){
    return;
  }
  //log.info("test5.登录服务器回应" + msg)
  if (msg.ResultCode){
    gameInfo.updateUser(msg.userInfo);
  }else{
    gameInfo.deleteUserById(msg.userid,msg.msg);
    log.info("玩家登录不成功!删除");
  }
  
})

Csocket.on('addgold',function(msg){
  if (!msg){
    return;
  }
  log.info(msg);
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

  log.info(msg);
  var score = gameInfo.getPlayerScore(msg.userid);
  Csocket.emit('getgoldResult',{Result:1,score:score});
  
})

Csocket.on('disconnectUser',function(msg){
  //log.info("disconnectUser" + msg.userId);
  var list = gameInfo.getOnlinePlayer();
  if (list[msg.userId]){
    list[msg.userId]._socket.disconnect();
  }else{
    log.info("用户不存在");
    var result = {ResultCode:0,userId:msg.userId};
    Csocket.emit("userDisconnect",result);
  }
})

Csocket.on('Setmaintain',function(msg){
  log.info("关闭服务");
  gameInfo.Setmaintain();

})

Csocket.on('applyMatchResult',function(_info){
    //log.info(_info);
    gameInfo.addRankUserList(_info);
    //gameInfo.fishShoot(socket,fishShootInfo);
  })

gameInfo.setIo(io,Csocket);

io.on('connection', function(socket){

  //log.info(socket + 'connected');
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
      log.info("登录游戏,参数不正确!");
    }

    if (GameInfo.sign){
      if (!gameInfo.getUser(GameInfo.userid)){
        gameInfo.addUser(GameInfo,socket);
                var msg = {userid:GameInfo.userid,sign:GameInfo.sign,gameId:gameInfo.serverId,serverSign:signCode,serverId:gameConfig.serverId};
        Csocket.emit('LoginGame',msg);
        //log.info("test4.发送新用户登录完成,让登录服务器删除用户")
      }else{
        log.info("用户已经在服务器了，无需重复登录");
      }
    }
  })

  //报名
  socket.on('applyMatch',function(Info){
    try{
      var data = JSON.parse(Info);
      Info = data;
    }
    catch(e){
      log.warn('applyMatch-json');
    }
    gameInfo.ApplyMatch(socket.userId,Info.roomid,socket);
  })

  //然后再登录房间
  socket.on('LoginRoom',function(RoomInfo){
    //roomtype
    //如果没有房间概念，就默认为1
    //这还应该检测是否进入了游戏，如果没有需要先进入
    //log.info("进入房间")
    try{
      var data = JSON.parse(RoomInfo);
      RoomInfo = data;
    }
    catch(e){
      log.warn('LoginRoom-json');
    }
    gameInfo.LoginRoom(socket.userId,RoomInfo.roomid,socket);
  })


  //离开房间
  socket.on('LogoutRoom',function(){
    gameInfo.LogoutRoom(socket);
  })

  //捕中鱼
  socket.on('fishHit',function(hitInfo){
    //log.info("中鱼" + hitInfo)
    try{
      var data = JSON.parse(hitInfo);
      hitInfo = data;
    }
    catch(e){
      //log.warn('fishHit-json');
    }
    var hitSocre = gameInfo.fishHit(socket.userId,hitInfo.fishId,hitInfo.bulletId,hitInfo.sendId);
  })

  //发射子弹
  socket.on('fishShoot',function(fishShootInfo){
    //log.info(fishShootInfo)
    //用户,发射角度,子弹类型,子弹ID
    try{
      var data = JSON.parse(fishShootInfo);
      fishShootInfo = data;
    }
    catch(e){
      //log.warn('fishShoot-json');
    }
    gameInfo.fishShoot(socket,fishShootInfo);
  })

  //发射子弹
  socket.on('boomFishHit',function(hitInfo){
    //log.info(fishShootInfo)
    //用户,发射角度,子弹类型,子弹ID
    try{
      var data = JSON.parse(hitInfo);
      hitInfo = data;
    }
    catch(e){
      //log.warn('fishShoot-json');
    }
    gameInfo.boomFishHit(socket.userId,hitInfo.fishId,hitInfo.fishIdList,hitInfo.sendId);
  })
  

  //获取排行榜
  socket.on('getMatchRoom',function(){
    gameInfo.getMatchRoom(socket);
  })

  //获取获得在场鱼
  socket.on('getFishList',function(){
    gameInfo.getFishList(socket);
  })

    //获取获得在场鱼
  socket.on('getMoguiCount',function(){
    gameInfo.getMoguiCount(socket);
  })

    //获得下注时间
  socket.on('getDownTime',function(){
    gameInfo.getDownTime(socket);
  })


  //离线操作
  socket.on('disconnect',function(){
    //log.info("test8.用户断线")
    if (!socket.userId){
      return;
    }
    //通知登录服务器，已经下线存储游戏数据
    //log.info(socket.userId)
    var userInfo = gameInfo.getUser(socket.userId);
    if (userInfo){
      if (userInfo.Islogin()){
        if (gameConfig.isMatchRoom){
          //是比赛房间
          //储蓄自己的数据
          log.info("储存数据")
          gameInfo.updateMatchRandKing(socket.userId,function(ResultCode){
            if (userInfo._Apply){
              var result = {ResultCode:1,userId:userInfo._userId,userScore:userInfo._bankScore,gameId:gameConfig.serverId};
              Csocket.emit("userDisconnect",result);
            }else{
              var result = {ResultCode:1,userId:userInfo._userId,userScore:userInfo._score,gameId:gameConfig.serverId};
              Csocket.emit("userDisconnect",result);              
            }

            //断线存储相应数据(在新的数据库里存储,消耗子弹与收获金币)
            gameInfo.deleteUser(socket);
            socket.userId = null;

          })
          //score
          //最后score变化时间
          //

        }else{
          var result = {ResultCode:1,userId:userInfo._userId,userScore:userInfo._score,gameId:gameConfig.serverId};
          Csocket.emit("userDisconnect",result);
          
          //断线存储相应数据(在新的数据库里存储,消耗子弹与收获金币)
          gameInfo.deleteUser(socket);
          socket.userId = null;
        }

      }else{
        userInfo._isLeave = true;
        log.info("用户未登录离开!")
      }
      // else{
      //   var result = {ResultCode:0,userId:userInfo._userId};
      //   Csocket.emit("userDisconnect",result);
      // }
    }

  })

});


app.set('port', process.env.PORT || gameConfig.port);

var server = http.listen(app.get('port'), function() {
  log.info('start at port:' + server.address().port);
});

log.info("捕鱼游戏服务器启动");


var rule = new schedule.RecurrenceRule();
//每到55秒
//rule.seconds = 55;
//正常模式
//rule.minute = 55;

var j = schedule.scheduleJob(rule, function(){
  //client.write('111111');
  //log.info("11111");
});



