var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var schedule = require("node-schedule");
var signCode = "slel3@lsl334xx,deka";
var Cio = require('socket.io-client')
var log = require("./../CClass/class/loginfo").getInstand;

var gameConfig = require('./config/gameConfig');
var gameInfo = require('./class/game').getInstand;
gameInfo.init(gameConfig);
var Csocket = Cio('http://120.76.194.95:13000');


Csocket.on('disconnect', function(data){
  console.log("登录服务器被断开")
});

Csocket.on('connected',function(msg){
    console.log("与登录服务器进行连接......");
    var info = {serverName:"斗地主",serverId:gameConfig.serverId,signCode:"slel3@lsl334xx,deka"}
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

  socket.emit('connected', 'connect game server');


  //客户登录游戏
  socket.on('LoginGame',function(GameInfo){
    console.log("客户端登陆游戏")
    console.log(GameInfo)
    
    console.log("---------------")
    try{
      var data = JSON.parse(GameInfo);
      GameInfo = data;
    }
    catch(e){
      log.warn('LoginGame-json');
    }
    if (!GameInfo) {
      console.log("登录游戏,参数不正确!");
    }

    if (GameInfo.sign){
   // console.log("++++++++++++GameInfo.sign++++++++++++")
   //console.log(gameInfo.getUser(GameInfo.userid)) 
//    console.log("++++++++++++++++++++++++++++++++++++")
      if (!gameInfo.getUser(GameInfo.userid)){
     console.log('GameInfo.userid')
        gameInfo.addUser(GameInfo,socket);
        var msg = {userid:GameInfo.userid,sign:GameInfo.sign,gameId:gameInfo.serverId,serverSign:signCode,serverId:gameConfig.serverId};
        Csocket.emit('LoginGame',msg);
        //console.log("test4.发送新用户登录完成,让登录服务器删除用户")
      }
      else{
//    	gameInfo.addUser(GameInfo,socket);
//      var msg = {userid:GameInfo.userid,sign:GameInfo.sign,gameId:gameInfo.serverId,serverSign:signCode,serverId:gameConfig.serverId};
//      Csocket.emit('LoginGame',msg);
        console.log("用户已经在服务器了，无需重复登录");
        
      }
    }
  })
  
  socket.on('applyMatch',function(Info){
    try{
      var data = JSON.parse(Info);
      console.log(data)
      Info = data;
//    console.log(Info)
    }
    catch(e){
      log.warn('applyMatch-json');
    }
    gameInfo.ApplyMatch(socket.userId,Info.roomid,socket);
  })

  //然后再登录房间
  socket.on('LoginRoom',function(RoomInfo){
    console.log("进入房间")
    //roomtype
    //如果没有房间概念，就默认为1
    //这还应该检测是否进入了游戏，如果没有需要先进入
    //console.log("进入房间")
    try{
      var data = JSON.parse(RoomInfo);
      console.log(data)
      RoomInfo = data;
    }
    catch(e){
      log.warn('LoginRoom-json');
    }
    gameInfo.LoginRoom(socket.userId,RoomInfo.roomid,socket);
  })
    
    socket.on('joinTableroom',function(Info){
    try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
     // log.warn('applyMatch-json');
    }
      gameInfo.Brokenline(Info.tableId,Info.seatId,Info.userId);
    })
    
    
  socket.on('loadedFinish',function(Info){
   try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
      //log.warn('applyMatch-json');
    }
    gameInfo.sendtable(Info);
  })
  
  //socket.on('Landlords',function(data){
  //  console.log(data)
  //})
  //轮流
//  socket.on('dizhu',function(dizhu){
//    gameInfo.Gaga(dizhu.tableId,dizhu.seatId);
//
//  })
  //地主
  socket.on('qiang',function(Info){
    try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
     // log.warn('applyMatch-json');
    }
    gameInfo.plusq(Info.tableId,Info.seatId,Info.qiang,Info.playerId);
  })

  socket.on('tuoGuan',function(Info){
  	try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
      log.warn('applyMatch-json');
    }
    
    gameInfo.Trusteeship(Info);
  })

  //发送桌子信息
  socket.on('getUer',function(Info){
   // console.log('=====获取桌子信息=====')
   // console.log(data)
   	try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
      //log.warn('applyMatch-json');
    }
    gameInfo.getsocket(Info);
  })
  
  //出牌
  socket.on('sendCardsArr',function(Info){
  	try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
     // log.warn('applyMatch-json');
    }
    gameInfo.inspectcarcd(Info);
  })
  //结算
  socket.on('finishGame',function(Info){
    try{
      var data = JSON.parse(Info);
      Info = data;
//    console.log(Info)
    }
    catch(e){
     // log.warn('applyMatch-json');
    }
    gameInfo.Settlement(Info.tableId,Info.seatId,Info.userId,Info.finish,Info.isLandload);
  })
  //离开房间
  socket.on('LogoutRoom',function(){
    gameInfo.LogoutRoom(socket);
  })
  
  
  socket.on('disconnect',function(){
    console.log("有人离开")
    if (!socket.userId){
      return;
    }
    //通知登录服务器，已经下线存储游戏数据
    //console.log(socket.userId)
    var userInfo = gameInfo.getUser(socket.userId);
    if (userInfo){
    
      if (userInfo.Islogin()){
        
          console.log("++++++++++离开房间+++++++++++");
          var result = {ResultCode:1,userId:userInfo._userId,userScore:userInfo._score,gameId:gameConfig.serverId};
          Csocket.emit("userDisconnect",result);
          
          gameInfo.deleteUser(socket);
          socket.userId = null;
        }

      }else{
        console.log("用户未登录离开!")
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

console.log("斗地主游戏服务器启动");



