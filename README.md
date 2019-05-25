# 开源游戏源码

#### 介绍
本源码来自外星人源码网 - www.eenot.com

#### 软件架构

H5源码电玩城 1:1真钱H5捕鱼棋牌游戏源码下载

H5源码电玩棋牌游戏(可运营)需要自己接一下支付接口，此版本为WIN版。
H5源码电玩版带抢庄牛牛，捕鱼，斗地主，连线机，经典牛牛，八搭二，二八杠，带机器人。

内带修改文档。画面精美，简单易搭建，内带环境安装包。可以XJ模式哦。如果不要，可以直接屏蔽掉。

H5源码1:1真钱捕鱼棋牌游戏源码下载
此套H5源码程序完整 PHP开发 为H5版本 无需客户端 使用cocos-js开发

亲测可用，大家赶快来下载呀！！！！
只要架设好直接在手机里面打开就可以玩了 难能可贵的还是H5源码真钱版本 而且还是多款游戏合集

#### 架设说明
1.复制新的游戏服务器目录
2.修改新复制出来的server/app.js

app.set('port', process.env.PORT || 3104);

新的端口
3.在登录服务器里serverInfo.js 加上对应的

`
var serverRoom2 = {};

serverRoom2.Server = 2;

serverRoom2.bet = 5;

serverRoom2.entryCoin = 500;

serverRoom2.gift = 0;

serverRoom2.ip = "127.0.0.1";

serverRoom2.prot = "3104";	
	
serverGame1.serverInfo.push(serverRoom2);

GameConfig.push(serverGame1);
`
		    

4.修改倍数
gameConfig.js


#### 使用说明

本源码来自外星人源码网 如果在安装和架设中遇到任何问题可以加我们的QQ群交流  QQ群号：873931886

