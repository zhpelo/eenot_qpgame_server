var User = require("./../../CClass/class/User");
var gameDao = require("./gameDao");
var LoginGameDao = require("./../../CClass/dao/gameDao");
var sever = require("./sever");
var schedule = require("node-schedule");
//var gameConfig = require("./../config/gameConfig");
var urlencode = require('urlencode');
var fs = require('fs');
var log = require("./../../CClass/class/loginfo").getInstand;
var color=require('colors');

var GameInfo = function(){

	var _gameinfo = "";

	var Game = function(){

		//初始化游戏
		this.init = function(_config){
			log.info('####init game!####')
			//this.plusq(1,1,1,1);
			// console.log(color.rainbow('彩虹色'))
			gameConfig = _config;
			//console.log(gameConfig.bet);
			this.serverId = gameConfig.serverId;
			//初始化用户列表
			this.userList = {};
			//抢地主状态
			 this.bold=new Array(gameConfig.tableMax);
			 for(var n=0;n<this.bold.length;n++){
			 	this.bold[n]=new Array();
			 }
			//房间座位计时
			this.seatIdTime= new Array(gameConfig.tableMax);
			//判断上家牌
			this.SevaCarcd=new Array(gameConfig.tableMax);

			for(var c=0;c<this.SevaCarcd.length;c++){
				this.SevaCarcd[c]=[[],[],[]];

			}
			//每桌的倍数
			this.double=new Array(gameConfig.tableMax);
			for(var kuk=0;kuk<this.double.length;kuk++){
				this.double[kuk]=1;	
			}
			//记录打出去的每张牌;
			this.carcdout=new Array(gameConfig.tableMax);
			//初始化的牌，保留牌数据；
			this.SevaC=new Array(gameConfig.tableMax);
			//叫地主的计时器；
			this.Ntime=new Array(gameConfig.tableMax);
			//叫地主的倍数
			this.landouble=new Array(gameConfig.tableMax);
			//每桌出牌顺序
			this.ordertable=new Array(gameConfig.tableMax);
			//每桌用户的状态
			this.people=new Array(gameConfig.tableMax);
			//保存牌
			this.carcdList=new Array(gameConfig.tableMax);
			//创建桌子 0位保存桌子状态
			this.tableList = new Array(gameConfig.tableMax);
			//保存炸弹个数
			this.bomb= new Array(gameConfig.tableMax);
			//创建座位
			this.Home=new Array(100);
			this.PgUp=20;
			for(var v=0;v<this.people.length;v++){
				this.people[v]=new Array();
				this.ordertable[v]=0;
				this.landouble[v]=0
				this.Ntime[v]=16
				this.bomb[v]=0;
				this.Home[v]=0;
				this.SevaC[v]=new Array(gameConfig.seatMax);
				this.carcdout[v]=[[],[],[]];

			}

			for(var ins=0;ins<this.seatIdTime.length;ins++){
				this.seatIdTime[ins]=-1;
			}

			for(var i = 0; i < this.tableList.length; ++i){
				this.tableList[i] = new Array(gameConfig.seatMax + 1);
			}

			for(var m=0;m<this.carcdList.length;m++){
				this.carcdList[m] =new Array(gameConfig.seatMax+1);
			}
			//在线人数为0
			this.onlinePlayerCount = 0;
			//底分
			this.Theen=gameConfig.Theendpoints;
			//维护模式
			this.maintain = false;
			this._io = {};
			this.GameList = new Array();

			this.lineOutList = {};
			this.score_changeLogList = [];
			this.x = 10000;
			var self = this;
			this.matchId = 0;
			this.timex=new Array(gameConfig.seatMax);
			for(var timeEnd=0;timeEnd<this.timex.length;timeEnd++){
				this.timex[timeEnd]=21;
			}
			this.sever = new sever();
		　　var rule = new schedule.RecurrenceRule();
		　　var times = [];
		　　for(var i=0; i<60; i++){
		　　　　times.push(i);
		　　}
		　　rule.second = times;
			var c = 0;
			this.SaiId=0;
		 	

			var self = this;
			
			
		　　var j = schedule.scheduleJob(rule, function(){
				
				for (var i=0;i<100;i++) {
						var onlise=0;
						var people=0;
						
						for(var z=0;z<self.tableList[i].length-1;z++){
							if(self.tableList[i][z]!=undefined){
								onlise++;
							}
						}
					
						for(var pe=0;pe<self.people[i].length;pe++){
							if(self.people[i][pe]&&self.people[i][pe].ready==0){
								people++
								
							}
						}


						
						if (people==3) {
								
								//console.log('我在发牌任务')
						 		self.sendCard(i);
						 		self.matchId++;
						 		for(var n=0;n<self.tableList[i].length-1;n++){
						 			self.tableList[i][n].Water=1;
						 			self.tableList[i][n].seatState=1;
						 		}
						 }
						
						
						 self.score_changeLog();

						//随机地主
						
						if(self.people[i][0]&&self.people[i][0].ready==1&&self.people[i][1].ready==1&&self.people[i][2].ready==1){
							//console.log(self.people[i])
						 	self.Landlord(i);
						 		//console.log('4')
						}

						// 叫/抢 地主的定时器
						for(var lan=0;lan<self.tableList[i].length-1;lan++){
								
							if(self.tableList[i][lan]!=null&& self.tableList[i][lan].Bomb!=0){
								
								if(self.tableList[i][lan].Bomb==15){
									//console.log('yyyyyyyyyyyyy')
									if(self.Ntime[i]<16&&self.Ntime[i]<=self.tableList[i][lan].Bomb){
										self.Ntime[i]--;
									}
									if(self.Ntime[i]<=0){
										self.landroid(i,lan)
									}
								}
							}
						}


						//加倍暂时不做
						
						for(var nob=0;nob<self.tableList[i].length-1;nob++){
								
							if(self.tableList[i][nob] && self.tableList[i][nob].Sss==1){
								//console.log('6')
								self.ordertable[i]=nob;
								self.tableList[i][nob].Sss=2;
								//console.log('检测Ssss')
								//console.log(self.tableList[i][nob].Sss);
								if(nob==0){
									self.carcdList[i][nob]=self.Simple_sorting(i,nob);
									self.carcdList[i][1]=self.Simple_sorting(i,1);
									self.carcdList[i][2]=self.Simple_sorting(i,2);
									//console.log(self.carcdList[i])
								}else if(nob==1){
									self.carcdList[i][nob]=self.Simple_sorting(i,nob);
									self.carcdList[i][0]=self.Simple_sorting(i,0);
									self.carcdList[i][2]=self.Simple_sorting(i,2);
									//console.log(self.carcdList[i])
								}else if(nob==2){
									self.carcdList[i][nob]=self.Simple_sorting(i,nob);
									self.carcdList[i][1]=self.Simple_sorting(i,1);
									self.carcdList[i][0]=self.Simple_sorting(i,0);
								// 	console.log(self.carcdList[i])
								}
								self.timex[i]=self.PgUp;
								self.tableList[i][nob].Afford=self.PgUp;
								//self._io.sockets.in('table'+i).emit('sendCardsArr',{userId:self.tableList[i][nob].userId,second:25});
								self.seatIdTime[i][0]=nob;
								//return;
							}
						}
						//确定出牌,计时
						
						for(var rc=0;rc<self.tableList[i].length-1;rc++){
								
							if(self.tableList[i][rc]!=null&& self.tableList[i][rc].Afford!=0){
								//console.log('7')
								if(self.tableList[i][rc].Afford==self.PgUp){
									if(self.timex[i]<21 && self.timex[i]<=self.tableList[i][rc].Afford){
										self.timex[i]--;
										//console.log(color.rainbow('倒数-----------------------------'+self.timex[i]+'-----------------------------'));
									}
								}
								if(self.timex[i]<=-1){
									//console.log(color.yellow.bgWhite('自动出牌'))
									self.automatic(i,rc);
									//return;
								}
								
							}
							
						}
						// if(self.tableList[i][0]&&self.tableList[i][0].line==-1 && self.tableList[i][1].line==-1&& self.tableList[i][2].line==-1){
						// 	//console.log('7')
						// 	self.timex[i]=26;
						// }
						//待续任务
						
						//SEVA数据
						// for(var out=0;out<3;out++){
						// 	if(self.carcdout[i][out]&&self.carcdout[i][out].length>=20){
						// 		//数据操作
						// 	}else{
						// 		return;
						// 	}
						// }
						// console.log('结束')
				}

			});

		}
		
		
		
		this.sendtable=function(data){
			//把ready准备状态变为0，发牌需要seatState==1
			//console.log('准备状态')
			//console.log(data)
			if(data&&this.people[data.tableId][data.seatId]&&this.people[data.tableId][data.seatId].ready==2){
				return;
			}

			 if(data!=null&&this.people[data.tableId][data.seatId]){
				for(var Ss=0;Ss<this.people[data.tableId].length;Ss++){
					if(this.people[data.tableId][Ss].userId==data.playerId){
						this.people[data.tableId][Ss].ready=0;					}
				}
				log.info(this.people[data.tableId])
				 //console.log(this.people[data.tableId])
			 }else{
			 	console.log('没ready'+data.seatId);
			 	

			 }
		}
		

		this.sendCard=function(tableId){
			result=this.sever.getdouCarcd(tableId);
			var tablestring="table"+tableId; //房间号
			var tableObj=this.tableList[tableId];//桌子
			
			for(var i=0;i<tableObj.length-1;i++){
				
					var carcd=result.carcd[i];
					//console.log(carcd)
					this.carcdList[tableId][i]=result.carcd[i];
					//this.tableList[tableId][i].ready=1;
					this.people[tableId][i].ready=1;
					// if(this.userList[tableObj[i].userId]){
						if(this.userList[tableObj[i].userId]){
							this.userList[tableObj[i].userId]._socket.emit('sendCard',{carcd:carcd});
							log.info("第"+tableId+"桌"+i+"牌");
							log.info(carcd);
						}else{
							log.info('用户'+this.tableList[tableId][i].userId+'掉线了')
						}
						if(i==2){
							
							log.info('第'+tableId+"桌公共牌")
							log.info(result.carcd[3])
							this.carcdList[tableId][3]=result.carcd[3];
							this._io.sockets.in(tablestring).emit('publicCarcd',{carcd:result.carcd[3],Multiple:tableObj[i].Multiple,points:this.Theen,double:this.double[tableId]});
						}
					// }else{
					// 	console.log('非法？')
					// }
				
			}

		}
		
		this.getTablePlayerBySeatId = function(_tableId,_seatId){		
			return this.tableList[_tableId][_seatId];
		}

		//叫/抢 定时器顺序
		this.landroid=function(tableId,seatId){
			
			this.plusq(tableId,seatId,0,this.tableList[tableId][seatId].userId);

		}
		//托管
		this.Trusteeship=function(Info){
			//console.log(Info)
			if(Info){
				if(Info.isTuoGuan==true){
					this._io.sockets.in('table'+Info.tableId).emit('InTuoGuan',{reslut:true,userId:Info.playerId});
				}else if(Info.isTuoGuan==false){
					this._io.sockets.in('table'+Info.tableId).emit('InTuoGuan',{reslut:false,userId:Info.playerId});
				}
			}
		}
		//抢地主1
		this.Landlord=function(tablelist){
			var Landlord_Poker=this.tableList[tablelist];
			var mine=Math.floor(Math.random()*3);

			for(var i=0;i<this.people[tablelist].length;i++){
				this.people[tablelist][i].ready=2;
			 }
			 
			log.info(tablelist+'-桌-随机座位：'+mine+'为叫地主')
			var tablestring="table"+tablelist;
			//标记为地主
			Landlord_Poker[mine].Sss=-1;
			if(this.userList[Landlord_Poker[mine].userId]){
				this.userList[Landlord_Poker[mine].userId]._socket.emit('Landlord',{No1:1,userId:Landlord_Poker[mine].userId,second:Landlord_Poker[mine].Rob_landlords});
				this.userList[Landlord_Poker[mine].userId]._socket.broadcast.emit('Landlord',{userId:Landlord_Poker[mine].userId,second:Landlord_Poker[mine].Rob_landlords})
			}else{
				this._io.sockets.in('table'+tablelist).emit('Landlord',{userId:Landlord_Poker[mine].userId,second:Landlord_Poker[mine].Rob_landlords});
			}
			
			this.Ntime[tablelist]=15;
			this.tableList[tablelist][mine].Bomb=15;
			// this.userList[Landlord_Poker[mine].userId]._socket.broadcast.to(tablestring).emit('Landlord',{userId:Landlord_Poker[mine].userId,second:Landlord_Poker[mine].Rob_landlords});
			
		}
		
		this.automatic=function(tableId,seatId){
			
			var DK=0;

			
			//console.log(this.tableList[tableId][seatId])
			//console.log('查看出牌状态');
			//console.log(this.SevaCarcd[tableId])
			var id=this.tableList[tableId][seatId].userId;
			//console.log(this.tableList[tableId][seatId]);
			if(this.tableList[tableId][seatId].Sss==2&&this.tableList[tableId][seatId].king==0){
				console.log('地主不出牌')
				this.SevaCarcd[tableId][seatId]=[this.carcdList[tableId][seatId][this.carcdList[tableId][seatId].length-1]];
				if(seatId==0){
					console.log([this.carcdList[tableId][seatId][0]])
					this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
					this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:this.PgUp});
					this.timex[tableId]=this.PgUp;
					this.tableList[tableId][seatId].Afford=0;
					this.tableList[tableId][seatId+1].Afford=this.PgUp;
				}else if(seatId==1){
					console.log([this.carcdList[tableId][seatId][0]])
					this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
					this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:this.PgUp});
					this.timex[tableId]=this.PgUp;
					this.tableList[tableId][seatId].Afford=0;
					this.tableList[tableId][seatId+1].Afford=this.PgUp;

				}else if(seatId==2){
					console.log([this.carcdList[tableId][seatId][0]])
					this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
					this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][0].userId,second:this.PgUp});
					this.timex[tableId]=this.PgUp;
					this.tableList[tableId][seatId].Afford=0;
					this.tableList[tableId][0].Afford=this.PgUp;
				}
				var newcarcd={_carcd:[this.carcdList[tableId][seatId][0]],_tableId:tableId,_seatId:seatId};
				this.deletecarcd(newcarcd);	
				this.tableList[tableId][seatId].king++;
			}else{

				if(this.SevaCarcd[tableId][seatId].length!=0){
					for(var ken=0;ken<this.SevaCarcd[tableId].length;ken++){
						if(ken!=seatId&&this.SevaCarcd[tableId][ken].length==0){
							DK++
						}
					}
				}
				
					//console.log('不出的人数——'+DK);
				if(DK==2){
					console.log('我来出牌了')
					if(seatId==0){
						//console.log([this.carcdList[tableId][seatId][0]])
						var DKK={array:[this.carcdList[tableId][seatId][0]],userId:this.tableList[tableId][seatId].userId,tableId:tableId,seatId:seatId};
						//this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
						//this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:25});
						this.inspectcarcd(DKK)
						//this.timex[tableId]=25;
						//this.SevaCarcd[tableId][seatId]=[this.carcdList[tableId][seatId][0]];
						//this.tableList[tableId][seatId].Afford=0;
						//this.tableList[tableId][seatId+1].Afford=25;
					}else if(seatId==1){
						//console.log([this.carcdList[tableId][seatId][0]])
						var DKK={array:[this.carcdList[tableId][seatId][0]],userId:this.tableList[tableId][seatId].userId,tableId:tableId,seatId:seatId};
						this.inspectcarcd(DKK)
						//this.SevaCarcd[tableId][seatId]=[this.carcdList[tableId][seatId][0]];
						//this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
						//this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:25});
						//this.timex[tableId]=25;
						//this.tableList[tableId][seatId].Afford=0;
						//this.tableList[tableId][seatId+1].Afford=25;

					}else if(seatId==2){
						//console.log([this.carcdList[tableId][seatId][0]])
						var DKK={array:[this.carcdList[tableId][seatId][0]],userId:this.tableList[tableId][seatId].userId,tableId:tableId,seatId:seatId};
						//this.SevaCarcd[tableId][seatId]=[this.carcdList[tableId][seatId][0]];
						this.inspectcarcd(DKK);
						//this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[this.carcdList[tableId][seatId][0]],userId:id,Explain:'单牌',double:this.double[tableId]});
						//this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][0].userId,second:25});
						//this.timex[tableId]=25;
						//this.tableList[tableId][seatId].Afford=0;
						//this.tableList[tableId][0].Afford=25;
					}
					//var newscarcd={_carcd:[this.carcdList[tableId][seatId][0]],_tableId:tableId,_seatId:seatId};
					//this.deletecarcd(newscarcd);	
				}else{
					if(seatId==0){
						this.SevaCarcd[tableId][seatId]=[];
						this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[],userId:id,Explain:'不出',double:this.double[tableId]});
						this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:this.PgUp});
						this.timex[tableId]=this.PgUp;
						this.tableList[tableId][seatId].Afford=0;
						this.tableList[tableId][seatId+1].Afford=this.PgUp;
					}else if(seatId==1){
						this.SevaCarcd[tableId][seatId]=[];
						this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[],userId:id,Explain:'不出',double:this.double[tableId]});
						this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][seatId+1].userId,second:this.PgUp});
						this.timex[tableId]=this.PgUp;
						this.tableList[tableId][seatId].Afford=0;
						this.tableList[tableId][seatId+1].Afford=this.PgUp;

					}else if(seatId==2){
						this.SevaCarcd[tableId][seatId]=[];
						this._io.sockets.in('table'+tableId).emit('ACarcd',{carcd:[],userId:id,Explain:'不出',double:this.double[tableId]});
						this._io.sockets.in('table'+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][0].userId,second:this.PgUp});
						this.timex[tableId]=this.PgUp;
						this.tableList[tableId][seatId].Afford=0;
						this.tableList[tableId][0].Afford=this.PgUp;
					}	
				}
			}
		}

		//出牌
		this.inspectcarcd=function(jsonp){
			var nb=this.Judgingcard_type(jsonp);//判断出牌
			//console.log('出牌判断');
			//console.log(color.red('------------------------------------------------'))
			//log.info(nb);
			//console.log(color.red('------------------------------------------------'))
			
			if(this.tableList[nb._tableId][nb._seatId].Water==0){
				console.log(color.red.bgWhite('结束了，不要再发了'))
				//this.userList[this.tableList[nb._tableId][nb._seatId].userId]._socket.emit('MyCarcd',{result:true});
				return;
			}
			// if(nb==undefined||nb.Explain==undefined){
			// 	this.userList[this.tableList[nb._tableId][nb._seatId].userId]._socket.emit('MyCarcd',{result:false});
			// 	return;
			// }else{
			
			
				if(nb.result==true){

					//验证牌库有没有这手牌
					// if(nb._carcd.length!=0){
					// 	for(var Pg=0;Pg<nb._carcd.length;Pg++){
					// 		for(var Pr=0;Pr<this.carcdList[nb._tableId][nb._seatId].length;Pr++){
					// 			if(nb._carcd[Pg].val==this.carcdList[nb._tableId][nb._seatId][Pr].val&&nb._carcd[Pg].type==this.carcdList[nb._tableId][nb._seatId][Pr].type){
					// 				console.log(color.yellow('验证通过'))
					// 			}
					// 		}
					// 	}
					// }
					

					
					if(this.carcdList[nb._tableId][nb._seatId].length==nb._carcd.length){
						//console.log('--结算--')
						//console.log(this.tableList[nb._tableId][nb._seatId].Sss)
						if(this.tableList[nb._tableId][nb._seatId].Sss==2){
							this._io.sockets.in('table'+nb._tableId).emit('ACarcd',{carcd:nb._carcd,userId:nb._userId,Explain:nb.Explain,double:this.double[nb._tableId]});
							//this.carcdList[nb._tableId][nb._seatId]=[];
							this.Settlement(nb._tableId,nb._seatId,nb._userId,1,1)
						}else{
							this._io.sockets.in('table'+nb._tableId).emit('ACarcd',{carcd:nb._carcd,userId:nb._userId,Explain:nb.Explain,double:this.double[nb._tableId]});
							//this.carcdList[nb._tableId][nb._seatId]=[];
							this.Settlement(nb._tableId,nb._seatId,nb._userId,1,0)
						}
						this.tableList[nb._tableId][nb._seatId].Afford=0;
						return;
					}
					
					//数据库读取s
					//console.log(nb._carcd)
					//this.carcdout[nb._tableId][nb._seatId].push(this.sever.TrialCarcd(nb._carcd));
					//var xxx=this.sever.TrialCarcd(this.carcdout[nb._tableId][nb._seatId]);
					//console.log(this.carcdout[nb._tableId][nb._seatId])
					if(this.userList[this.tableList[nb._tableId][nb._seatId].userId]){
						this.userList[this.tableList[nb._tableId][nb._seatId].userId]._socket.emit('MyCarcd',{result:true});
					}
					
					
					this._io.sockets.in('table'+nb._tableId).emit('ACarcd',{carcd:nb._carcd,userId:nb._userId,Explain:nb.Explain,double:this.double[nb._tableId]});
					//this.Setinval(nb);
					if(nb._seatId==0){
						this.SevaCarcd[nb._tableId][nb._seatId]=nb._carcd;
						
						this._io.sockets.in('table'+nb._tableId).emit('ListenCarcd',{userId:this.tableList[nb._tableId][nb._seatId+1].userId,second:this.PgUp});
						this.tableList[nb._tableId][nb._seatId].Afford=0;
						this.tableList[nb._tableId][nb._seatId+1].Afford=this.PgUp;
						this.timex[nb._tableId]=this.PgUp;
						this.seatIdTime[nb._tableId]=1;
						this.tableList[nb._tableId][nb._seatId].king++;
					}else if(nb._seatId==1){
						this.SevaCarcd[nb._tableId][nb._seatId]=nb._carcd;
						
						this._io.sockets.in('table'+nb._tableId).emit('ListenCarcd',{userId:this.tableList[nb._tableId][nb._seatId+1].userId,second:this.PgUp});
						this.tableList[nb._tableId][nb._seatId].Afford=0;
						this.tableList[nb._tableId][nb._seatId+1].Afford=this.PgUp;
						this.timex[nb._tableId]=this.PgUp;
						this.seatIdTime[nb._tableId]=2;
						this.tableList[nb._tableId][nb._seatId].king++;
					}else if(nb._seatId==2){
						this.SevaCarcd[nb._tableId][nb._seatId]=nb._carcd;
						
						this._io.sockets.in('table'+nb._tableId).emit('ListenCarcd',{userId:this.tableList[nb._tableId][0].userId,second:this.PgUp});
						this.tableList[nb._tableId][nb._seatId].Afford=0;
						this.tableList[nb._tableId][0].Afford=this.PgUp;
						this.timex[nb._tableId]=this.PgUp;
						this.seatIdTime[nb._tableId]=0;
						this.tableList[nb._tableId][nb._seatId].king++;
					}
			
					this.deletecarcd(nb);
				}else if(nb.result==false){
					//console.log('false')
					//console.log(this.tableList[nb._tableId][nb._seatId].userId);
					this.userList[this.tableList[nb._tableId][nb._seatId].userId]._socket.emit('MyCarcd',{result:false,err:nb.Explain});
				}else{
					this.userList[this.tableList[nb._tableId][nb._seatId].userId]._socket.emit('MyCarcd',{result:false});
				}
			// }
			//正常↑
		}



		//结算
		this.Settlement=function(tableId,seatId,userId,win,who){
			var tables=this.tableList[tableId];
			var Bottom=this.double[tableId];
			log.info('第'+tableId+'桌倍数：'+Bottom);
			var array;
			var Mingcarcd=[];
			var CoinLog=[];
			var TUR=0.95;

			if(this.tableList[tableId][seatId].Water==0){
				console.log('结算蜜罐');
				return;
			}
			// if(this.carcdList[tableId][seatId].length>=1){
			// 	log.warn('还没打牌，不要想着结算');
			// 	console.log(this.carcdList[tableId][seatId])
			// 	this._io.sockets.in('table'+tableId).emit('NoWin',{result:false});
			// 	return;
			// }
			//明牌
			for(var Min=0;Min<this.carcdList[tableId].length-1;Min++){
				if(Min==0){
					Mingcarcd.push({userId:this.tableList[tableId][0].userId,carcd:this.carcdList[tableId][Min]});
				}else if(Min==1){
					Mingcarcd.push({userId:this.tableList[tableId][1].userId,carcd:this.carcdList[tableId][Min]});
				}else if(Min==2){
					Mingcarcd.push({userId:this.tableList[tableId][2].userId,carcd:this.carcdList[tableId][Min]});
				}
			}
			this._io.sockets.in('table'+tableId).emit('Mingcarcd',{carcd:Mingcarcd})
			//console.log('你好啊1111')
			console.log(tableId,seatId,userId,win,who)
			if(win==1){
				// this.Checkout(tableId,seatId,Bottom*250,who)
				this.timex[tableId]=21;
				log.info('第'+tableId+'桌'+'输赢情况:'+Bottom*this.Theen*TUR);
				if(who==1){
					for(var ga=0;ga<this.tableList[tableId].length-1;ga++){
						if(ga==seatId){
							this.GameBalance(userId,Bottom*this.Theen*TUR);
							log.info('地主'+userId+'赢：'+this.Theen*Bottom*TUR)
							this.tableList[tableId][ga].score=this.tableList[tableId][ga].score+Bottom*this.Theen*TUR;
							if(this.userList[userId]&&this.userList[userId].socre){
								this.userList[userId].socre=this.tableList[tableId][ga].score+Bottom*this.Theen*TUR;
							}
							
							CoinLog.push({userId:this.tableList[tableId][ga].userId,MatchId:this.SaiId,useCoin:Bottom*this.Theen,winCoin:Bottom*this.Theen*TUR,tax:Bottom*this.Theen*0.05,serverId:gameConfig.serverId,gameId:gameConfig.gameId});
							
						}else{
							this.tableList[tableId][ga].score=this.tableList[tableId][ga].score+Bottom*this.Theen*-1/2;
							if(this.userList[userId]){
								this.userList[userId].socre=this.tableList[tableId][ga].score+Bottom*this.Theen*-1/2;
							}
							log.info('农民'+this.tableList[tableId][ga].userId+'输：'+Bottom*this.Theen*-1/2)
							this.GameBalance(this.tableList[tableId][ga].userId,Bottom*this.Theen*-1/2)
							CoinLog.push({userId:this.tableList[tableId][ga].userId,MatchId:this.SaiId,useCoin:Bottom*this.Theen/2,winCoin:Bottom*this.Theen*TUR/2,tax:Bottom*this.Theen*0.05/2,serverId:gameConfig.serverId,gameId:gameConfig.gameId})
							
						}
					}
					console.log(this.tableList[tableId][seatId].score)
					if(seatId==0){
						console.log('1seatid==0')
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR*1,user22:Bottom*this.Theen*TUR*-1/2,user33:Bottom*this.Theen*TUR*-1/2,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:userId,Bottom:Bottom*this.Theen*TUR*1,Fraction:this.tableList[tableId][seatId].score},
							{userId:this.tableList[tableId][1].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][1].score+Bottom*this.Theen*-1/2},{userId:this.tableList[tableId][2].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][2].score+Bottom*this.Theen*-1/2}]});
						
					}else if(seatId==1){
						console.log('1seatid==1')
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR*-1/2,user22:Bottom*this.Theen*TUR,user33:Bottom*this.Theen*TUR*-1/2,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:userId,Bottom:Bottom*this.Theen*TUR*1,Fraction:this.tableList[tableId][seatId].score},
							{userId:this.tableList[tableId][0].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][0].score+Bottom*this.Theen*-1/2},{userId:this.tableList[tableId][2].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][2].score+Bottom*this.Theen*-1/2}]});			
					}else if(seatId==2){
						console.log('1seatid==2')
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR*-1/2,user22:Bottom*this.Theen*TUR*-1/2,user33:Bottom*this.Theen*TUR,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:userId,Bottom:Bottom*this.Theen*TUR*1,Fraction:this.tableList[tableId][seatId].score},
							{userId:this.tableList[tableId][0].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][0].score+Bottom*this.Theen*-1/2},{userId:this.tableList[tableId][1].userId,Bottom:Bottom*this.Theen*-1/2,Fraction:this.tableList[tableId][1].score+Bottom*this.Theen*-1/2}]});
					}
					this._Csocket.emit("insertMark",CoinLog);
				}else if(who==0){
					// this.Checkout(tableId,seatId,Bottom*250,who)
					var sos=[];
					//console.log('0')
					//console.log(this.tableList[tableId])
					for(var kk=0;kk<this.tableList[tableId].length-1;kk++){
						if(this.tableList[tableId][kk].Sss==2){
							//console.log(this.tableList[tableId][kk]);
							sos.push(this.tableList[tableId][kk]);
							this.GameBalance(this.tableList[tableId][kk].userId,Bottom*this.Theen*-1);
							this.tableList[tableId][kk].score=this.tableList[tableId][kk].score+Bottom*this.Theen*-1;
							log.info('地主扣钱：'+'用户'+this.tableList[tableId][kk].userId+'输'+Bottom*this.Theen*-1);
							CoinLog.push({userId:this.tableList[tableId][kk].userId,MatchId:this.SaiId,useCoin:Bottom*this.Theen,winCoin:Bottom*this.Theen*TUR,tax:Bottom*this.Theen*0.05,serverId:gameConfig.serverId,gameId:gameConfig.gameId});
						}else{
							log.info('农民赢'+'用户'+this.tableList[tableId][kk].userId+'赢:'+Bottom*this.Theen*1/2);
							this.tableList[tableId][kk].score=this.tableList[tableId][kk].score+Bottom*this.Theen*1/2;
							this.GameBalance(this.tableList[tableId][kk].userId,Bottom*this.Theen*1/2);
							CoinLog.push({userId:this.tableList[tableId][kk].userId,MatchId:this.SaiId,useCoin:Bottom*this.Theen/2,winCoin:Bottom*this.Theen*TUR/2,tax:Bottom*this.Theen*0.05/2,serverId:gameConfig.serverId,gameId:gameConfig.gameId})
						}
					}
					if(sos[0].seatId==0){
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR*-1,user22:Bottom*this.Theen*TUR/2,user33:Bottom*this.Theen*TUR/2,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						console.log('0seatid==0')
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:tables[1].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][1].score+Bottom*this.Theen*TUR*1/2},{userId:tables[2].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][2].score+Bottom*this.Theen*TUR*1/2},{userId:this.tableList[tableId][0].userId,Bottom:Bottom*this.Theen*TUR*-1,Fraction:this.tableList[tableId][0].score+Bottom*this.Theen*TUR*-1}]});
					}else if(sos[0].seatId==1){
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR/2,user22:Bottom*this.Theen*TUR*-1,user33:Bottom*this.Theen*TUR/2,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						console.log('0seatid==1')
						
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:tables[0].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][0].score+Bottom*this.Theen*TUR*1/2},{userId:tables[2].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][2].score+Bottom*this.Theen*TUR*1/2},{userId:this.tableList[tableId][1].userId,Bottom:Bottom*this.Theen*TUR*-1,Fraction:this.tableList[tableId][1].score+Bottom*this.Theen*TUR*-1}]});
					}else if(sos[0].seatId==2){
						//array={matchId:this.matchId,tableId:tableId,user1:tables[0].userId,user2:tables[1].userId,user3:tables[2].userId,points:this.Theen,double:this.landouble[tableId],zhadan:this.bomb[tableId],user11:Bottom*this.Theen*TUR/2,user22:Bottom*this.Theen*TUR/2,user33:Bottom*this.Theen*TUR*-1,tax:Bottom*this.Theen*0.05,server:this.serverId,game:this.sever.getTime()};
						//gameDao.GetSettlement(array,function(v){if(v==1){console.log('存储数据成功')}else{console.log('存储失败')}});
						console.log('0seatid==2')
						
						this._io.sockets.in('table'+tableId).emit('victory',{Winner:[{userId:tables[0].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][0].score+Bottom*this.Theen*TUR*1/2},{userId:tables[1].userId,Bottom:Bottom*this.Theen*TUR*1/2,Fraction:this.tableList[tableId][1].score+Bottom*this.Theen*TUR*1/2},{userId:this.tableList[tableId][2].userId,Bottom:Bottom*this.Theen*TUR*-1,Fraction:this.tableList[tableId][2].score+Bottom*this.Theen*TUR*-1}]});
					}
					this._Csocket.emit("insertMark",CoinLog);
				}
			}
				console.log(this.people[tableId])
				for(var d=0;d<this.people[tableId].length;d++){
					if(this.people[tableId][d].ready==8){
						this.people[tableId].splice(d,1)
					}
				}

				log.info('结算剩下人数')
				log.info(this.people[tableId])
				//数据库seva数据
				
				//var sevas=gameDao.GetSettlement()

				this.bold[tableId].splice(0,this.bold[tableId].length);	
				for(var i=0;i<3;i++){
					if(this.tableList[tableId][i]){
						this.tableList[tableId][i].Sss=0;
						this.tableList[tableId][i].qiang=0;
						this.tableList[tableId][i].king=0;
						this.tableList[tableId][i].line=0;
						this.tableList[tableId][i].pgup=-1;
						this.tableList[tableId][i].seatState=0;
						this.tableList[tableId][i].Water=0;
						if(this.people[tableId][i]&&this.people[tableId][i].ready){
							this.people[tableId][i].ready=-1;
						}
						
					}
					
					this.carcdList[tableId][i]=[];
					this.SevaCarcd[tableId][i]=[];
				}
				this.landouble[tableId]=0;
				this.bold[tableId]=[];
				this.double[tableId]=1;
				this.cleanLineOutByTable(tableId);
		}
		
		//删除卡牌
		this.deletecarcd=function(carcd){
			if(carcd.Explain=='不符合'){
				return;
			}else{
				if(carcd.Explain=='不出'){
					return;
				}else{
					//console.log(this.tableList[carcd._tableId][carcd._seatId].userId+'传过来的牌')
					//console.log(carcd._carcd)
					//console.log('用户牌有'+this.carcdList[carcd._tableId][carcd._seatId].length);
					for(var car=0;car<carcd._carcd.length;car++){
						for(var tab=0;tab<this.carcdList[carcd._tableId][carcd._seatId].length;tab++){
							if(carcd._carcd[car].val==this.carcdList[carcd._tableId][carcd._seatId][tab].val && carcd._carcd[car].type==this.carcdList[carcd._tableId][carcd._seatId][tab].type){
								this.carcdList[carcd._tableId][carcd._seatId].splice(tab,1);
							}
						}
					}
					//console.log('删除后剩余'+this.carcdList[carcd._tableId][carcd._seatId].length)
					// console.log(this.carcdList[carcd._tableId][carcd._seatId].length);
				}
			}
		}



		this.Judgingcard_type=function(data){
			console.time('算牌时间')
			var room="table"+tableId;
			var alink;
			var doudizhu=[]
			var array=data.array;		//牌
			var userId=data.userId;		//id
			var tableId=data.tableId;	//桌子
			var seatId=data.seatId;		//座位
			var ResultType;				//返回
			var arrary=new Array();
		
			// for(var meme=0;meme<this.tableList[tableId].length-1;meme++){
			// 	if(this.tableList[tableId][meme].Sss&&this.tableList[tableId][meme].Sss==2){
			// 		doudizhu.push(this.tableList[tableId][meme]);
			// 	}
			// }
			//防止地主都没叫就出牌
			// if(doudizhu.length==0){
			// 	return ResultType={result:false,Explain:'不出',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};;
			// }


			if(array.length==0){
				return ResultType={result:true,Explain:'不出',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
			
			}


			if(array.length==1){
				//console.log('array.length==1')
				return ResultType={result:true,Explain:'单牌',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
			}
			//王炸(14)或者对zi(2)
			if(array.length==2){
				//console.log('array.length==2')
				
					if(array[0].type==5 && array[1].type==5){
						// this.landouble[tableId]=this.landouble[tableId]+2;
						this.double[tableId]=this.double[tableId]*2
						this.bomb[tableId]=this.bomb[tableId]+1;
						return ResultType={result:true,Explain:'王炸',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if (array[0].val==array[array.length-1].val&& array[array.length-1].type!=5) {
						return ResultType={result:true,Explain:'对子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
			}
			//比如3个3(3)
			if(array.length==3){
				//console.log('array.length==3')
				alink=array[0];
				if(alink.val==array[1].val&&alink.val==array[2].val){
					return ResultType={result:true,Explain:'三条',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
				}else{
					return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
				}
			}
			//三代一(4)或者炸弹(44)
			if(array.length==4){
				//console.log('array.length==4');
				

					if(array[0].val==array[1].val&&array[1].val==array[2].val&&array[2].val==array[3].val){
						 this.double[tableId]=this.double[tableId]*2;
						this.bomb[tableId]=this.bomb[tableId]+1;
						return ResultType={result:true,Explain:'炸弹',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if (array[0].val!=array[1].val&&array[1].val==array[2].val&&array[2].val==array[3].val) {
						return ResultType={result:true,Explain:'三带一',_carcd:array,max:array[1].val,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(array[0].val==array[1].val&&array[1].val==array[2].val&&array[2].val!=array[3].val){
						return ResultType={result:true,Explain:'三带一',_carcd:array,max:array[1].val,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
					
			}
			//三带二（5）顺子（51）
			if(array.length==5){

				console.log('array.length==5')
				if(array[0].val==1&&array[0].val+12==array[1].val&&array[1].val==array[2].val+1&array[2].val==array[3].val+1&array[3].val==array[4].val+1){
					return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};

				}else if(array[0].val==array[1].val+1&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[3].val==array[4].val+1){
					return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};

				}else if(array[0].val==array[1].val&&array[1].val!=array[2].val&&array[2].val==array[3].val&&array[3].val==array[4].val){
					return ResultType={result:true,Explain:'三带二',_carcd:array,max:array[2].val,_userId:userId,_tableId:tableId,_seatId:seatId};

				}else if(array[0].val==array[1].val&&array[1].val==array[2].val&&array[2].val!=array[3].val&&array[3].val==array[4].val){
					return ResultType={result:true,Explain:'三带二',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
				}else{
					return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
				}

			}

			if(array.length==6){
				console.log('array.length==6')
				console.log('shenm ')
				if(array[0].val==array[1].val&&array[2].val==array[3].val&&array[4].val==array[5].val&&array[0].val==array[2].val+1&&array[2].val==array[4].val+1){		
						return ResultType={result:true,Explain:'连对',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					
				}else if(array[0].val==array[1].val+1&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[0].val==array[array.length-1].val+5){
					if(array[3].val==array[4].val+1){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}

				}else if(array[0].val>array[1].val&&array[1].val>array[2].val&&array[2].val==array[3].val&&array[3].val==array[4].val&&array[4].val==array[5].val){
					return ResultType={result:true,Explain:'四带二',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};

				}else if(array[0].val==array[1].val&&array[1].val==array[2].val&&array[2].val==array[3].val&&array[3].val!=array[4].val&&array[3].val!=array[5].val){
					return ResultType={result:true,Explain:'四带二',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};

				}else if(array[0].val==1&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[4].val==array[5].val+1){
					if(array[3].val==array[4].val+1){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}else{
					console.log('pppp');
					return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
				}
			}

			if(array.length==7){
				console.log('array.length==7')
				if(array[0].val!=1&&array[0].val!=2){

					if(array[0].val-1==array[1].val&&array[1].val-1==array[2].val&&array[2].val-1==array[3].val&&array[3].val-1==array[4].val&&array[4].val-1==array[5].val&&array[5].val-1==array[6].val){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
				
				if(array[0].val==1&&array[1].val==13&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[3].val==array[4].val+1&&array[4].val==array[5].val+1){
					
					if(array[5].val==array[6].val+1){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}else{
					return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
				}


			}

			if(array.length==8){
				console.log('array.length==8');
				arrary=new Array();
				var alink=[].concat(array);
			
				var noob=[];
				for(var a=0;a<array.length;a++){
					for(var b=a+1;b<array.length;b++){
						if(array[a].val==array[b].val){
							arrary.push(array[a]);
							//array.splice(b,1);
						}
					}
				} 

				for(var aa=0;aa<alink.length;aa++){
					for(var bb=aa+1;bb<alink.length;bb++){
						if(alink[aa].val==alink[bb].val){
							noob.push(alink[aa]);
							alink.splice(aa,1);
						}
					}
				} 	
				console.log(noob)
				if(noob.length==2){
					if(noob[0].val==noob[1].val+1){
						return ResultType={result:true,Explain:'飞机',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val==1&&noob[0].val+12==noob[1].val){
						return ResultType={result:true,Explain:'飞机',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
				if(noob.length==3){
					if(noob[0].val==1&&noob[0].val+12==noob[1].val&&noob[1].val!=noob[1].val){
						return ResultType={result:true,Explain:'飞机',max:noob[1].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val==noob[1].val+1&&noob[1].val!=noob[2].val){
						return ResultType={result:true,Explain:'飞机',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val!=noob[1].val&&noob[1].val==noob[2].val+1){
						return ResultType={result:true,Explain:'飞机',max:noob[1].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(noob.length==4){
					console.log('noob')
					if(noob[0].val==noob[1].val&&noob[1].val!=noob[2].val&&noob[2].val!=noob[3].val){
						return ResultType={result:true,Explain:'四带二',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val!=noob[1].val&&noob[1].val!=noob[2].val&&noob[2].val==noob[3].val){
						return ResultType={result:true,Explain:'四带二',max:noob[2].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val!=noob[1].val&&noob[1].val==noob[2].val&&noob[2]!=noob[3].val){
						return ResultType={result:true,Explain:'四带二',max:noob[1].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(noob[0].val==noob[1].val&&noob[1].val!=noob[2].val&&noob[2].val==noob[3].val){
						if(noob[0].val!=2||noob[0].val!=1){
							if(noob[0].val>noob[2].val){
								return ResultType={result:true,Explain:'四带二',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
							}else{
								return ResultType={result:true,Explain:'四带二',max:noob[2].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
							}
						}else{
								return ResultType={result:true,Explain:'四带二',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}else if(noob[0].val==noob[1].val+1 && noob[1].val==noob[2].val+1 &&noob[2].val==noob[3].val+1){
						return ResultType={result:true,Explain:'连对',max:noob[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(arrary.length==7){
					console.log('(8)arrary.length==7')
					//88877766
					if(arrary[0]!=2){

						if(arrary[0].val==arrary[1].val&&arrary[0].val==arrary[2].val&&arrary[2].val>arrary[3].val&&arrary[3].val==arrary[4].val&&arrary[3].val==arrary[4].val&&arrary[4].val==arrary[5].val&&arrary[5].val>arrary[6].val){
							return ResultType={result:true,Explain:'飞机',max:array[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

						}else if(arrary[0].val>arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[2].val==arrary[3].val&&arrary[3]>arrary[4].val&&arrary[4].val==arrary[5].val&&arrary[5]==arrary[6].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[2].val,_userId:userId,_tableId:tableId,_seatId:seatId};

						}else if(arrary[0].val==arrary[1].val&&arrary[0].val==arrary[2].val&&arrary[2].val+12.5>arrary[3].val&&arrary[3].val==arrary[4].val&&arrary[4].val==arrary[5].val&&arrary[5].val!=arrary[6].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[2].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
						else{
							console.log(array)
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}	
				}

				if(arrary.length==4){
						console.log('arrary.length')
					if(arrary[0].val==arrary[1].val+1 && arrary[1].val==arrary[2].val+1&&arrary[2].val==arrary[3].val+1){
						return ResultType={result:true,Explain:'连对',max:array[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else{
						console.log(array)
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(array.length==8){
					console.log('8shizhenduo ')
					if(array[0].val==array[1].val+1 && array[1].val==array[2].val+1 && array[2].val==array[3].val+1 && array[3].val==array[4].val+1 && array[4].val==array[5].val+1 &&array[5].val==array[6].val+1&&array[6].val==array[7].val+1){
						return ResultType={result:true,Explain:'顺子',max:array[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else if(array[0].val==1&&array[0].val+12==array[1].val && array[1].val==array[2].val+1 && array[2].val==array[3].val+1 && array[3].val==array[4].val+1 && array[4].val==array[5].val+1 &&array[5].val==array[6].val+1&&array[6].val==array[7].val+1){
						return ResultType={result:true,Explain:'顺子',max:array[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						console.log(array)
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
			}

			if(array.length==9){
				console.log('array.length==9')
				var kiers=[].concat(array);
				var kkk=[];
				arrary=new Array();
				for(var full=0;full<array.length;full++){
					if(array[full].val!=2 && array[full].val!=14 && array[full].val!=15){
						for(var r=full+1;r<array.length;r++){
							if(array[full].val==1){
								arrary.push(array[full]);
							}else if(array[full].val-array[r].val==1){
								arrary.push(array[full]);
							}
						}
					}
					
				for(var i=0;i<kiers.length;i++){
					for(var c=i+1;c<kiers.length;c++){
						if(kiers[i]==kiers[c]){
							kkk.push(kiers[i]);
							kiers.splice(i,1)
						}
					}
				}


				}
				//顺子
				if(array[0].val==1&&array[0].val+12==array[1].val&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[3].val==array[4].val+1){
					if(array[4].val==array[5].val+1&&array[5].val==array[6].val+1&&array[6].val==array[7].val+1&&array[7].val==array[8].val+1){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}else if(array[0].val==array[1].val+1&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[3].val==array[4].val+1&&array[4].val==array[5].val+1){
					if(array[5].val==array[6].val+1&&array[6].val==array[7].val+1&&array[7].val==array[8].val+1){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(kkk.length==3){
					if(kkk[0].val==kkk[1].val+1&&kkk[1].val==kkk[2].val+1){
						return ResultType={result:true,Explain:'三顺',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
			}

			if(array.length==10){
				console.log('array.length==10');
				arrary=new Array();
				for(var mon=0;mon<array.length;mon++){
					if(array[mon].val!=14&&array[mon].val!=15){
						for(var poo=mon+1;poo<array.length;poo++){
							if(array[mon].val==array[poo].val){
								arrary.push(array[mon]);
							}
						}
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(arrary.length==8){
					console.log('arrary.length==8')
					if(arrary[0].val==1&&arrary[0].val==arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[2].val+12==arrary[3].val&&arrary[3].val==arrary[4].val&&arrary[4].cal==arrary[5].val){
						//console.log('wozaizhe ')
						if(arrary[6].val!=arrary[7].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}else if(arrary[0].val==arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[2].val==arrary[3].val+1&&arrary[3].val==arrary[4].val&&arrary[4].val==arrary[5].val){
						if(arrary[5].val!=arrary[6].val&&arrary[6].val!=arrary[7].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else {
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}

					}else if(arrary[0].val!=arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[2].val==arrary[3].val&&arrary[3].val==arrary[4].val+1){
						//console.log('huozhezhe ')
						if(arrary[4].val==arrary[5].val&&arrary[5].val==arrary[6].val&&arrary[6].val!=arrary[7].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[2].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}else if(arrary[0].val!=arrary[1].val&&arrary[1].val!=arrary[2].val&&arrary[2].val==arrary[3].val&&arrary[3].val==arrary[4].val&&arrary[4].val==arrary[5].val+1){
						if(arrary[5].val==arrary[6].val&&arrary[6].val==arrary[7].val){
							return ResultType={result:true,_carcd:array,Explain:'飞机',max:array[2].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
				}

				var Gtr=[];
				var noob=[];
				for(var tan=0;tan<array.length-1;tan++){
					if(array[tan].val==array[tan+1].val){
						Gtr.push(array[tan]);
					}
					if(tan>=1&&array[tan].val==array[tan+1].val+1){
						noob.push(array[tan]);
					}
				}


				if(2<array[0].val<=13){
					//连对
					if(Gtr.length==5&&Gtr[0].val==Gtr[1].val+1 && Gtr[1].val==Gtr[2].val+1 &&Gtr[2].val==Gtr[3].val+1 && Gtr[3].val==Gtr[4].val+1){
						return ResultType={result:true,Explain:'连对',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
					if(noob.length==8){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
				if(array[0].val==1){
					if(noob[0].val==noob[noob.length-1].val+8){
						return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
			}
			if(array.length==11){
				arrary=new Array()
				console.log('array.length==11');
				if(array[0].val==1){
					for(var xv=1;xv<array.length;xv++){
						if(xv+1<array.length){
							if(array[xv].val==array[xv+1].val){
								arrary.push(array[xv]);
							}
						}
					}

					if(arrary.length==10){
						if(arrary[0].val==13&&arrary[arrary.length-1].val==3){
							return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
				}else{
					for(var xv=0;xv<array.length;xv++){
						if(array[0].val==array[1].val+1){
							arrary.push(array[xv]);
						}
					}
					if(arrary.length==11){
						console.log('xxxxx')
						console.log(arrary)
						if(arrary[0].val==arrary[1].val+1&&arrary[0].val==arrary[10].val+10&&arrary[1].val==arrary[9].val+8&&arrary[2].val==arrary[8].val+6){
							
							if(arrary[3].val==arrary[7].val+4){
								console.log('lol')
								return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
							}
							else{
								return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
							}
						}else{
							console.log('xoox')
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
				}

				if(array[0].val==1&&array[0].val+12==array[1].val&&array[1].val==array[2].val+1&&array[2].val==array[3].val+1&&array[3].val==array[4].val+1&&array[4].val==array[5].val+1&&array[5].val==array[6].val+1){
					if(array[6].val==array[7].val+1&&array[7].val==array[9].val+2&&array[8].val==array[10].val+2&&array[9].val==array[10].val+1){
							return ResultType={result:true,Explain:'顺子',_carcd:array,max:array[0].val,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}		
						
				}
			}

			if(array.length==12){
				console.log('array.length==12');
				arrary=new Array();
				var kier=[];
				var alink=[].concat(array);
				for(var kill=0;kill<array.length;kill++){
					for(var li=kill+1;li<array.length;li++){
						if(array[kill].val==array[li].val){
							arrary.push(array[kill]);
						}
					}
				}

				for(var kills=0;kills<array.length;kills++){
					for(var liv=kills+1;liv<array.length;liv++){
						if(array[kills].val==array[liv].val){
							kier.push(array[kills]);
							//console.log(kier)
							array.splice(kills,1);
						}
					}
				}

					console.log(kier)
					//没有相同，可能是顺子1 13 12 11 10 9 8 7 6 5 4 3
					if(arrary.length==0){
						if(array[0].val+12==array[1].val&&array[1].val==array[10].val+9&&array[11].val==3&&array[2].val==array[9].val+7&&array[3].val==array[8].val+5&&array[4].val==array[7].val+3){
							return ResultType={result:true,Explain:'顺子',max:alink[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					} 
					if(kier.length==6){
						console.log('kier.length')
						//1 2 55 44
						if(kier[0].val!=kier[1].val&&kier[1].val!=kier[2].val&&kier[2].val==kier[3].val&&kier[4].val==kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[2].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						//5555 4444 22 11
						}else if(kier[0].val==kier[1].val&&kier[0]==kier[2].val+1&&kier[2].val==kier[3].val&&kier[3]!=kier[4].val&&kier[4].val!=kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						//115555444433
						}else if(kier[0].val!=kier[1].val&&kier[1].val==kier[2].val&&kier[2].val==kier[3].val+1&&kier[3].val==kier[4].val&&kier[4].val!=kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[1].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
							//888877775544
						}else if(kier[0].val==kier[1].val&&kier[1].val==kier[2].val+1&&kier[2].val==kier[3].val&&kier[3].val!=kier[4].val&&kier[4].val!=kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
							//888855554444
						}else if(kier[0].val==kier[1].val&&kier[1].val!=kier[2].val+1&&kier[2].val==kier[4].val+1&&kier[2].val==kier[3].val&&kier[4].val==kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[2].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
							//888877774444
						}else if(kier[0].val==kier[1].val&&kier[1].val==kier[2].val+1&&kier[2].val==kier[3].val&&kier[3]!=kier[4].val+1&&kier[4].val==kier[5].val){
							return ResultType={result:true,Explain:'飞机',max:kier[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							console.log('nimei6')
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}

					}

					if(arrary.length==6){
						console.log('arrary.length==6')
						if(arrary[0].val==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val==arrary[3].val+1&&arrary[3].val==arrary[4].val+1&&arrary[4].val==arrary[5].val+1){
							return ResultType={result:true,Explain:'连对',max:arrary[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
				

					if(arrary.length==12){
						console.log('nimei')
						if(arrary[0].val==arrary[3].val+1&&arrary[3].val==arrary[6].val+1&&arrary[6].val==arrary[9].val+1){
							console.log('进来了')
							if(arrary[0].val==arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[3].val==arrary[4].val&&arrary[6].val==arrary[8].val&&arrary[9].val==arrary[11].val){
								console.log('uuuuu')
								return ResultType={result:true,Explain:'三顺',max:arrary[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
							}else{
								return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
							}
						}else{
							console.log('nimei12')
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}

					if(kier.length==3){
						console.log('kier.length==3')
						if(kier[0].val==kier[1].val+1&&kier[1].val==kier[2].val+1){
							return ResultType={result:true,Explain:'三顺',max:kier[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
					//console.log(kier)
					if(kier.length==4){
						console.log('kier.length==4')
						if(kier[0].val==kier[1].val+1&&kier[1].val==kier[2].val+1 || kier[1].val==kier[2].val+1&&kier[2].val==kier[3].val+1){
							return ResultType={result:true,Explain:'三顺',max:kier[0].val,_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}
			}

			if(array.length==15){
				console.log('array.length==15')
				arrary=new Array();
				var del=[].concat(array);
				for(var end=0;end<del.length;end++){
					for(var ins=end+1;ins<del.length;ins++){
						if(del[end].val==del[ins].val){
							arrary.push(del[end]);
							del.splice(end,1);
						}
					}
				}
				//待续判断
				if(arrary.length==5){
					if(arrary[0].val==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val==arrary[3].val+1&&arrary[3].val==arrary[4].val+1){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}

				if(arrary.length==6){
					if(arrary[0].val!=arrary[1].val&&arrary[1].val!=arrary[2].val&&arrary[2].val!=arrary[3].val&&arrary[3].val==arrary[4].val+1&&arrary[4].val==arrary[5].val+1){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(arrary[0].val==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val!=arrary[3].val&&arrary[3].val!=arrary[4].val&&arrary[4].val!=arrary[5].val){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(arrary[0].val==arrary[1].val&&arrary[1].val!=arrary[2].val&&arrary[2].val!=arrary[3].val&&arrary[3].val==arrary[4].val+1&&arrary[4].val==arrary[5].val+1){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(arrary[0].val!=arrary[1].val&&arrary[1].val==arrary[2].val&&arrary[2].val!=arrary[3].val&&arrary[3].val==arrary[4].val+1&&arrary[4].val==arrary[5].val+1){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(arrary[0].val==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val!=arrary[3].val&&arrary[3].val!=arrary[4].val&&arrary[4].val==arrary[5].val){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else if(arrary[0].val==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val!=arrary[3].val&&arrary[3].val==arrary[4].val&&arrary[4].val!=arrary[5].val){
						return ResultType={result:true,Explain:'飞机',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};

					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}
			}

			if(array.length==16){
				console.log('array.length==16')
				arrary=new Array();
				var Hub=[].concat(array);
				for(var g=0;g<Hub.length;g++){
					for(var h=g+1;h<Hub.length;h++){
						if(Hub[g].val==Hub[h].val){
							arrary.push(Hub[g])
							Hub.splice(g,1);
						}
						
					}
				}
				console.log(arrary)
				// if(arrary[0].val!=1||arrary[0].val!=2||arrary[0].type!=5){
					if(arrary.length==8){
						console.log('array==16 arrary==8');
						if(arrary[0].val==arrary[7].val+7&&arrary[1].val==arrary[6].val+5&&arrary[2].val==arrary[5].val+3&&arrary[3].val==arrary[4].val+1){
							return ResultType={result:true,Explain:'连对',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				// }else{
				// 	return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
				// }

			}

			if(array.length==18){
				console.log('array.length==18')
				var arrary=new Array();
				var lele=[].concat(array);
				for(var end=0;end<lele.length;end++){
					for(var ins=end+1;ins<lele.length;ins++){
						if(lele[end].val==lele[ins].val){
							arrary.push(lele[end]);
							del.splice(end,1);
						}
					}
				}

				
					if(arrary.length==8){
						console.log('array==16 arrary==8');
						if(arrary[0].val==arrary[7].val+7&&arrary[1].val==arrary[6].val+5&&arrary[2].val==arrary[5].val+3&&arrary[3].val==arrary[4].val+1){
							return ResultType={result:true,Explain:'连对',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}else{
							return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
						}
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				

			}

			if(array.length==20){
				console.log('array.length==20')
				var arrary=new Array();
				var lele=[].concat(array);
				for(var end=0;end<lele.length;end++){
					for(var ins=end+1;ins<lele.length;ins++){
						if(lele[end].val==lele[ins].val){
							arrary.push(lele[end]);
							del.splice(end,1);
						}cf6
					}
				}

				if(array[0].type==5){
					return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
				}else if(arrary.length==5){
					if(arrary[0].arrary==arrary[1].val+1&&arrary[1].val==arrary[2].val+1&&arrary[2].val==arrary[3].val+1&&arrary[3].val==arrary[4].val+1){
						return ResultType={result:true,Explain:'三顺',max:arrary[0].val,_carcd:array,_userId:userId,_tableId:tableId,_seatId:seatId};
					}else{
						return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
					}
				}else{
					return ResultType={result:false,Explain:'不符合',_carcd:alink,_userId:userId,_tableId:tableId,_seatId:seatId};
				}
			}
			console.timeEnd('算牌时间');
		}

		
		//抢地主2 qiang++
		this.plusq=function(tableId,seatId,qiang,Id){
			
			var arra=new Array();
			//this.tableList[tableId][seatId].king++;
			if(this.bold[tableId].length<6){
				if(this.tableList[tableId][seatId]&&this.tableList[tableId][seatId].userId==Id){
					if(qiang==0){
						log.info('第--'+tableId+'--桌'+'用户'+Id+"不抢")
						this.tableList[tableId][seatId].qiang=this.tableList[tableId][seatId].qiang+qiang;
						this.bold[tableId].push(this.tableList[tableId][seatId]);
						this.bold[tableId][this.bold[tableId].length-1].seatId=seatId;
						this.tableList[tableId][seatId].pgup=this.tableList[tableId][seatId].pgup+1
					}
					if(qiang==1){
							log.info('第--'+tableId+'--桌'+'用户'+Id+"抢")
							this.tableList[tableId][seatId].qiang=this.tableList[tableId][seatId].qiang+qiang;
							this.bold[tableId].push(this.tableList[tableId][seatId]);
							this.bold[tableId][this.bold[tableId].length-1].seatId=seatId;
							this.tableList[tableId][seatId].pgup=this.tableList[tableId][seatId].pgup+1
							//console.log(this.bold[tableId])
							this.landouble[tableId]=this.landouble[tableId]+2;
							console.log('第--'+tableId+'--桌'+'叫地主的倍数增加:'+this.landouble[tableId]);
							//this._io.sockets.in(roomid).emit('Landlord',{userId:this.tableList[tableId][seatId].userId,Explain:'叫地主',second:this.tableList[tableId][seatId].Rob_landlords});
						
					}
				}
				//console.log(this.bold[tableId])
				var arrb=new Array();
				//禁止重复叫
					for(var f=0;f<this.bold[tableId].length;f++){
						if(f+1<this.bold[tableId].length-1){
							if(this.bold[tableId][f].userId==this.bold[tableId][f+1].userId){
								this.bold[tableId].splice(f+1,1);
							}	
						}
					}

				var user=this.tableList[tableId][seatId];
				var _user=this.tableList[tableId][seatId+1];
				if(this.bold[tableId].length<=2){
					console.log('-----length<=2-------266')
					var roomid="table"+tableId;
				
					if(this.bold[tableId].length==1){
						console.log(color.red.bgWhite(seatId))
						if(seatId==0){
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'叫地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不叫'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}
							
						}else if(seatId==1){
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'叫地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不叫'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});	
							}
						}else if(seatId==2){
							// _user=this.tableList[tableId][0];
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'叫地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:this.tableList[tableId][0].userId,second:this.tableList[tableId][0].Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不叫'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:this.tableList[tableId][0].userId,second:this.tableList[tableId][0].Rob_landlords});
							}
						}
						if(seatId!=2){
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][seatId+1].Bomb=15;
							this.Ntime[tableId]=15;
						}else{
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][0].Bomb=15;
							this.Ntime[tableId]=15;
						}
					}else if(this.bold[tableId].length==2){
						//顺序叫地主
						console.log(color.red.bgWhite('我在第二次抢地主'))
						if(seatId==0){
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}
						}else if(seatId==1){
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}
						}else if(seatId==2){
							_user=this.tableList[tableId][0];
							if(this.tableList[tableId][seatId].qiang==1){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:_user.userId,second:_user.Rob_landlords});
							}
						}

						if(seatId!=2){
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][seatId+1].Bomb=15;
							this.Ntime[tableId]=15;
						}else{
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][0].Bomb=15;
							this.Ntime[tableId]=15;
						}

					}	
				}

				if(this.bold[tableId].length==3){
					var roomid="table"+tableId;
					var send=this.tableList[tableId][seatId].Rob_landlords;
					console.log('-----length==3-------')
					for(var r=0;r<this.bold[tableId].length;r++){
						if(this.bold[tableId][r].qiang==0){
							arra.push(this.bold[tableId][r]);
						}else if(this.bold[tableId][r].qiang>=1){
							arrb.push(this.bold[tableId][r]);
						}
					}
						//console.log(this.bold[tableId])
						if(arra.length==3){
							//var This=this;
							this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
							this._io.sockets.in(roomid).emit('Landlord',{result:-1,Explain:'重新发牌'})//重新发牌
							this.bold[tableId]=[];
							this.Ntime[tableId]=16;

							if(this.Home[tableId]==2){
								//两次重新洗牌之后随机地主
								var mine=Math.floor(Math.random()*3);
								this.tableList[tableId][mine].Sss=1;
								this._io.sockets.in(roomid).emit('Landlord_Poker',{result:1,userId:this.tableList[tableId][mine].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]})
								this.sortcarcd(tableId,mine);
								this.seatIdTime[tableId]=mine;
								this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:this.tableList[tableId][mine].userId,second:this.PgUp});
							}else{
								console.log('给我加加')
								this.Home[tableId]++;
								this.tableList[tableId][seatId].Bomb=0;

								for(var i=0;i<this.people[tableId].length;i++){
									this.people[tableId][i].ready=0;
								}
								this.double[tableId]=1;
								this.landouble[tableId]=0;
							}
							
							return;

						}else if(arra.length==2){
							console.log("arra==2")
							//console.log(arrb);
						//	console.log(this.bold[tableId])
							if(this.bold[tableId][2].userId==arra[1].userId){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord_Poker',{result:1,userId:arrb[0].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});//地主
								this.tableList[tableId][arrb[0].seatId].Sss=1;
								this.seatIdTime[tableId]=arrb[0].seatId;
								
								this.double[tableId]=this.double[tableId]*this.landouble[tableId]
								//this.landouble[tableId]=0;
								this.sortcarcd(tableId,arrb[0].seatId)
								this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:arrb[0].userId,second:this.PgUp});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord_Poker',{result:1,userId:arrb[0].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});//地主
								this.tableList[tableId][seatId].Sss=1;
								this.seatIdTime[tableId]=seatId;
								
								this.double[tableId]=this.double[tableId]*this.landouble[tableId]
								//this.landouble[tableId]=0;
								this.sortcarcd(tableId,arrb[0].seatId)
								this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:arrb[0].userId,second:this.PgUp});
							}
						//取消定时
						this.tableList[tableId][seatId].Bomb=0;
						this.Ntime[tableId]=16;	

						}else if(arra.length==1){
							console.log("arra==1");
							if(this.bold[tableId][2].userId==arra[0].userId){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:arrb[0].userId,second:send});
							}else{
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:arrb[0].userId,second:send});
							}
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][arrb[0].seatId].Bomb=15;
							this.Ntime[tableId]=15;	
						}else if(arrb.length==3){
							console.log("arrb==3");	
							this._io.sockets.in(roomid).emit('CCTV',{userId:this.tableList[tableId][seatId].userId,Explain:'抢地主'});
							this._io.sockets.in(roomid).emit('Landlord',{userId:arrb[0].userId,second:send});//到第一个人叫
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][arrb[0].seatId].Bomb=15;
							this.Ntime[tableId]=15;	
						}else if(arrb.length==2){
							console.log("arrb==2");
							if(this.bold[tableId][2].userId!=arrb[1].userId){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'抢地主'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:arrb[0].userId,second:send});//到第一个叫地主的人
							}else if(this.bold[tableId][2].userId==arrb[1].userId){
								this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
								this._io.sockets.in(roomid).emit('Landlord',{userId:arrb[0].userId,second:send});
							}
							this.tableList[tableId][seatId].Bomb=0;
							this.tableList[tableId][arrb[0].seatId].Bomb=15;
							this.Ntime[tableId]=15;	
						}else if(arrb.length==1){
							console.log("arrb==1");
							this._io.sockets.in(roomid).emit('CCTV',{userId:arrb[0].userId,Explain:'抢地主'});
							this._io.sockets.in(roomid).emit('Landlord_Poker',{result:1,userId:arrb[0].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]}); //地主
							this.tableList[tableId][arrb[0].seatId].Sss=1;
							this.seatIdTime[tableId]=seatId;
							
							this.double[tableId]=this.double[tableId]*this.landouble[tableId]
							this.sortcarcd(tableId,arrb[0].seatId)
							//this.landouble[tableId]=0;
							this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:arrb[0].userId,second:this.PgUp});
							this.tableList[tableId][seatId].Bomb=0;
							this.Ntime[tableId]=16;
						}

				}

				if(this.bold[tableId].length==4){
					var roomid="table"+tableId;
					aaa=[];
					bbb=[];
					console.log('-----length==4-------')
					for(var logS=0;logS<this.bold[tableId].length;logS++){
						if(this.bold[tableId][logS].qiang==0){
							aaa.push(this.bold[tableId][logS]);
						}else if(this.bold[tableId][logS].qiang>=1){
							bbb.push(this.bold[tableId][logS]);
						}
					}
					//console.log(bbb);
					var send=this.tableList[tableId][seatId].Rob_landlords;
					// for(var nn=0;nn<this.bold[tableId].length;nn++){
						if(this.bold[tableId][this.bold[tableId].length-1].qiang==1){
							console.log('qiang==1')
							console.log(user)
							if(bbb.length==3){
								console.log('qiang==1 4')
								if(seatId==2){
									console.log('1111');
									this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
									this._io.sockets.in("table"+tableId).emit('Landlord_Poker',{result:1,userId:bbb[1].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});
									this.tableList[tableId][0].Sss=1;
									this.seatIdTime[tableId]=0;
									
									this.double[tableId]=this.double[tableId]*this.landouble[tableId]
									//this.landouble[tableId]=0;
									this.sortcarcd(tableId,bbb[1].seatId)
									this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:bbb[1].userId,second:this.PgUp});
									this.tableList[tableId][bbb[1].seatId].Bomb=0;
									this.Ntime[tableId]=16;
								}else{
									console.log('55555')
									this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
									this._io.sockets.in("table"+tableId).emit('Landlord_Poker',{result:1,userId:bbb[1].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});
									this.tableList[tableId][seatId+1].Sss=1;
									this.seatIdTime[tableId]=bbb[1].seatId;
									
									this.double[tableId]=this.double[tableId]*this.landouble[tableId]
									//this.landouble[tableId]=0;
									this.sortcarcd(tableId,bbb[1].seatId)
									this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:bbb[1].userId,second:this.PgUp});
									this.tableList[tableId][bbb[1].seatId].Bomb=0;
									this.Ntime[tableId]=16;
								}
							}else if(bbb.length==4){
								console.log('全部都叫地主')
								if(seatId==2){
									this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
									this._io.sockets.in("table"+tableId).emit('Landlord_Poker',{result:1,userId:bbb[1].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});
									this.tableList[tableId][0].Sss=1;
									this.double[tableId]=this.double[tableId]*this.landouble[tableId]
									this.seatIdTime[tableId]=bbb[1].seatId;
									
									this.sortcarcd(tableId,bbb[1].seatId)
									this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:bbb[1].userId,second:this.PgUp});
									this.tableList[tableId][bbb[1].seatId].Bomb=0;
									this.Ntime[tableId]=16;
								}else{
									this._io.sockets.in(roomid).emit('CCTV',{userId:user.userId,Explain:'不抢'});
									this._io.sockets.in("table"+tableId).emit('Landlord_Poker',{result:1,userId:bbb[1].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});
									this.tableList[tableId][seatId+1].Sss=1;
									this.double[tableId]=this.double[tableId]*this.landouble[tableId]
									this.seatIdTime[tableId]=bbb[1].seatId;
									
									this.sortcarcd(tableId,bbb[1].seatId)
									this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:bbb[1].userId,second:this.PgUp});
									this.tableList[tableId][bbb[1].seatId].Bomb=0;
									this.Ntime[tableId]=16;
								}
							}		
								
							
						}else if(this.bold[tableId][this.bold[tableId].length-1].qiang==2){
							console.log('qiang==2 4')
							console.log('z')

							this._io.sockets.in(roomid).emit('CCTV',{userId:bbb[0].userId,Explain:'抢地主'});
							this._io.sockets.in('table'+tableId).emit('Landlord_Poker',{result:1,userId:bbb[0].userId,carcd:this.carcdList[tableId][3],double:this.double[tableId]*this.landouble[tableId]});
							this.tableList[tableId][bbb[0].seatId].Sss=1;
							this.seatIdTime[tableId]=bbb[0].seatId;
							
							this.sortcarcd(tableId,bbb[0].seatId)
							this.double[tableId]=this.double[tableId]*this.landouble[tableId]
							//this.landouble[tableId]=0;
							this._io.sockets.in("table"+tableId).emit('ListenCarcd',{userId:bbb[0].userId,second:this.PgUp});
							this.tableList[tableId][bbb[0].seatId].Bomb=0;
							this.Ntime[tableId]=16;
					}
				}	
				
			}
			// console.log(this.timex[tableId])
		}
		//牌的牌型排列
		this.sortcarcd=function(tableId,seatId){
			for(var i=0;i<this.carcdList[tableId][3].length;i++){
				this.carcdList[tableId][seatId].push(this.carcdList[tableId][3][i])
			}
			console.log(this.tableList[tableId][seatId].userId,this.carcdList[tableId][seatId]);
		}
		//储存修改信息

		this.Simple_sorting=function(tableId,seatId){
			var array=this.carcdList[tableId][seatId]

			for(var i=0;i<array.length-1;i++){
				if(array[i].val==1){
					array[i].val=13.5;
				}else if(array[i].val==2){
					array[i].val=13.6;
				}
			}

			for(var y=0;y<array.length-1;y++){
				for(var q=y+1;q<array.length-1;q++){
					if(array[y].val>array[q].val){
						var temp=array[y]
						array[y]=array[q]
						array[q]=temp;
					}
				}
			}

			for(var i=0;i<array.length-1;i++){
				if(array[i].val==13.5){
					array[i].val=1;
				}else if(array[i].val==13.6){
					array[i].val=2;
				}
			}
			//console.log(array)
			return array;
		}

		this.GameBalance = function(userItem,userWin){
			//判断玩家是否在线
			if (this.userList[userItem]){
				var youScore = this.userList[userItem].getScore();
				this.userList[userItem].winscore(userWin);
				var youNowScore = this.userList[userItem].getScore();
				//记录金钱变化量
				var userInfolog = {userid:userItem,score_before:youScore,score_change:userWin,score_current:youNowScore,change_type:gameConfig.logflag,isOnline:true};
				this.score_changeLogList.push(userInfolog);
				//this.userList[userItem]._socket.emit("winResult",{winCoin:cunWin,remainCoin:youNowScore});
			}else{
				this._Csocket.emit("GameBalance",{signCode:gameConfig.LoginServeSign,sendUserId:userItem,sendCoin:userWin,change_type:gameConfig.logflag})
			}
		}

		this.sendCoin = function(tableId){
			if (this.isSendCoin[tableId]){
				this.isSendCoin[tableId] = false;

				var tablestring  = "table" + tableId;
				this.initTable(tableId);
				//把桌子状态设置为准备
				var tableObj = this.tableList[tableId];

				tableObj[gameConfig.seatMax].play = 0;
				log.info("*******************");
				//清除掉线
				this.cleanLineOutByTable(tableId);
				
			}
		}	
		//发送桌子信息
		this.getsocket=function(tableId){
			console.log('*********获取桌子其他人的信息***********');
			console.log(tableId);
			if(tableId==null||tableId==undefined){
				console.log('机器人');
			}else{
				
				//console.log(this.people[tableId.tableId])
				this.userList[tableId.playerId]._socket.emit('Hudshow',{reslut:1,data:this.people[tableId.tableId]});
				
			}
		}
		

		this.setIo = function(_io,_Csocket){
			this.sever.setIo(_io,_Csocket);
			this._io = _io;
			this._Csocket = _Csocket;
		}

		



		//判断是否是同一scoket连续登录，不允许
		this.isLoginAgain = function(socket){
			if (socket.userId){
				return this.userList[socket.userId].Islogin();
			}
			else{
				return false;
			}
		}

		//添加用户
		this.addUser = function(_userInfo,socket){
			// console.log(_userInfo);
			//console.log("=======+++++++++========");
			this.userList[_userInfo.userid] = new User(_userInfo,socket);
			// console.log("addUser");
			// console.log(this.userList[_userInfo.userid]);
		}

		this.updateUser = function(userInfo){
			if (!this.userList[userInfo._userId]) return;
			// userInfo.roomTial=-1;
			log.info("登录服务器传来userId:" + userInfo._userId + " score:" + userInfo._score+userInfo.roomTial);
			this.userList[userInfo._userId].update(userInfo);
			log.info("更新后userId:" + this.userList[userInfo._userId]._userId + " score:" + this.userList[userInfo._userId]._score);
			
			this.LoginGame(userInfo._userId,this.serverId);
			++this.onlinePlayerCount;

			var self = this;
			
			var socketItem = this.userList[userInfo._userId]._socket;
			var resultObj = {account:this.userList[userInfo._userId]._account,id:this.userList[userInfo._userId]._userId,nickname:this.userList[userInfo._userId]._nickname,score:this.userList[userInfo._userId]._score};
			result = {resultid:1,msg:'login '+gameConfig.gameName+' succeed!',Obj:resultObj};
			socketItem.emit('loginGameResult',result);

		}

		this.ready = function(_socket) {
			if (!this.userList[_socket.userId]){
				log.err("用户" + _socket.userId + "不存在");
				_socket.emit("readyResult", {ResultCode:1,msg:"errcode:ready1,请重新进入游戏"});
				return;
			}

			if (this.userList[_socket.userId].tableId < 0){
				log.err(_socket.userId + "用户没有进入桌子,进行准备");
				_socket.emit("readyResult", {ResultCode:2,msg:"errcode:ready2,请重新进入游戏"});
				return;
			}

			//当前桌子在游戏中,无需准备
			//给桌子添加数据
			var tableId = this.userList[_socket.userId].getTable();
			var seatId = this.userList[_socket.userId].getSeat();
			var tableObj = this.tableList[tableId];
			if (this.sever.state[tableId] != gameConfig.gameState.noting){
				log.warn(_socket.userId + '现在等待时间');
				_socket.emit("readyResult", {ResultCode:4,msg:"不在等待时间,进行了准备按钮!"});
				return;
			}

			log.info(_socket.userId + "准备");
		}

		this.AutoReady = function(_userId) {
			// if (!this.userList[_userId]){
			// 	log.err("自动准备用户" + _userId + "不存在");
			// 	return;
			// }

			// if (this.userList[_userId].tableId < 0){
			// 	log.err(_userId + "自动准备用户没有进入桌子,进行准备");
			// 	return;
			// }
			//log.info("自动准备660" + _userId);
			//当前桌子在游戏中,无需准备
			//给桌子添加数据
			var tableId = this.userList[_userId].getTable();//获得桌子ID
			var seatId = this.userList[_userId].getSeat();//获得座位的ID
			var tableObj = this.tableList[tableId];
			var url = "";
			if (this.userList[_userId]._headimgurl){
				url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);
			}
			//seatState状态 ready=1准备 -1不准备 rob——landlords抢地主 double加倍 afford要得起 not_up要不起 king王炸 炸弹要不起//没加url
			var userInfo = {userId:_userId,seatState:1,Multiple:15,qiang:0,Rob_landlords:15,pgup:-1,double:15,Water:0,line:0,Afford:0,king:0,Bomb:0,Sss:0,score:this.userList[_userId]._score,nickname:this.userList[_userId]._nickname};
			this.tableList[tableId][seatId] = userInfo;
		}

		//获得人数,如果人数等于3
		this.checkReady = function(_tableId){
			//console.log(_tableId)
			var tableObj = this.tableList[_tableId];
			
			//console.log("我进来了checkReady")
			
			
			if (!tableObj[gameConfig.seatMax] || tableObj[gameConfig.seatMax].play == 0){
				var playerList = this.sever.getTablePlayers(_tableId);
				//log.info("playerList")
				//log.info(this.userList[2].roomTial);
				var onlineP = 0;

				//console.log(this.userList[playerList[i]])
				for(var i = 0 ; i < playerList.length; ++i){
					if (this.userList[playerList[i]]){
						//console.log('======++++++')
						++onlineP;
					}
				}

				
				
				if (onlineP == 3){
					//把桌子上的所有人状态设置
					log.info("够人" + onlineP)

					log.info(playerList.length)

					for(var i = 0 ; i < playerList.length; ++i){
						
							this.AutoReady(playerList[i]);
					}
				}else{
					//this.sever.stop(_tableId);
				}
			}
		}

	

		//获得在线人数
		this.getOnlinePlayerCount = function(){
			return this.onlinePlayerCount;
		}

		//在线所有人
		this.getOnlinePlayer = function(){
			return this.userList;
		}

		this.score_changeLog = function(){
			var self = this;
			var saveListTemp = [];
			var ItemTemp;
			var max = 0;
			if (this.score_changeLogList.length > 200){
				max = 200;
			}else{
				max = this.score_changeLogList.length;
			}
			for (var i = 0 ;i < max ; i++){
				if (this.score_changeLogList.length > 0){
					ItemTemp = this.score_changeLogList.shift();
					saveListTemp.push(ItemTemp);
				}
			}
			if (saveListTemp.length > 0){
				this._Csocket.emit("score_changeLog",saveListTemp);
				//LoginGameDao.score_changeLog(saveListTemp);
			}
		}


		//删除用户
		this.deleteUser = function(_socket){
			//console.log(_socket)
			//console.log('离开房间deleteUser')
			if (_socket.userId && this.userList[_socket.userId]){
				var tableId = this.userList[_socket.userId].getTable();
				if (tableId >= 0){
					//console.log('222222222222')
					//判断自己是否在游戏当中
					var tableObj = this.tableList[tableId];
					var onlineP = false;
					for(var i = 0 ; i < tableObj.length - 1; ++i){
						if (tableObj[i] && tableObj[i].seatState == 1){
							//console.log('老子打完了啊')
							//console.log(tableObj[i])
							if (tableObj[i].userId == _socket.userId){
								if(tableObj[i] && tableObj[i].Water==1){
									onlineP = true;
									break;
								}else{
									onlineP = false;
								}
								
								
							}
						}
					}
					if (onlineP==true){
						//console.log('333333333333333')
						//当前局有下注
						this.sever.lineOut(this.userList[_socket.userId],_socket);
						//通知登录服务器
						//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:1,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableId,seatId:this.userList[_socket.userId].getSeat()})
						this.lineOutSet({state:1,userId:_socket.userId,tableId:this.userList[_socket.userId].getTable(),seatId:this.userList[_socket.userId].getSeat()});
						log.info("用户" + this.userList[_socket.userId]._userId + "断线");
						if(this.tableList[tableId][this.userList[_socket.userId].SeatId].Water==1){

							this.tableList[tableId][this.userList[_socket.userId].SeatId].line=-1;
						}

						for(var x=0;x<this.people[tableId].length;x++){
							if(this.tableList[tableId][this.userList[_socket.userId].SeatId].userId==this.people[tableId][x].userId){
								this.people[tableId][x].ready=8;
							}
						}
						//console.log(this.tableList[tableId][this.userList[_socket.userId].SeatId])
						//console.log(this.tableList[tableId][this.userList[_socket.userId].SeatId].line);
						//this.bold[this.userList[_socket.userId].TableId].splice(0,this.bold[this.userList[_socket.userId].TableId].length);
						//log.info("断线清空抢地主数组")
						//console.log(this.bold[this.userList[_socket.userId].TableId])
						delete this.userList[_socket.userId];
					}else{
						var tableId = this.userList[_socket.userId].getTable();
					 	//发送信息给其他人
						var tablestring  = "table" + tableId;
					 	_socket.broadcast.to(tablestring).emit('PlayerOut', {PlayerSeatId:this.userList[_socket.userId].getSeat(),userId:_socket.userId});
					 	//console.log('===============================')
					 	console.log(this.people[tableId])
					 	for(var Rr=0;Rr<this.people[tableId].length;Rr++){
					 		if(this.people[tableId][Rr].userId==this.userList[_socket.userId]._userId){
					 			this.people[tableId].splice(Rr,1);
					 		}
					 	}
					 	//this.people[this.userList[_socket.userId].TableId].splice(this.userList[_socket.userId].SeatId,1);
					 	//log.info('用户'+this.people[this.userList[_socket.userId].TableId][this.userList[_socket.userId].SeatId].userId+'离开了This.people')
					 	console.log('=================分割线===================')
					 	console.log(this.people[tableId]);
					 	this.bold[this.userList[_socket.userId].TableId].splice(0,this.bold[this.userList[_socket.userId].TableId].length);
					 	this.tableList[tableId][this.userList[_socket.userId].SeatId]=[];
					 	this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,serverId:gameConfig.serverId,userId:_socket.userId,tableId:tableId,seatId:this.userList[_socket.userId].getSeat()})
						log.info("用户离开!userid:" + this.userList[_socket.userId]._userId
							+ " Account:" + this.userList[_socket.userId]._account
							+ " score:" + this.userList[_socket.userId]._score);
						this.sever.LogoutRoom(this.userList[_socket.userId],_socket);
						delete this.userList[_socket.userId];
						--this.onlinePlayerCount;
					}
				}else{
					log.info("用户没有登录桌子离开!:" + this.userList[_socket.userId]._userId);
					delete this.userList[_socket.userId];
					--this.onlinePlayerCount;
				}
			}
		}

		//删除用户
		this.deleteUserById = function(_userId,msg){
			if (_userId){
				var socketItem = this.userList[_userId]._socket;
				result = {resultid:0,msg:msg};
				socketItem.emit('loginGameResult',result);
				socketItem.userId = null;
				delete this.userList[_userId];
			}
		}

		//获得用户当前分数
		this.getUserscore = function(_userId){
			if (_userId){

				return this.userList[_userId]._score;
			}
		}

		//获得用户
		this.getUser = function(_userId){
			if (_userId){
				// console.log("getUser")
				// console.log(this.userList)
				return this.userList[_userId];
			}
		}

		//用户是否在线
		this.IsPlayerOnline = function(_userId){
			if (!_userId){	//传输ID错误
				log.info("查询在线,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//log.info("查询在线,未找到" + _userId + "用户");
				return 1;
			}else{
				return 0;
			}
		}

		//获得用户当前分数
		this.getPlayerScore = function(_userId){
			if (!_userId){	//传输ID错误
				log.info("查询分数,参数错误");
				return -1;
			} 	
			if (this.userList[_userId]) {//未找到用户
				//log.info("查询在线,未找到" + _userId + "用户");
				return this.userList[_userId].getScore();
			}else{
				return -1;
			}
		}

		//GM加分
		this.addgold = function(_userId,score){
			if (!_userId){					//传输ID错误
				log.info("加分,未登录")
				return 0;
			} 	
			if (!this.userList[_userId]) {	//未找到用户
				log.info("加分,未登录")
				return 0
			}else{
				log.info(score)
				if (this.userList[_userId].addgold(score)){
					log.info(this.userList[_userId].getScore())
					log.info("加分成功!")
					var tablestring = "table" + this.userList[_userId].getTable();
					this._io.sockets.in(tablestring).emit('addgoldResult',{userId:_userId,userSeatId:this.userList[_userId].getSeat(),userScore:this.userList[_userId]._score})
					return 1;
				}else{
					log.info("减分失败,大于用户分数!");
					return 0;
				}
			}
		}


		//进入游戏
		this.LoginGame = function(_userId,gametype){
			if (!this.userList[_userId]) return;
			this.userList[_userId].loginGame(gametype);
		}


		//是否允许进入游戏
		this.ApplyLogin = function(_socket,_userId){
			//发奖时间,并自己参与了下注***
			var linemsg = this.getLineOutMsg(_userId);
			if (!this.sever.ApplyLogin() && linemsg.Result){
				_socket.emit("LoginRoomResult",{ResultCode:0,msg:"正在发奖,稍后进入!"})
				return false;
			}else{
				return true;
			}
		}

		//进入房间
		this.LoginRoom = function(_userId,roomid,_socket){

			if (!this.userList[_userId]) return;
			log.info(_userId+"====进入房间====");
			if (!this.userList[_userId].getGameId()){
				log.info("用户" + _userId + ",没有进入任何游戏,进入房间");
				return;
			}

			if(this.userList[_userId].getSeat() != -1){
				log.info("用户" + _userId + "已经有座位");
				return;
			}
				
			this.userList[_userId].loginRoom(roomid);
			var LoginResult;
			var linemsg = this.getLineOutMsg(_userId);
			if (linemsg.Result){
				log.info("断线重连接table:" + linemsg.tableId +" seatid:" + linemsg.seatId);
				this.tableList[linemsg.tableId][linemsg.seatId].line=-1;
				//重新把socket
				LoginResult = this.sever.LoginRoombyLineOut(this.getUser(_userId),_socket,linemsg.tableId,linemsg.seatId);
				this.lineOutSet({state:0,userId:_userId});
				var ResultData = {tableId:LoginResult.tableId,seatId:LoginResult.seatId}
				_socket.emit("LoginRoomResult", {ResultCode:1,ResultData:ResultData});
				console.log(this.tableList[LoginResult.tableId][LoginResult.seatId])
			}else{
				LoginResult = this.sever.LoginRoom(this.getUser(_userId),_socket);
				//进入房间后，帮分配座位
				//发送场景消息
				//检查自己下注情况,效准玩家金额
				var addgold = 0;
				//进入房间自动准备
				this.checkReady(LoginResult.tableId);
				//说明玩家所在的桌子，座位是多少
				var ResultData = {tableId:LoginResult.tableId,seatId:LoginResult.seatId}
				_socket.emit("LoginRoomResult", {ResultCode:1,ResultData:ResultData});
				//如果没有断线
				if (!linemsg.Result){
					var tablestring  = "table" + LoginResult.tableId;
					var url = 0;
					if (this.userList[_userId]._headimgurl){
						url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[_userId]._headimgurl);	
					}
					
					_socket.broadcast.to(tablestring).emit('playEnter', {ResultCode:1,ResultData:{userId:_userId,tableId:LoginResult.tableId,seatId:LoginResult.seatId,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score,headimgurl:url,userType:this.userList[_userId]._Robot}});
				}
			}
			// console.log(this.people[LoginResult.tableId][LoginResult.seatId].seatId)
			if(this.people[LoginResult.tableId]&&this.people[LoginResult.tableId][LoginResult.seatId]==undefined){
				this.people[LoginResult.tableId][LoginResult.seatId]={tableId:LoginResult.tableId,seatId:LoginResult.seatId,userId:_userId,ready:5,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score};
			}else{
				this.people[LoginResult.tableId].push({tableId:LoginResult.tableId,seatId:LoginResult.seatId,userId:_userId,ready:5,nickname:this.userList[_userId]._nickname,score:this.userList[_userId]._score});
			}
			//防止断线重连无限重复问题;
			for(var bill=0;bill<this.people[LoginResult.tableId].length;bill++){
				if(this.people[LoginResult.tableId].length>=2){
					for(var x=bill+1;x<this.people[LoginResult.tableId].length;x++){
						if(this.people[LoginResult.tableId][bill].userId==this.people[LoginResult.tableId][x].userId){
							this.people[LoginResult.tableId].splice(x,1);
						}
					}
				}
				
			}
			//console.log(color.yellow('重复再现，奇迹会再现吗'))
			//console.log(this.people[LoginResult.tableId]);

			log.info("登录进来桌子id:" + LoginResult.tableId);
			log.info("登录进来座位id:" + LoginResult.seatId);
		}

		this.getTableList = function(_userId,_socket){
			if (!this.userList[_userId]) return;

			
			if (!this.userList[_userId].getGameId()){
				log.info("用户" + _userId + ",没有进入任何游戏,进入房间");
				return;
			}

			var seatId = this.userList[_userId].getSeat()

			if(seatId == -1){
				log.info("用户" + _userId + "没有座位");
				return;
			}

			var tableId = this.userList[_userId].getTable()

			if(tableId == -1){
				log.info("用户" + _userId + "没有桌子");
				return;
			}

			var tableUserList = Array();

			for(var i = 0 ; i < this.sever.seatMax; i++){
				//除了自己以外
				if (this.sever.tableList[tableId][i] && this.sever.tableList[tableId][i] != _userId){
					var userItem = {};
					var userid = this.sever.tableList[tableId][i];
					
					if (this.userList[userid]){
						//先确定在线才能拿到相关信息
						userItem.userId = this.userList[userid].getUserId();
						userItem.seatId = this.userList[userid].getSeat();
						userItem.nickname = this.userList[userid]._nickname;
						userItem.score = this.userList[userid]._score;
						userItem.userType = this.userList[userid]._Robot;
						var url = 0;
						if (this.userList[userid]._headimgurl){
							url = "bosengame.com/weixin/Login/img.aspx?url=" + urlencode(this.userList[userid]._headimgurl);
						}
						userItem.headimgurl = url;
						tableUserList.push(userItem);
					}else{
						//在断线列表中
						log.info("在断线列表中");
						if (this.tableList[tableId][i]){
							//桌子有玩家ID
							log.info("桌子有玩家ID");
							//但桌子没有信息中没有玩家
							log.info(this.tableList[tableId][i]);
							userItem.userId = this.tableList[tableId][i].userId;
							userItem.seatId = i;
							userItem.nickname = this.tableList[tableId][i].nickname;
							userItem.score = this.tableList[tableId][i].score;
							userItem.userType = 0;
							userItem.headimgurl = this.tableList[tableId][i].url;
							tableUserList.push(userItem);
						}
					}
				}
			}

			_socket.emit("getTableListResult", {ResultCode:0,data:{tableList:tableUserList}});
		}
		

		this.Brokenline=function(tableId,seatId,userId){				
				var array;
				//console.log(this.tableList[tableId][seatId])
				log.info('判断'+userId+'是否为断线用户');
				var CK=0;
				var time;
				var mytime;
				var tab=this.people[tableId];
				var tabs=this.tableList[tableId]
				console.log(tabs[seatId]);
				var carcd=this.carcdList[tableId];
				if(this.carcdList[tableId][seatId] && this.tableList[tableId][seatId].userId==userId&&this.carcdList[tableId]!=null){
					//log.info(userId+'不是断线用户,不需要获取信息')
					if(this.tableList[tableId][seatId].line==-1){

						if(tabs[seatId].Water==0){
							this.tableList[tableId][seatId].Water=0;
							this.tableList[tableId][seatId].seatState=0;
							this.tableList[tableId][seatId].line=0;
							return;
						}
						for(var u=0;u<this.tableList[tableId].length-1;u++){
							if(this.tableList[tableId][u].Sss==2){
								CK=0;
								break;
							}else{
								CK=2;
							}
						}

						console.log(this.tableList[tableId]);
						if(CK==0){
							console.log('CK==0')
							if(seatId==0){
							//console.log(color.yellow('最后出牌'));
							//console.log(this.SevaCarcd[tableId][seatId])
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,seatId:seatId,carcd:this.SevaCarcd[tableId][seatId],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
								{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[1].Afford},
								{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[2].Afford}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}else if(seatId==1){
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
								{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[0].Afford},
								{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[2].Afford}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}else if(seatId==2){
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
								{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[1].Afford},
								{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[0].Afford}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}
							
						}else if(CK==2){
							console.log('CK==2')
							if(seatId==0){
							//console.log(color.yellow('最后出牌'));
							//console.log(this.SevaCarcd[tableId][seatId])
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,seatId:seatId,carcd:this.SevaCarcd[tableId][seatId],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[seatId].Bomb,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3],qiang:this.tableList[tableId][seatId].qiang},
								{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[1].Bomb,qiang:tabs[1].qiang,Pgup:tabs[1].pgup},
								{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[2].Bomb,qiang:tabs[2].qiang,Pgup:tabs[2].pgup}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}else if(seatId==1){
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[seatId].Bomb,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3],qiang:tabs[seatId].qiang,Pgup:tabs[seatId].pgup},
								{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[0].Bomb,qiang:tabs[0].qiang,Pgup:tabs[0].pgup},
								{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[2].Bomb,qiang:tabs[2].qiang,Pgup:tabs[2].pgup}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}else if(seatId==2){
								array=[
								{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[seatId].Bomb,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3],qiang:tabs[seatId].qiang,Pgup:tabs[seatId].pgup},
								{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[1].Bomb,qiang:tabs[1].qiang,Pgup:tabs[1].pgup},
								{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.Ntime[tableId],Mytime:tabs[0].Bomb,qiang:tabs[0].qiang,Pgup:tabs[0].pgup}]
								this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
							}

						}

						log.info(userId+'--是断线用户,拿取牌局信息中。。。');
						console.log(this.carcdList[tableId][seatId].length)
						// if(seatId==0){
						// 	//console.log(color.yellow('最后出牌'));
						// 	//console.log(this.SevaCarcd[tableId][seatId])
						// 	array=[
						// 	{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,seatId:seatId,carcd:this.SevaCarcd[tableId][seatId],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
						// 	{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[1].Afford},
						// 	{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[2].Afford}]
						// 	this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
						// }else if(seatId==1){
						// 	array=[
						// 	{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
						// 	{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[0].Afford},
						// 	{userId:tabs[2].userId,carcd_length:carcd[2].length,Landlord:tabs[2].Sss,seatId:2,carcd:this.SevaCarcd[tableId][2],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[2].Afford}]
						// 	this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
						// }else if(seatId==2){
						// 	array=[
						// 	{userId:tabs[seatId].userId,Landlord:tabs[seatId].Sss,carcd:this.SevaCarcd[tableId][seatId],seatId:seatId,DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[seatId].Afford,MyCarcd:this.carcdList[tableId][seatId],tong_yi_pai:this.carcdList[tableId][3]},
						// 	{userId:tabs[1].userId,carcd_length:carcd[1].length,Landlord:tabs[1].Sss,seatId:1,carcd:this.SevaCarcd[tableId][1],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[1].Afford},
						// 	{userId:tabs[0].userId,carcd_length:carcd[0].length,Landlord:tabs[0].Sss,seatId:0,carcd:this.SevaCarcd[tableId][0],DF:this.Theen,double:this.double[tableId],time:this.timex[tableId],Mytime:tabs[0].Afford}]
						// 	this.userList[userId]._socket.emit('regression',{result:true,HUD:array});
						// }
							// this.tableList[tableId][seatId].Water=0;
							// this.tableList[tableId][seatId].seatState=0;
							// this.tableList[tableId][seatId].line=0;
					}else{
						console.log(color.yellow.bgWhite('不是断线用户'));
						//this.tableList[tableId][seatId].line=0;
					}
				}else{
					console.log('不是断线')
					// this.userList[userId]._socket.emit('regression',{result:false});
				}
			
			
			
		}

		this.checkScore = function(tableId){
			//判断座位上的在线的人
			var playerList = this.sever.getTablePlayers(tableId);
			//log.info(playerList);
			for(var i = 0 ; i < playerList.length; ++i){
				//log.info()
				this.notEnouhtScore(playerList[i]);
			}
		}

		this.notEnouhtScore = function(_userId){
			if (!this.userList[_userId]){
				log.err("检查用户金币用户" + _userId + "不存在");
				return;
			}
			if (this.userList[_userId].getScore() < gameConfig.autoOut){
				this.userList[_userId]._socket.emit('notEnouhtScore');
				this.userList[_userId]._socket.disconnect();
			}
		}


		//断线保存
		this.lineOutSet = function(_info){
			if (_info.state == 1){
				//添加
				this.lineOutList[_info.userId] = {tableId:_info.tableId,seatId:_info.seatId}
				//log.info(this.lineOutList[_info.userId]);
			}else{
				//移除
				//this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:_info.userId})
				delete this.lineOutList[_info.userId];
			}
		}

		//获得断线用户信息
		this.getLineOutMsg = function(_userId){
			if (this.lineOutList[_userId]){
				this.lineOutList[_userId].Result = 1;
				return this.lineOutList[_userId];
			}else{
				return {Result:0};
			}
		}

		//清楚断线用户信息
		this.cleanLineOut = function(){
			//清理登录服务器
			//log.info(this.lineOutList)
			for(var Item in this.lineOutList){

				Item = parseInt(Item)
				var tableId = this.lineOutList[Item].tableId;
				var tablestring  = "table" + tableId;
                this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
				this.sever.cleanLineOut(tableId,this.lineOutList[Item].seatId)
				this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item})
			}
			this.lineOutList = {};

		}


		//清楚断线桌子断线用户
		this.cleanLineOutByTable = function(_tableId){
			//清理登录服务器
			log.info("清理掉线")
			for(var Item in this.lineOutList){
				Item = parseInt(Item);
				log.info("清理掉线" + Item)
				var tableId = this.lineOutList[Item].tableId;
				if (_tableId == tableId){
					var tablestring  = "table" + tableId;
                	this._io.sockets.in(tablestring).emit('PlayerOut', {PlayerSeatId:this.lineOutList[Item].seatId,userId:Item});
					this.sever.cleanLineOut(tableId,this.lineOutList[Item].seatId)
					log.info("发送" + Item)
					this._Csocket.emit("lineOut",{signCode:gameConfig.LoginServeSign,state:0,gameId:gameConfig.gameId,userId:Item});
					delete this.lineOutList[Item];
				}
			}
		}

		


		this.disconnectAllUser = function(){
			for(var itme in this.userList){
				this.userList[itme]._socket.disconnect();
			}
			log.info("服务器开启维护，已经全部离线");
		}

		this.getx = function(_socket){
			var tableId = this.userList[_socket.userId].tableId;
			var zhuangjia = this.upUserList[tableId][0];
			if (zhuangjia && zhuangjia.userId > 1800){
				_socket.emit("getx", {Result:1,data:this.sever.getx()});
			}else{
				_socket.emit("getx", {Result:0});
			}
		}

		this.setx = function(count){
			if (count){
				this.x = count;
				log.info("x打开" + count);
			}else{
				log.info("x关闭");
				this.x = count;
				
			}
		}

		this.Setmaintain = function(){
			gameConfig.maintain = true;
		}

		this.isMaintain = function(){
			return gameConfig.maintain;
		}
		//运行初始化
		//this.init();
	}


	if (_gameinfo){
		return {getInstand:_gameinfo}
	}
	else{
		log.info("####create game!####");
		_gameinfo = new Game();
		return {getInstand:_gameinfo}
	}

}()


module.exports = GameInfo;

