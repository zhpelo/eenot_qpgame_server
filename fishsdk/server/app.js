var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var api = require('./class/socre_api');
var recharge_api = require('./class/recharge_api');
var schedule = require("node-schedule");
var bodyParser = require('body-parser');
var weixin = require('./class/weixin');
var Robotname = require('./config/RobotName');
var path = require('path');
var crypto = require('crypto');
var gm_api = require('./class/gm_api');
var dao = require('./dao/dao');
var gameConfig = require('./config/gameConfig');
var log = require("./class/loginfo").getInstand;


app.use(bodyParser());
app.get('/Activity/gameuse', function(req, res){
  //res.sendfile('index.html');
  //外部接口
  
  api(req,function(sendStr){
    res.send(sendStr)
  });

  //log.info(req.query.a);
  //res.send('{"status":0,"msg":"","data":{"accountname":"xiexie","gold":"147587148"}}');
});

//充值相关接口
app.get('/recharge', function(req, res){
  recharge_api(req,function(sendStr){
    res.send(sendStr)
  });
});


app.post('/gmManage', function(req, res){

  gm_api(req.body,function(result){
    res.send(result);
  });
  
  
});


app.get('/weixinLogin', function(req, res){
  //res.sendfile('index.html');
  //外部接口
  weixin(req,function(sendStr){
    res.send(sendStr)
  });

  //log.info(req.query.a);
  //res.send('{"status":0,"msg":"","data":{"accountname":"xiexie","gold":"147587148"}}');
});


var serverSign = "slel3@lsl334xx,deka";

var gameInfo = require('./class/game').getInstand;
var ServerInfo = require('./config/ServerInfo').getInstand;


io.on('connection', function(socket){
  //log.info(socket);
  //log.info("test1" + "用户连接");
  socket.emit('connected', 'connect server');

  //服务器进行连接
  socket.on('GameServerConnect',function(info){
    //log.info(info)
    if(info.signCode == serverSign){
      log.info(info.serverName + " | 服务器连接成功!");
      log.info("游戏Id:" + info.serverId);
      socket.emit('GameServerConnectResult', {resultCode:1});
      if (info.serverId)
        ServerInfo.setScoket(info.serverId,socket);
      //log.info(ServerInfo)
    }
    else{
      log.info("尝试连接服务器失败,密码不对");
    }
  })

  socket.on('login',function(user){
    //登录时,必须收到游戏号与房间号

    if (!user){
      log.info("user" + user);
      return;
    }
    //是不是维护模式
    if(gameInfo.isMaintain()){
      log.info("维护模式,禁止登录!")
      socket.emit("maintain",{ResultCode:1,msg:gameConfig.maintain})
      return;
    }

    //log.info(user)
    //判断是不是同一socket登录2次**********未完成还要判断每个游戏里，是否在线？以后再去改
    if (gameInfo.isLoginAgain(socket)){
      log.info("同一帐号连续登录!,必须退出一个游戏才能进入另一个游戏!");
      return;
    }

    if (user.password){
        var key_login = "89b5b9871@@@24d2ec3@*&^sexx$%^slxxx";
        var content = user.password + key_login;
        var md5_sign = crypto.createHash('md5');
        md5_sign.update(content);
        
        user.password = md5_sign.digest('hex');
    }

    dao.login(user,socket,function(rows){
      if (rows){
        //数据库有此用户
        if (gameInfo.IsPlayerOnline(rows.Id)){
          //在线
          log.info("用户在线,进入等待离线列队")
          user.id = rows.Id;
          user.socket = socket;
          user.userName = rows.Account;
          //加入登录列队
          gameInfo.addLoginList(user);
        }else{
          gameInfo.addUser(rows,socket,function(result){
            socket.emit('ServerListResult',{GameInfo:ServerInfo.getServerAll()});
            //发送未领奖列表
            gameInfo.getSendPrize(rows.Id,function(result){
              //log.info(result)
              socket.emit('prizeListResult',{prizeList:result});
            })

            //发送每日活动信息
            gameInfo.getdaySendPrize(rows.Id,function(result){
              socket.emit('dayListResult',{nowday:result.nowday,getcoin:result.getcoin,unclaimedList:result.list});
            })

            //是否有首次兑换
            gameInfo.getfirstexchange(rows.Id,function(result){
              //log.info(result)
              socket.emit('firstExchagerResult',{firstExchager:result.firstexchange});
            })

            //发送等级信息
            gameInfo.getLv(rows.Id,function(result){
              //log.info(result)
              socket.emit('lv',result);
            })

            //发送是否在房间信息
            var linemsg = gameInfo.getLineOutMsg(rows.Id);
            //log.info(linemsg)
            if (linemsg.Result){
              socket.emit('lineOutMsg',{gameId:linemsg.gameId,serverId:linemsg.serverId,tableId:linemsg.tableId,seatId:linemsg.seatId});
            }

            if (gameConfig.recharge_first){
              //首充信息
              gameInfo.firstrecharge(rows.Id,function(result){
                result.addPropId = 0;
                result.addPropCount = 0;
                socket.emit('firstrecharge',result);
              })
            }
            
          });

        }      
        
      }else{
        var result = {};
        result = {resultid:0,msg:'Account or password error,login fail!'};
        socket.emit('loginResult',result);
        log.info(user);
        log.info("登录失败");
      }
    })
  	//log.info('userId' + dao.login(user,socket) + 'login!') 
  })

  //登录完成之后先进入游戏房间,来自于游戏服务器
  socket.on('LoginGame',function(_userinof){
    //log.info("test6" + "登录游戏");
    if (_userinof.serverSign == serverSign){
        //让这个用户进入该游戏
        var userInfo = gameInfo.LoginGame(_userinof.userid,_userinof.sign,_userinof.gameId);
        var result = {};
        if (userInfo._userId){
          var result = {ResultCode:1,userInfo:userInfo};
        }else{
          var result = {ResultCode:0,userid:_userinof.userid,msg:userInfo.msg};
        }
        //log.info("用户进入房间")
        socket.emit('LoginGameResult',result);
        //log.info("test7" + "发送登录的游戏");
    }

  })

  //离线操作
  socket.on('disconnect',function(){
    //log.info("有人离线");
    //有人离线
    if (socket.serverGameid){
      log.info(socket.serverGameid)
      log.info("游戏服务器 -" + ServerInfo.getServerNameById(socket.serverGameid) + "- 已经断开连接");
    }
    //log.info("************")
    //如果用户还存在的话，删除
    var userInfo = {userId:socket.userId,nolog:true}
    gameInfo.deleteUser(userInfo);
    //gameInfo.deleteUserNoLoginGame(socket.userId);
  })

  //有用户离开
  socket.on('userDisconnect',function(_userInfo){
    //log.info(_userInfo)
    if (_userInfo.ResultCode){
      
      gameInfo.setCleanGameIdByUserId(_userInfo);
      gameInfo.deleteUser(_userInfo);
    }
    else{
      
      gameInfo.deleteUserNoLoginGame(_userInfo.userId,1);
    }
  })

  //游戏结算
  socket.on('GameBalance',function(_Info){
    if(_Info.signCode == serverSign){
      gameInfo.GameBalance(_Info);
    }
  })

  //牌局断线
  socket.on('lineOut',function(_Info){
    if(_Info.signCode == serverSign){
      gameInfo.lineOutSet(_Info);
    }
  })

  //获得断线
  socket.on('getLineOut',function(_Info){
    if(_Info.signCode == serverSign){
      gameInfo.getLineOutMsg(_Info);
    }
  })

  //比赛结束
  socket.on('matchEnd',function(_info){
    gameInfo.addPrize(_info);
  })

  //兑换电话卡
  socket.on("exchange",function(_info){
    gameInfo.exchange(socket.userId,_info,io);
  })

  //赠送游戏币给他人
  socket.on("sendCoin",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.sendCoin(socket,_info);
    }
  })

  //检测
  socket.on("checkNickName",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.checkNickName(socket,_info);
    }
  })

  //发验证码
  socket.on("sendbindPhoneNo",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.sendbindPhoneNo(socket,_info);
    }
  })

  //绑定手机
  socket.on("bindPhone",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.bindPhone(socket,_info);
    }
  })

  //获取是否有未领取奖品
  socket.on("getPrize",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.getPrize(socket,_info);
    }
  })

  //获得每天任务奖品
  socket.on("getDayPrize",function(_info){
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.getDayPrize(socket,_info);
    }
  })

  //游戏服务器的排行
  socket.on("setServerRank",function(_info){
    //log.info(_info);
    gameInfo.setServerRank(_info);
  })

  socket.on("getServerRank",function(_info){
    gameInfo.getServerRank(socket,_info);
  })

    //报名
  socket.on('applyMatch',function(Info){
    //var time = makeDate(new Date());
    //log.info(time);
    gameInfo.ApplyMatch(socket.userId,Info.roomid,socket)
  })

  //喇叭说话
  socket.on('sendMsg',function(info){
    gameInfo.sendMsg(socket.userId,info,io);
  })

  //充值
  socket.on('recharge',function(info){
    gameInfo.recharge(socket.userId,socket,info)
  })

});


app.set('port', process.env.PORT || 3000);

var server = http.listen(app.get('port'), function() {
  log.info('start at port:' + server.address().port);
});


var rule = new schedule.RecurrenceRule();
//每到55秒
//rule.seconds = 55;
//正常模式
//rule.minute = 55;
  var times = [];

  for(var i=0; i<60; i++){
  　　times.push(i);
  }
  rule.second = times;
  var timer = (Math.floor(Math.random() * 120)) + 60;
  var timer_yin = (Math.floor(Math.random() * 500)) + 1600;
  var j = schedule.scheduleJob(rule, function(){
  gameInfo.updateLogin();
  gameInfo.pisaveUser();
  gameInfo.score_changeLog();
  gameInfo.sendApi();
  --timer;
  
  if (timer <= 0){
  var idx = (Math.floor(Math.random() * 10000))
  io.sockets.emit('sendMsg',{nickname:Robotname[idx].nickname,msg:"成功兑换20元电话卡!"});
  timer =  (Math.floor(Math.random() * 120)) + 60;
  }

  var nowDate = new Date();
  var hours = nowDate.getHours();
  if (hours > 3 && hours < 10){

  }else{
    --timer_yin;
    if (timer_yin <= 0){
      timer_yin = (Math.floor(Math.random() * 500)) + 1600;
      //io.sockets.emit('sendMsg',{nickname:".",msg:"上分100元=15000金币"});
      //io.sockets.emit('sendMsg',{nickname:".",msg:"收分16000金币=100元"});
      //io.sockets.emit('sendMsg',{nickname:".",msg:"加微信18875495446"});
    }
  }  



  

  //io.sockets.in('table0').emit('broadcast room message');
  //保存用户数据
  //gameInfo.saveAll();
  //保存时间段的收益情况
  //gameInfo.saveTimeScoreTotal();
  //保存采池
  //gameInfo.saveSocrePool();
  //保存总收益情况
  //gameInfo.saveTotal();
  //log.info("自动保存数据!");
});

dao.clenaLineOut();

log.info("登录服务器 v2.0.0");
log.info("服务器启动成功!");
log.info("更新时间:2016.10.17");


