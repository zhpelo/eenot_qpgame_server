var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var api = require('./class/socre_api');
var recharge_api = require('./class/recharge_api');
var webGetUser = require('./class/webGetUser');
var appleRecharge = require('./class/appleRecharger');
var schedule = require("node-schedule");
var bodyParser = require('body-parser');
var weixin = require('./class/weixin');
var Robotname = require('./config/RobotName');
var path = require('path');
var crypto = require('crypto');
var gm_api = require('./class/gm_api');
var ml_api = require('./class/ml_api');
var tw_api = require('./class/tw_api');
var guanfang_api = require('./class/guanfang_api');
var dao = require('./dao/dao');
var gameConfig = require('./config/gameConfig');
var log = require("./class/loginfo").getInstand;
var multer=require('multer');
var multerObj=multer({dest: './static/upload'});
var consolidate=require('consolidate');
var statics=require('express-static');
var fs = require('fs')
var updateConfig = require('./class/updateConfig').getInstand;
var Post = require('./class/post');



app.use(statics('./static/'));

//跨域问题
app.all('*', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
res.header("X-Powered-By",' 3.2.1');
res.header("Content-Type", "application/json;charset=utf-8");
next();
});




//网页模板
app.engine('html', consolidate.ejs);
app.set('views', 'template');
app.set('view engine', 'html');

app.use(bodyParser());
app.get('/Activity/gameuse', function(req, res){
  //res.sendfile('index.html');
  //外部接口
  
  api(req,function(sendStr){
    res.send(sendStr);
  });
  

  //log.info(req.query.a);
  //res.send('{"status":0,"msg":"","data":{"accountname":"xiexie","gold":"147587148"}}');
});

//app.use('/logitech',require('./routes/login/logitech.js')());
//网页接口
//app.use('/index',require('./routes/login/login.js')());
//app.use('/shopping',require('./routes/login/shopp.js')());
//app.use('/PersonalCenter',require('./routes/login/PersonalCenter.js')());


//验证充值
app.post('/apple',function(req,res_s){
    appleRecharge(req,function(sendStr){
      res_s.send(sendStr)
    });
})



app.get('/logitech',function(req,res){
  var Cun = updateConfig.getUpdateCoifig();
	res.send(Cun)
})

//充值相关接口
app.get('/recharge', function(req, res){
  recharge_api(req,function(sendStr){
    res.send(sendStr)
  });
});

//充值支付宝相关接口
app.get('/rechargeZhifuBao', function(req, res){
  //wap
  if (req.query.payType){
    tw_api.rechargeZhifuBao(req,function(result,url,sendStr){
      if (result){
        res.redirect(url);
      }else{
        res.send(sendStr);
      }
    });
  }else{
    guanfang_api.rechargeZhifuBao(req,function(result,url,sendStr){
    if (result){
      res.redirect(url);
    }else{
      res.send(sendStr);
    }
    });
  }
  //皎洁
  // Post.rechargeRfupay(req.query,function(result,url,sendStr){
  //   if (result){
  //     log.info(sendStr)
  //     //res.render('1.ejs',{})
  //     res.type('html');
  //     res.send(sendStr);
  //     //res.redirect(url);
  //   }else{
  //     res.send(sendStr);
  //   }
  // });
});

//充值支付宝相关接口
app.get('/rechargeZhifuBaoReturn', function(req, res){

  tw_api.rechargeZhifuBaoReturn(req.query,function(result){
    if (result){
      res.send("SUCCESS");
    }else{
      res.send("FAIL");
    }
  });
});


app.get('/outCoin', function(req, res){

  tw_api.outCoin(req.query,function(result){
    if (result){
      res.send("SUCCESS");
    }else{
      res.send("FAIL");
    }
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
  weixin(req,function(act,sendStr){
    if (act == 1){
      res.send(sendStr);  
    }else if(act == 2){
      res.redirect(sendStr);
    }
    
  });

  //log.info(req.query.a);
  //res.send('{"status":0,"msg":"","data":{"accountname":"xiexie","gold":"147587148"}}');
});


app.get('/ml_api', function(req, res){
  //res.sendfile('index.html');
  //外部接口
  ml_api.get(req,function(act,sendStr){
    if (act == 1){
      res.send(sendStr);  
    }else if(act == 2){
      res.redirect(sendStr);
    }
    
  });
});

//商城相关
app.post('/webGetUser',function(req,res){
  webGetUser(req,function(sendStr){
    log.info(sendStr)
    res.send(sendStr)
  })
})

//购买商品
// app.post('/webShopBuy',function(req,res){
//   webGetUser
//   gameInfo.shopBuy(req,function(sendStr){

//     try{
//       var data = JSON.parse(sendStr);
//       if (!data.status){

//       }
//     }
//     catch(e){
//       log.warn('webGetUser');
//     }
//     log.info(sendStr)
//     res.send(sendStr)
//   })
// })


var serverSign = "slel3@lsl334xx,deka";

var gameInfo = require('./class/game').getInstand;
var ServerInfo = require('./config/ServerInfo').getInstand;


io.on('connection', function(socket){
  //log.info(socket);
  //log.info("test1" + "用户连接");
  socket.emit('connected', 'connect server');

  //服务器进行连接
  socket.on('GameServerConnect',function(info){
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
    
    try{
      var data = JSON.parse(user);
      user = data;
    }
    catch(e){
      log.warn('loginjson');
    }

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
        var key_login = "89b5b987124d2ec3";
        var content = user.userName + user.password + key_login;
        var md5_sign = crypto.createHash('md5');
        md5_sign.update(content);
        user.password = md5_sign.digest('hex');
        user.sign = user.password;
    }

    dao.login(user,socket,function(state,rows){
      
      if (!state){
        //数据库有此用户
        if (gameInfo.IsPlayerOnline(rows.Id)){
          //在线
          log.info("用户在线,进入等待离线列队");
          user.id = rows.Id;
          user.socket = socket;
          user.userName = rows.Account;
          //加入登录列队
          gameInfo.addLoginList(user);
        }else{
          gameInfo.addUser(rows,socket,function(result){
          });

        }      
      } else if(state == 1){
        var result = {};
        result = {resultid:0,msg:'Account or password error,login fail!'};
        socket.emit('loginResult',result);
        log.info(user)
        log.info("登录失败!");
      } else if(state == 2){
        var result = {};
        result = {resultid:-1,msg:'This account is disabled!'};
        socket.emit('loginResult',result);
        log.info("登录失败,帐号被停用!");
      }
    })
  	//log.info('userId' + dao.login(user,socket) + 'login!') 
  })

  //登录完成之后先进入游戏房间,来自于游戏服务器
  socket.on('LoginGame',function(_userinof){
    //log.info("test6" + "登录游戏");
    if (_userinof.serverSign == serverSign){
        //让这个用户进入该游戏
        //log.info(_userinof)
        var encoin = ServerInfo.getServerEnterCoinByProt(_userinof.serverId);

        var userInfo = gameInfo.LoginGame(_userinof.userid,_userinof.sign,_userinof.serverId,encoin);
        var result = {};
        if (userInfo._userId){
          var result = {ResultCode:1,userInfo:userInfo};
          var info = {state:1,gameId:_userinof.gameId,serverId:_userinof.serverId,userId:_userinof.userid,tableId:-1,seatId:-1};
          gameInfo.lineOutSet(info);
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

    log.info("disconnect:" + socket.userId)
    //log.info("************")
    //如果用户还存在的话，删除
    var userInfo = {userId:socket.userId,nolog:true}
    gameInfo.deleteUser(userInfo);
    //gameInfo.deleteUserNoLoginGame(socket.userId);
  })

  //有用户离开
  socket.on('userDisconnect',function(_userInfo){
    log.info("userDisconnect:");
    log.info(_userInfo);
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
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('exchangejson');
    }
    gameInfo.exchange(socket.userId,_info,io);
  })

  //赠送游戏币给他人
  socket.on("sendCoin",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('sendCoinjson');
    }

    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.sendCoin(socket,_info);
    }
  })

  //检测
  socket.on("checkNickName",function(_info){

    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('checkNickName-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.checkNickName(socket,_info);
    }
  })

  //修改昵称
  socket.on("updateNickName",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('updateNickName-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.updateNickName(socket,_info);
    }
  })

  //修改密码
  socket.on("updatePassword",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('updatePassword-json');
    }
    if(gameInfo.checkDataPassword(socket,_info)){
      gameInfo.updatePassword(socket,_info);
    }
  })

  //转正
  socket.on("changeOfficial",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('changeOfficial-json');
    }
    if(gameInfo.checkData(socket,_info)){
      gameInfo.changeOfficial(socket,_info);
    }
  })

  //银行卡
  socket.on("BankInfo",function(_info){

    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('BankInfo-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.BankInfo(socket,_info);
    }
  })

  //获取自己银行卡
  socket.on("getBank",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getBank-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.getBank(socket,_info);
    }
  })

  //绑定支付宝
  socket.on("bindZhifubao",function(_info){

    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('bindZhifubao-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.bindZhifubao(socket,_info);
    }
  })

  //发验证码
  socket.on("sendbindPhoneNo",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('sendbindPhoneNo-json');
    }

    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.sendbindPhoneNo(socket,_info);
    }
  })

  //绑定手机
  socket.on("bindPhone",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('bindPhone-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.bindPhone(socket,_info);
    }
  })

  //获取是否有未领取奖品
  socket.on("getPrize",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getPrize-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.getPrize(socket,_info);
    }
  })

  //获得每天任务奖品
  socket.on("getDayPrize",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getDayPrize-json');
    }
    if(gameInfo.IsPlayerOnline(socket.userId)){
      gameInfo.getDayPrize(socket,_info);
    }
  })

  //游戏服务器的排行
  socket.on("setServerRank",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('setServerRank-json');
    }
    gameInfo.setServerRank(_info);
  })

  
  socket.on("score_changeLog",function(_info){
    gameInfo.insertScore_change_log(_info);
  })

  socket.on("insertMark",function(_info){
    gameInfo.insertMark(_info);
  })

  socket.on("pro_change",function(_info){
    gameInfo.pro_change(_info);
  })

  //游戏服务器的排行
  socket.on("getServerRank",function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getServerRank-json');
    }
    gameInfo.getServerRank(socket,_info);
  })

    //报名
  socket.on('applyMatch',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('applyMatch-json');
    }
    gameInfo.ApplyMatch(socket.userId,_info.roomid,socket)
  })

  //喇叭说话
  socket.on('sendMsg',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('sendMsg-json');
    }
    gameInfo.sendMsg(socket.userId,_info,io)
  })

  //私聊
  socket.on('sendMsgToUser',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('sendMsgToUser-json');
    }
    gameInfo.sendMsgToUser(socket,_info)
  })

  //获取未收到私聊
  socket.on('getMsgToUser',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getMsgToUser-json');
    }
    gameInfo.getMsgToUser(socket,_info)
  })

  //更新聊天记录
  socket.on('updateCharLog',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('updateCharLog-json');
    }
    gameInfo.updateCharLog(socket,_info.idList)
  })

  //兑奖
  socket.on('scoreOut',function(_info){
    try{
      var data = JSON.parse(_info);
      _info = data;
    }
    catch(e){
      log.warn('getMsgToUser-json');
    }
    _info.ip = socket.handshake.address;
    log.info(_info)
    if(_info.ip.split(':').length>0){
      var ip = _info.ip.split(':')[3];
        if (ip){
          _info.ip = ip;
        }else{
          _info.ip = "52.193.83.112";
        }
        
        
        gameInfo.scoreOut(socket,_info);
    }
    
  })

  //心跳
  socket.on('heartbeat',function(){
    socket.emit('heartbeatResult');
  })

  

});


app.set('port', process.env.PORT || 13000);

var server = http.listen(app.get('port'), function() {
  log.info('start at port:' + server.address().port);
});


var period = 100; // 1 second
var noticeflag = true;
var times = 0;

setInterval(function() {

    var nowDate = new Date();
    var hours = nowDate.getHours();
    var minute = nowDate.getMinutes();
    var second = nowDate.getSeconds();
    times++;
    //比赛时间 8:00 - 24:00
    if (minute % 10 == 0 && second == 0){
      if (noticeflag)
        gameInfo.sendNotice(io);
      noticeflag = false;
    }else{
      noticeflag = true;
    }
    //更新登录
    gameInfo.updateLogin();
    //保存用户
    gameInfo.pisaveUser();
    //保存log
    gameInfo.score_changeLog();
    //PostCoin
    if (times == 60){
      gameInfo.PostCoin();
      times = 0;
    }

}, period);


// var rule = new schedule.RecurrenceRule();
//每到55秒
//rule.seconds = 55;
//正常模式
//rule.minute = 55;
  // var times = [];

  // for(var i=0; i<60; i++){
  // 　　times.push(i);
  // }
  // rule.second = times;
  // var timer = (Math.floor(Math.random() * 120)) + 60;
  // var timer_yin = (Math.floor(Math.random() * 500)) + 1600;
  // var j = schedule.scheduleJob(rule, function(){
  // //更新登录
  // // gameInfo.updateLogin();
  // // //保存用户
  // // gameInfo.pisaveUser();
  // // //保存log
  // // gameInfo.score_changeLog();
  // //暂时不知道干什么用的
  // // gameInfo.sendApi();
  // --timer;
  
  // if (timer <= 0){
  // var idx = (Math.floor(Math.random() * 10000))
  // io.sockets.emit('noticeMsg',{nickname:Robotname[idx].nickname,msg:"成功兑换20元电话卡!"});
  // timer =  (Math.floor(Math.random() * 120)) + 60;
  // }

  // var nowDate = new Date();
  // var hours = nowDate.getHours();
  // if (hours > 3 && hours < 10){

  // }else{
  //   --timer_yin;
  //   if (timer_yin <= 0){
  //     timer_yin = (Math.floor(Math.random() * 500)) + 1600;
  //     io.sockets.emit('noticeMsg',{nickname:".",msg:"上分100元=15000金币"});
  //     io.sockets.emit('noticeMsg',{nickname:".",msg:"收分16000金币=100元"});
  //     io.sockets.emit('noticeMsg',{nickname:".",msg:"加微信18875495446"});
  //   }
  // }



  

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
// });

dao.clenaLineOut();

log.info("登录服务器 v2.0.0");
log.info("服务器启动成功!");
log.info("更新时间:2016.10.17");


