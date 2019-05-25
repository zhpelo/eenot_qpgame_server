# 外星人棋牌-服务端源码

#### 介绍
    大家好，我外星人源码网的站长，这是第一次在码云上分享棋牌源码，此套棋牌游戏源码包含抢庄牛牛，捕鱼，斗地主，连线机，经典牛牛，八搭二，二八杠等。玩法多种多样是可以正常上线运营的源码！ 这是后端使用 nodejs  前端使用cocos2d-js开发的一套H5的游戏代码， coco2d-js也可以生成安卓和ios客户端，对这套代码感兴趣的小伙伴们 star 一下吧！！
    本源码来自外星人源码网 - [http://www.eenot.com](http://www.eenot.com)

#### 运行截图
![来自外星人源码网](https://images.gitee.com/uploads/images/2019/0525/105537_71b544c7_375279.png "2.png")
![来自外星人源码网](https://images.gitee.com/uploads/images/2019/0525/105626_954c1b3c_375279.png "3.png")
![来自外星人源码网](https://images.gitee.com/uploads/images/2019/0525/105611_4c6d07ca_375279.png "4.png")
![来自外星人源码网](https://images.gitee.com/uploads/images/2019/0525/105636_fd8526aa_375279.png "5.png")
![来自外星人源码网](https://images.gitee.com/uploads/images/2019/0525/105700_b02d7738_375279.png "6.png")

#### 架设说明
1.复制新的游戏服务器目录

2.修改新复制出来的server/app.js

`app.set('port', process.env.PORT || 3104);`

新的端口
3.在登录服务器里serverInfo.js 加上对应的

```
var serverRoom2 = {};

serverRoom2.Server = 2;

serverRoom2.bet = 5;

serverRoom2.entryCoin = 500;

serverRoom2.gift = 0;

serverRoom2.ip = "127.0.0.1";

serverRoom2.prot = "3104";	
	
serverGame1.serverInfo.push(serverRoom2);

GameConfig.push(serverGame1);
```

4.修改倍数
gameConfig.js


#### 使用说明

本源码来自外星人源码网 如果在安装和架设中遇到任何问题可以加我们的QQ群交流  QQ群号：873931886

![输入图片说明](https://images.gitee.com/uploads/images/2019/0525/105810_632a8129_375279.jpeg "QQ图片20190525105759.jpg")