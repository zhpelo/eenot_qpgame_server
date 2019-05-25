landlordUser = function(_userInfo){
	//相关属性
	this._userId = 0;
	this.PlayCount = Math.floor(Math.random()*2) + 1;
	this._online = true;

	this.init = function(_userInfo){
		this.setAccount(_userInfo.account);
		this._socre = 100;
		this.idx = _userInfo.idx;
		this.connect();
	};

	this.setAccount = function(_Account){
		this._account = _Account;
	}

	this.getAccount = function(){
		return this._account;
	}

	this.EnterLoginServer = function(){
		this._socket.emit('login',{userName:this.getAccount(),sign:'cocogame2016`@33922200@@@@',gameId:1})
	}


	this.connect = function(){
		//this._socket = io.connect('http://120.76.200.182:3000');
		//console.log("连接")
		this._socket = io.connect('http://localhost:13000');
		//this._socket = io.connect('http://192.168.1.170:3000');
		this.initNetWork();
		this.EnterLoginServer();
	}

	//连接游戏服务器
	this.connectGame = function(){
        this._gameSocket = io.connect('http://' + this._ip + ':' + this._port);
        console.log(this._ip,this._port)
        this.initGameSocket();
        //进入游戏,被服务器分配房间
        this.logingame();
    }

    //进入游戏
    this.logingame = function(){
        if (this._gameSocket && this._userId){
			//setTimeout(function(){
			this._gameSocket.emit('LoginGame',{userid:this._userId,gametype: 1,sign:this._sign})
			console.log(this._userId,this._sign);
			//},500);
        }
     }

    //进入房间
    this.loginroom = function(){
    	this._gameSocket.emit('LoginRoom',{roomid:1});
		var self=this;
		
		//登录桌子
		this._gameSocket.on("LoginRoomResult",function(result){
			self.tableId = result.ResultData.tableId;
            self.seatId = result.ResultData.seatId;
			self.playerId = self._userId;
			self.startGame();
			console.log(self.playerId);
		});
		
    };
	
	this.startGame = function(){
		var self = this;
		//桌子所有人的信息
		this._gameSocket.on("Hudshow",function(result){
			for(var i=0;i<result.data.length;i++){
				if(result.data[i]!=null){
					if(result.data[i].seatId!=self.seatId){
						self.enterRoom(result.data[i].seatId,result.data[i].userId);
					}else{
						//self.setRoomMessage(result.data[i].seatId,result.data[i].userId);
					}
				}
			}
		});
		
		//地主信息
		this._gameSocket.on("Landlord",function(result){
			self.callLandloads(result.userId);
			self.qiangDiZhu=true;
		});
		
		//出牌时间
		this._gameSocket.on("ListenCarcd",function(result){
			console.log(result.userId,"出牌");
			if(!self.gameFinish){
				self.playState(result.userId);
			}
		});
		
		//玩家的牌
		this._gameSocket.on("ACarcd",function(result){
			if(result.userId!==self.playerId){
				self.otherPlayerOutCard(result.carcd,result.userId);
			}else{
				self.xiTongOutCard(result.carcd);
			}
			self.playerNowState(result.userId,result.Explain,result.carcd);
		});
		
		//能不能出
		this._gameSocket.on("MyCarcd",function(result){
			if(!result.soery){
				if(result.result){
				  //  self.Landlords.identifyCards();
				}else{
					//不符合规则
					//self.tipsClick();
					console.log("不符合规则");
				}
			}
		});
		
		//玩家状态
		/*this._gameSocket.on("CCTV",function(result){
			self.playerNowState(result.userId,result.Explain,null);
		});*/
		
		//结算
		this._gameSocket.on("victory",function(result){
			result=result.Winner;
			self.settlement(result);
		});
		
		//玩家进入房间
		this._gameSocket.on("playEnter",function(data){
			self.enterRoom(data.ResultData.seatId,data.ResultData.userId);
		});
		
		//发牌
		this._gameSocket.on("sendCard",function(result){
			self.gameFinish=false;
			self.qiangDiZhu=true;
			self.cardsSorting(result.carcd);
		});
		
		//离开房间
		//this._gameSocket.on("PlayerOut",function(result){
		//	self.Landlords.playerOutRoom(result.userId);
		//});
		
		//确定地主
		this._gameSocket.on("Landlord_Poker",function(result){
			if(result){
				self.checkLandlords(result.userId,result.carcd);
			}
		});
		
		//公共牌
		//this._gameSocket.on("publicCarcd",function(result){
    	//    self.Landlords.resetDF(result.points);
		//});
		
		try {
			self._gameSocket.emit("getUer", { "tabelId": self.tableId, "seatId": self.seatId, "playerId": self.playerId });
			self._gameSocket.emit("loadedFinish", { "ready": 0, "tableId": self.tableId, "seatId": self.seatId, "playerId": self.playerId });
			//获取游戏进度
			//self._gameSocket.emit("joinTableroom",{"tableId":self.tableId,"seatId":self.seatId,"userId":self.playerId});
		    } catch (e) {}
		
		//初始化数据
		self.gameinit();
	};
	
	//初始化数据
	this.gameinit = function(){
		this.playerCards=[];
        this.selectedCard=[];
        this.CardsNum=[];
        this.recycling=[[null],[null],[null]];
        this.otherCardArr=[];
        this.mingPaiArray=[[],[],[]];
        this.cardsGroup=[[],[],[],[],[]];
        this.tipsCardsArr=[];
		this.tipsCount=0;
		this.tuoGuan=true;
		this.qiangDiZhu=true;
		this.playerArr=[[],this.playerId,[]];
		for(var i=3;i<16;i++){
            this.CardsNum.push(i);
        }
        this.CardsNum.splice(this.CardsNum.length-2,0,1,2);
        this.count=0;
	};
	
	//其他玩家加入房间
	this.enterRoom = function(seatId,userId){
		if(this.seatId===0){
            if (seatId === 1) {
                this.playerArr[2] = userId;
            } else if (seatId === 2) {
                this.playerArr[0] = userId;
            }
        }else if(this.seatId===1){
            if(seatId===0){
                this.playerArr[0]=userId;
            }else if(seatId===2){
                this.playerArr[2]=userId;
            }
        }else{
            if(seatId===1){
                this.playerArr[0]=userId;
            }else{
                this.playerArr[2]=userId;
            }
        }
	};
	
	//设置玩家信息
	//this.setRoomMessage = function(){
		
	//};
	
	//发牌
	this.cardsSorting = function(cardsArray){
        // this.finishGame();
        this.cardsArray=cardsArray;
        this.cardsArray.sort(function(a,b){
            if(a.val===b.val){
                return b.type-a.type;
            }else{
                return b.val-a.val;
            }
        });
        var i=0,ghost=null,oneAndTwo=null,OT=null;
        for(;i<this.cardsArray.length;i++){
            if(this.cardsArray[i].val>13){
                ghost=i;
            }else if(this.cardsArray[i].val===2||this.cardsArray[i].val===1){
                oneAndTwo=i;
                break;
            }
        }
        if(ghost===null&&oneAndTwo!==null){
            OT=this.cardsArray.splice(i,this.cardsArray.length-1);
            for(var j=0;j<OT.length;j++){
                this.cardsArray.splice(j,0,OT[j]);
            }
        }else if(ghost!==null&&oneAndTwo!==null){
            OT=this.cardsArray.splice(i,this.cardsArray.length-1);
            for(var j=0;j<OT.length;j++){
                this.cardsArray.splice(ghost+j+1,0,OT[j]);
            }
        }
		this.playerCards=this.cardsArray;
    };
	
	//叫地主
	this.callLandloads = function(userId){
		var self=this;
		setTimeout(function(){
			for (var i = 0; i < self.playerArr.length; i++) {
				if (self.playerArr[1] === userId) {
					try{
						self._gameSocket.emit("qiang", { "tableId": self.tableId, "seatId": self.seatId, "playerId": self.playerId, "qiang": Math.floor(Math.random()*2) });
					}catch(e){}
					break;
				}
			}
		},2000);
	};
	
    //检测地主
    this.checkLandlords = function (userId,cards) {
        this.qiangDiZhu=false;
		this.diZhuId=userId;
        if(userId===this.playerId){
            for(var i=0;i<cards.length;i++){
                this.playerCards.push(cards[i]);
            }
			this.cardsSorting(this.playerCards);
            this.firstOutCard=0;
            this.count=2;
        }
		console.log("地主");
    };
	
	//出牌状态
	this.playState = function(userId){
		//if(this.gameFinish!=true){
			console.log(this.playerId,userId);
			if(this.playerId==userId){
				//if(this.tuoGuan===false){
				//	if(this.count>=2||this.firstOutCard===0){
				//		this.firstOutCard++;
				//	}
				//}else{
					console.log(this.playerId,userId);
					this.tuoGuanFunction();
				//}
			}
		//}
	};
	
    //出牌
    this.outCard = function(){
		var self=this;
        this.selectedCard=[];
        this.count=0;
        var emitCard=[];
		for(var i=0;i<this.outCardArr.length;i++){
			if(this.outCardArr[i].length>0){
				for(var j=0;j<this.outCardArr[i].length;j++){
					emitCard.push({val:this.outCardArr[i].val,type:this.outCardArr[i].type});
				}
			}else{
				emitCard.push({val:this.outCardArr[i].val,type:this.outCardArr[i].type});
			}
        } 
		//emitCard.push(this.tipsCardsArr[0]);
		//console.log(emitCard);
		setTimeout(function(){
			//try {
				if(!this.gameFinish){
					console.log(emitCard,self.playerId,self.tableId,self.seatId);
					self._gameSocket.emit("sendCardsArr",{"array":emitCard,"userId":self.playerId,"tableId":self.tableId,"seatId":self.seatId});
				}
			//} catch (e) {}
			/*setTimeout(this.sendNum,2000);*/
		},2000);
		/*function out(emitCard,self){
			try {
				console.log(emitCard,self.playerId,self.tableId,self.seatId);
				self._gameSocket.emit("sendCardsArr",{"array":emitCard,"userId":self.playerId,"tableId":self.tableId,"seatId":self.seatId});
			} catch (e) {}
		}*/
		/*setTimeout("out("+emitCard+","+self+")",2000);*/
    };
	
	this.sendNum = function(){
		try {
			console.log(emitCard,this.playerId,this.tableId,this.seatId);
			this._gameSocket.emit("sendCardsArr",{"array":emitCard,"userId":this.playerId,"tableId":this.tableId,"seatId":this.seatId});
		} catch (e) {}
	};
	
	//其他玩家出牌
    this.otherPlayerOutCard = function(cards,userId){
        var seatId=-1;
        for(var i=0;i<this.playerArr.length;i++){
            if(this.playerArr[i]===userId){
                seatId=i;
                break;
            }
        }
        if(cards.length>0){
            var card,cardsArray=[],scale=0.8,count=0,multiple=1.5;
            for(var i=0;i<cards.length;i++){
                cardsArray.push(cards[i]);
            }
            this.recycling[seatId]=cardsArray;
            this.otherCardArr=cards;
            this.count=0;
        }else{
            this.count++;
            this.recycling[seatId]=null;
        }
    };
	
    //玩家状态
    this.playerNowState = function(userId,state,cards){
        var seatId=-1;
        for(var i=0;i<this.playerArr.length;i++){
            if(this.playerArr[i]===userId){
                seatId=i;
                break;
            }
        }
        /*switch (state) {
            case '不出':
                        if(seatId===1){
                            for(var i=0;i<this.playerCards.length;i++){
                                if(this.playerCards[i].position.y===this.movedY){
                                    this.playerCards[i].getComponent("Cards").moveCard();
                                }
                            }
                            this.selectedCard=[];
                            this.count=0;
                        }
                break;
            default:
                // code
                console.log(state);
        }*/
    };
	
	//系统出牌
    this.xiTongOutCard = function(cards){
        this.selectedCard=[];
        for(var i=0;i<cards.length;i++){
            for(var j=0;j<this.playerCards.length;j++){
                if(cards[i].val===this.playerCards[j].val&&cards[i].type===this.playerCards[j].type){
                    this.selectedCard.push(this.playerCards[j]);
                    break;
                }
            }
        }
        this.identifyCards();
    };
	
	//确认出牌
    this.identifyCards = function(){
        for(var i=0;i<this.playerCards.length;i++){
            for(var j=0;j<this.selectedCard.length;j++){
                if(this.playerCards[i]==this.selectedCard[j]){
                    this.playerCards.splice(i,1);
                    i--;
                    break;
                }
            }
        }
        if(this.selectedCard.length>0){
            this.resetCardLocat();
        }
        this.otherCardArr=[];
        this.tipsCardsArr=[];
        this.tipsCount=0;
		console.log(this.playerCards.length);
        if(this.playerCards.length===0){
            this.gameEnd();
        }
    };
	
    //重置牌位
    this.resetCardLocat = function(){
        this.recycling[1]=this.selectedCard;
        this.selectedCard=[];
    };
	
	//托管
	this.tuoGuanFunction = function(){
		console.log(this.gameFinish);
		if(!this.gameFinish&&!this.qiangDiZhu){
			this.tipsClick();
			if(this.tipsCardsArr.length>0){
				this.outCard();
			}
		}
	};
	
	//提示
	this.tipsClick = function(){
		this.outCardArr=[];
		if(this.tipsCount===0){
            this.matchingType();
        }
		console.log(this.tipsCardsArr);
        if(this.tipsCount>=this.tipsCardsArr.length){
            this.tipsCount=0;
        }
        if(this.tipsCardsArr.length>0){
			if(this.tipsCardsArr[this.tipsCount].length>0){
                for(var i=0;i<this.tipsCardsArr[this.tipsCount].length;i++){
                    this.outCardArr.push(this.tipsCardsArr[this.tipsCount][i]);
                }
            }else{
                this.outCardArr.push(this.tipsCardsArr[this.tipsCount]);
            }
			console.log(this.outCardArr);
            this.tipsCount++;
        }else{
			var self=this;
			setTimeout(function(){
				if(self._gameSocket){
					self._gameSocket.emit("sendCardsArr",{"array":[],"userId":self.playerId,"tableId":self.tableId,"seatId":self.seatId});
				}
			},2000);
		}
	};
	
    //匹配类型
    this.matchingType = function(){
        var attribute=-1;
		console.log(this.count);
        if(this.count<2){
            attribute=this.cardType(this.otherCardArr);
			console.log(attribute);
            this.checkTypeNum(attribute);
        }else if(this.count>=2){
            this.tipsCardsArr.push(this.playerCards[this.playerCards.length-1]);
			console.log(this.playerCards);
        }
    };
	
    //牌型大小
    this.cardType = function(cardsArr){
        var newType=-1,max=0,checkObj=[];
        if(cardsArr.length>0){
            checkObj[0]=this.checkOneCard(cardsArr);
            checkObj[1]=this.checkDuiZi(cardsArr);
            checkObj[2]=this.checkShunZi(cardsArr);
            checkObj[3]=this.checkSanOrShun(cardsArr);
            checkObj[4]=this.checkSiTakeTwo(cardsArr);
            checkObj[5]=this.checkSiTakeTwoShuang(cardsArr);
            checkObj[6]=this.checkSanOrPlane(cardsArr);
            checkObj[7]=this.checkSanShuangOrPlane(cardsArr);
            checkObj[8]=this.checkSi(cardsArr);
            checkObj[9]=this.kingBoom(cardsArr);
            for(var i=0;i<checkObj.length;i++){
                if(checkObj[i].num){
                    newType=i;
                    max=checkObj[i].max;
                    length=cardsArr.length;
                    break;
                }
            }
        }
        return {"type":newType,"max":max,"length":length};
    };
	
    //单牌
    this.checkOneCard = function(primaryCard){
        if(primaryCard.length===1){
            return {"max":primaryCard[0].val,"num":1};
        }
        return {"max":0,"num":0};
    };
	
    //对子
    this.checkDuiZi = function(primaryCard){
        if(primaryCard.length%2===0){
            if(primaryCard.length===2){
                if(primaryCard[0].val===primaryCard[1].val){
                    return {"max":primaryCard[0].val,"num":1};
                }
            }else if(primaryCard.length>5){
                if(this.checkSi(primaryCard).num!==0){
                    return {"max":primaryCard[0].val,"num":0};
                }
                var num=primaryCard.length/2;
                var shun,deng;
                for(var i=0;i<num;i++){
                    if(primaryCard[2*i].val===primaryCard[2*i+1].val){
                        deng=true;
                    }else{
                        deng=false;
                        break;
                    }
                    if(2*(i+1)<primaryCard.length){
                        if(primaryCard[2*i].val===1&&primaryCard[2*(i+1)].val===13){
                            shun=true;
                        }else if(primaryCard[2*i].val===2){
                            shun=false;
                            break;
                        }else{
                            if(primaryCard[2*i].val-primaryCard[2*(i+1)].val===1){
                                shun=true;
                            }else{
                                shun=false;
                                break;
                            }
                        }
                    }
                }
                if(deng&&shun){
                    return {"max":primaryCard[0].val,"num":num};
                }
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //顺子
    this.checkShunZi = function(primaryCard){
        var shun;
        if(primaryCard.length>4){
            for(var i=0;i<primaryCard.length-1;i++){
                if(primaryCard[i].val===1&&primaryCard[i+1].val===13){
                    shun=true;
                }else if(primaryCard[i].val===2){
                    shun=false
                    break;
                }else{
                    if(primaryCard[i].val-primaryCard[i+1].val===1){
                        shun=true;
                    }else{
                        shun=false;
                        break;
                    }
                }
            }
            if(shun){
                return {"max":primaryCard[0].val,"num":primaryCard.length};
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //三or三顺
    this.checkSanOrShun = function(primaryCard){
        var san,shun;
        if(primaryCard.length%3===0){
            var num=primaryCard.length/3;
            if(num===1){
                shun=true;
                for(var i=0;i<primaryCard.length-1;i++){
                    if(primaryCard[i].val===primaryCard[i+1].val){
                        san=true;
                    }else{
                        san=false;
                        break;
                    }
                }
            }else{
                outer:for(var i=0;i<num;i++){
                    if(3*(i+1)<primaryCard.length){
                        if(primaryCard[3*i].val-primaryCard[3*(i+1)].val===1||(primaryCard[3*i].val===1&&primaryCard[3*(i+1)].val===13)){
                            shun=true;
                        }else{
                            shun=false;
                            break;
                        }
                    }
                    for(var j=0;j<2;j++){
                        if(primaryCard[3*i+j].val===primaryCard[3*i+j+1].val&&primaryCard[3*i+j].val!==2){
                            san=true;
                        }else{
                            san=false;
                            break outer;
                        }
                    }
                }
            }
            if(san&&shun){
                return {"max":primaryCard[0].val,"num":num};
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //炸弹
    this.checkSi = function(primaryCard){
        var si;
        if(primaryCard.length===4){
            // if(num===1){
            for(var i=0;i<primaryCard.length-1;i++){
                if(primaryCard[i].val===primaryCard[i+1].val){
                    si=true;
                }else{
                    si=false;
                    break;
                }
            }
            if(si){
                return {"max":primaryCard[0].val,"num":1};
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //四带二单
    this.checkSiTakeTwo = function(primaryCard){
        var si,cardArr;
        if(primaryCard.length===6){
            for(var i=0;i<3;i++){
                cardArr=[];
                for(var j=0;j<primaryCard.length;j++){
                    cardArr.push(primaryCard[j]);
                    console.log()
                }
                // if(i===0){
                    cardArr.splice(0,i);
                // }else{
                    cardArr.splice(cardArr.length-(2-i),2-i);
                    console.log(cardArr);
                // }
                if(this.checkSi(cardArr).num===1){
                    return {"max":cardArr[0].val,"num":1};
                }
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //四带二双
    this.checkSiTakeTwoShuang = function(primaryCard){
        var si,cardsArr,duiArr,count,multiple=2;
        if(primaryCard.length===8){
            for(var i=0;i<3;i++){
                cardsArr=[];
                duiArr=[];
                count=0;
                for(var j=0;j<primaryCard.length;j++){
                    cardsArr.push(primaryCard[j]);
                }
                var first=cardsArr.slice(0,i*2);
                var last=cardsArr.slice(cardsArr.length-multiple*2+i*2,cardsArr.length);
                cardsArr.splice(0,i*2);
                cardsArr.splice(cardsArr.length-multiple*2+i*2,multiple*2-i*2);
                for(var j=0;j<first.length/2;j++){
                    duiArr.push([first[2*j],first[2*j+1]]);
                }
                for(var j=0;j<last.length/2;j++){
                    duiArr.push([last[2*j],last[2*j+1]]);
                }
                for(var j=0;j<duiArr.length;j++){
                    if(this.checkDuiZi(duiArr[j]).num===1){
                        count++;
                        if(count===multiple){
                            if(this.checkSi(cardsArr).num===1){
                                return {"max":cardsArr[0].val,"num":1};
                            }
                        }
                    }
                }
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //三带单or飞机
    this.checkSanOrPlane = function(primaryCard){
        var shun,san,multiple;
        if(primaryCard.length%4===0){
            multiple=primaryCard.length/4;
            var cardsArr;
            for(var i=0;i<=multiple;i++){
                if(this.checkSi(primaryCard.slice(i,i+4)).num){
                    return {"max":primaryCard[0].val,"num":0};
                }
                cardsArr=[];
                for(var j=0;j<primaryCard.length;j++){
                    if(multiple>1&&primaryCard[j].val===2){
                        return {"max":primaryCard[0].val,"num":0};
                    }
                    cardsArr.push(primaryCard[j]);
                }
                cardsArr.splice(0,i);
                cardsArr.splice(cardsArr.length-multiple+i,multiple-i);
                if(this.checkSanOrShun(cardsArr).num===multiple){
                    return {"max":cardsArr[0].val,"num":multiple};
                }
            }
            
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //三带双or飞机
    this.checkSanShuangOrPlane = function(primaryCard){
        if(primaryCard.length%5===0){
            var shun,san,multiple,dui,duiArr=[],count=0;
            multiple=primaryCard.length/5;
            var cardsArr;
            for(var i=0;i<=multiple;i++){
                cardsArr=[];
                duiArr=[];
                count=0;
                for(var j=0;j<primaryCard.length;j++){
                    if(multiple>1&&primaryCard[j].val===2){
                        return {"max":primaryCard[0].val,"num":0};
                    }
                    cardsArr.push(primaryCard[j]);
                }
                var first=cardsArr.slice(0,i*2);
                var last=cardsArr.slice(cardsArr.length-multiple*2+i*2,cardsArr.length);
                cardsArr.splice(0,i*2);
                cardsArr.splice(cardsArr.length-multiple*2+i*2,multiple*2-i*2);
                for(var j=0;j<first.length/2;j++){
                    duiArr.push([first[2*j],first[2*j+1]]);
                }
                for(var j=0;j<last.length/2;j++){
                    duiArr.push([last[2*j],last[2*j+1]]);
                }
                for(var j=0;j<duiArr.length;j++){
                    if(this.checkDuiZi(duiArr[j]).num===1){
                        count++;
                        if(count===multiple){
                            if(this.checkSanOrShun(cardsArr).num===multiple){
                                return {"max":cardsArr[0].val,"num":multiple};
                            }
                        }
                    }
                }
            }
        }
        return {"max":primaryCard[0].val,"num":0};
    };
	
    //王炸
    this.kingBoom = function(primaryCard){
        if(primaryCard.length===2){
            if(primaryCard[0].val===15&&primaryCard[1].val===14){
                return {"max":15,"num":1};
            }
        }
        return {"max":0,"num":0};
    };
	
    //类型对应
    this.checkTypeNum = function(attribute){
		console.log("类型对应");
        this.sameDifferentVal();
        var array=[],newArr=[],cardVal=-1,maxVal=-1,multiple;
        switch (attribute.type) {
            case 0:
                for(var i=0;i<this.cardsGroup[0].length;i++){
                    for(var j=0;j<this.cardsGroup[0][i].length;j++){
                        if(this.cardsGroup[0][i][j].val===1){
                            cardVal=13.1;
                        }else if(this.cardsGroup[0][i][j].val===2){
                            cardVal=13.2;
                        }else{
                            cardVal=this.cardsGroup[0][i][j].val;
                        }
                        if(attribute.max===1){
                            maxVal=13.1;
                        }else if(attribute.max===2){
                            maxVal=13.2;
                        }else{
                            maxVal=attribute.max;
                        }
                        if(cardVal>maxVal){
                            this.tipsCardsArr.push(this.cardsGroup[0][i][j]);
                        }else{
                            break;
                        }
                    }
                }
                for(var i=0;i<this.cardsGroup[4].length;i++){
                    if(this.cardsGroup[4][i][0].val>attribute.max){
                        this.tipsCardsArr.push(this.cardsGroup[4][i][0]);
                    }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 1:
                multiple=attribute.length/2;
                for(var i=0;i<this.cardsGroup[1].length;i++){
                    array=[];
					for(var k=0;k<multiple;k++){
						if(i+k>=this.cardsGroup[1].length){
							break;
						}
						for(var j=0;j<this.cardsGroup[1][i+k].length;j++){
							array.push(this.cardsGroup[1][i+k][j]);
						}
					}
					if(array.length===attribute.length){
						this.drawCards(array,attribute);
					}
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 2:
                for(var i=0;i<this.cardsGroup[0].length;i++){
                    array=[];
                    for(var j=0;j<attribute.length;j++){
                        if(i+j<this.cardsGroup[0].length){
                            array.push(this.cardsGroup[0][i+j][0]);
                        }
                    }
                    if(array.length===attribute.length){
                        this.drawCards(array,attribute);
                    }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 3:
                multiple=attribute.length/3;
                for(var i=0;i<this.cardsGroup[2].length;i++){
                    array=[];
					for(var k=0;k<multiple;k++){
						if(i+k<this.cardsGroup[2].length){
							for(var j=0;j<this.cardsGroup[2][i+k].length;j++){
								array.push(this.cardsGroup[2][i+k][j]);
							}
							if(array.length===attribute.length){
								this.drawCards(array,attribute);
							}
						}
					}
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 4:
                var kingNum=0;
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    array=[];
                    out:for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        array.push(this.cardsGroup[3][i][j]);
                        for(var k=0;k<this.cardsGroup[0].length;k++){
                            if(this.cardsGroup[0][k][0].val!==array[0].val){
                                array.push(this.cardsGroup[0][k][0]);
                                if(array.length===attribute.length){
                                    this.drawCards(array,attribute);
                                    break out;
                                }
                            }
                        }
                        for(var k=this.playerCards.length-1;k>-1;k--){
                            for(var l=0;l<array.length;l++){
                                if(array[l].val!==this.playerCards[k].val){
                                    if((this.playerCards[k].val===14||this.playerCards[k].val===15)&&kingNum<1){
                                        kingNum++;
                                    }else if((this.playerCards[k].val===14||this.playerCards[k].val===15)&&kingNum===1){
                                        continue;
                                    }
                                    if(l===array.length-1){
                                        array.push(this.playerCards[k]);
                                        if(array.length===attribute.length){
                                            this.drawCards(array,attribute);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 5:
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    array=[];
                    out:for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        array.push(this.cardsGroup[3][i][j]);
						if(array.length==4){
							for(var k=0;k<this.cardsGroup[1].length;k++){
								if(this.cardsGroup[1][k][0].val!==array[0].val){
									for(var l=0;l<this.cardsGroup[1][k].length;l++){
										array.push(this.cardsGroup[1][k][l]);
										if(array.length===attribute.length){
											this.drawCards(array,attribute);
											break out;
										}
									}
								}
							}
							for(var k=0;k<this.cardsGroup[3].length;k++){
								if(this.cardsGroup[3][k][0].val!==array[0].val){
									for(var l=0;l<this.cardsGroup[3][k].length;l++){
										array.push(this.cardsGroup[3][k][l]);
										if(array.length===attribute.length){
											this.drawCards(array,attribute);
											break out;
										}
									}
								}
							}
						}
                    }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 6:
                var kingNum=0;
                multiple=attribute.length/4;
                for(var i=0;i<this.cardsGroup[2].length;i++){
                    array=[];
                    for(var k=0;k<multiple;k++){
                        if(i+k<this.cardsGroup[2].length){
                            for(var j=0;j<this.cardsGroup[2][i+k].length;j++){
                                array.push(this.cardsGroup[2][i+k][j]);
                            }
                        }
                    }
                    var arrLength=array.length;
                    out:for(var k=this.playerCards.length-1;k>-1;k--){
                        for(var l=0;l<arrLength;l++){
                            if(array[l].val!==this.playerCards[k].val){
                                if((this.playerCards[k].val===14||this.playerCards[k].val===15)&&kingNum<1){
                                    kingNum++;
                                }else if((this.playerCards[k].val===14||this.playerCards[k].val===15)&&kingNum===1){
                                    break;
                                }
                                if(l===arrLength-1){
                                    array.push(this.playerCards[k]);
                                    if(array.length===attribute.length){
                                        this.drawCards(array,attribute);
                                        break out;
                                    }
                                }
                            }else{
                                break;
                            }
                        }
                    }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 7:
                multiple=attribute.length/5;
                for(var i=0;i<this.cardsGroup[2].length;i++){
                    array=[];
                        for(var k=0;k<multiple;k++){
                            if(i+k<this.cardsGroup[2].length){
                                for(var j=0;j<this.cardsGroup[2][i+k].length;j++){
                                    array.push(this.cardsGroup[2][i+k][j]);
                                }
                            }
                        }
                        out:for(var k=0;k<this.cardsGroup[1].length;k++){
                            for(var j=0;j<this.cardsGroup[1][k].length;j++){
								if(this.cardsGroup[1][k][j].val!=array[0].val){
									array.push(this.cardsGroup[1][k][j]);
									if(array.length===attribute.length){
										this.drawCards(array,attribute);
										break out;
									}
								}
                            }
                        }
                }
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    newArr=[]
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        newArr.push(this.cardsGroup[3][i][j]);
                        if(newArr.length===4){
                            this.tipsCardsArr.push(newArr);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 8:
                for(var i=0;i<this.cardsGroup[3].length;i++){
                    array=[];
                    for(var j=0;j<this.cardsGroup[3][i].length;j++){
                        array.push(this.cardsGroup[3][i][j]);
                        if(array.length===attribute.length){
                            this.drawCards(array,attribute);
                        }
                    }
                }
                if(this.cardsGroup[4].length>1){
                    newArr=[];
                    for(var i=0;i<this.cardsGroup[4].length;i++){
                        for(var j=0;j<this.cardsGroup[4][i].length;j++){
                            newArr.push(this.cardsGroup[4][i][j]);
                            if(newArr.length===2){
                                this.tipsCardsArr.push(newArr);
                            }
                        }
                    }
                }
                // code
                break;
            case 9:
                this.tipsCardsArr=[];
            
            default:
                // code
        }
    };
	
    //分类
    this.sameDifferentVal = function(){
		console.log(this.playerCards);
        this.cardsGroup=[[],[],[],[],[]];
        for(var i=0;i<this.CardsNum.length;i++){
            var cardGroup0=[];
            var cardGroup1=[];
            var cardGroup2=[];
            var cardGroup3=[];
            var cardGroup4=[];
            var num=0;
            for(var j=this.playerCards.length-1;j>-1;j--){
                if(this.CardsNum[i]===this.playerCards[j].val){
                    if(this.CardsNum[i]===14||this.CardsNum[i]===15){
                        num=5;
                    }else{
                        num++;
                    }
                    if(num===1){
						cardGroup0.push(this.playerCards[j]);
						cardGroup1.push(this.playerCards[j]);
						cardGroup2.push(this.playerCards[j]);
						cardGroup3.push(this.playerCards[j]);
						this.cardsGroup[0].push(cardGroup0);
                    }else if(num===2){
                        cardGroup1.push(this.playerCards[j]);
                        cardGroup2.push(this.playerCards[j]);
                        cardGroup3.push(this.playerCards[j]);
                        this.cardsGroup[1].push(cardGroup1);
                    }else if(num===3){
                        cardGroup2.push(this.playerCards[j]);
                        cardGroup3.push(this.playerCards[j]);
                        this.cardsGroup[2].push(cardGroup2);
                    }else if(num===4){
                        cardGroup3.push(this.playerCards[j]);
                        this.cardsGroup[3].push(cardGroup3);
                    }else if(num===5){
                        cardGroup4.push(this.playerCards[j]);
                        this.cardsGroup[4].push(cardGroup4);
                    }
                }
            }
        }
		console.log(this.cardsGroup);
    };
	
    //抽牌
    this.drawCards = function(array,attribute){
        var newArr=[];
        for(var i=array.length-1;i>-1;i--){
            newArr.push({"val" : array[i].val});
        }
            var result;
            if(attribute.type===1){
                result=this.checkDuiZi(newArr);
            }else if(attribute.type===2){
                result=this.checkShunZi(newArr);
            }else if(attribute.type===3){
                result=this.checkSanOrShun(newArr);
            }else if(attribute.type===4){
                result=this.checkSiTakeTwo(newArr);
            }else if(attribute.type===5){
                result=this.checkSiTakeTwoShuang(newArr);
            }else if(attribute.type===6){
                result=this.checkSanOrPlane(newArr);
            }else if(attribute.type===7){
                result=this.checkSanShuangOrPlane(newArr);
            }else if(attribute.type===8){
                result=this.checkSi(newArr);
            }
            if(result.num>0){
                if(result.max===1){
                    result.max+=12.1;
                }else if(result.max===2){
                    result.max+=11.2;
                }
                if(attribute.max===1){
                    attribute.max+=12.1;
                }else if(attribute.max===2){
                    attribute.max+=11.2;
                }
                if(result.max>attribute.max){
                    this.tipsCardsArr.push(array);
                }
            }
    };
	
    //游戏结束
    this.gameEnd = function(){
		this.gameFinish=true;
        if(this.diZhuId===this.playerId){
			try {
                this._gameSocket.emit("finishGame",{"userId":this.playerId,"seatId":this.seatId,"tableId":this.tableId,"finish":1,"isLandload":1});
            } catch (e) {}
		}else{
			try {
                this._gameSocket.emit("finishGame",{"userId":this.playerId,"seatId":this.seatId,"tableId":this.tableId,"finish":1,"isLandload":0});
            } catch (e) {}
		}
        console.log("游戏结束");
    };
	
    //结算
    this.settlement = function(playerArrMessage){
        console.log("gameFinish",playerArrMessage.length);
        for(var i=0;i<playerArrMessage.length;i++){
			console.log(playerArrMessage[i].userId,this.playerId);
			if(playerArrMessage[i].userId==this.playerId){
				this._socre = playerArrMessage[i].Fraction;
				this.PlayCount--;
				console.log(this._score,this.PlayCount);
				if(this._socre <= 0){
					this.PlayCount = 0;
				}else{
					console.log("结算");
					this.finishGame();
				}
				break;
			}
        }
    };
	
    //结束重置信息
    this.finishGame = function(){
        this.recycling = [[null],[null],[null]];
        this.playerCards=[];
        
        this.firstOutCard=1;
		var self=this;
		setTimeout(function(){
			console.log("准备");
			try{
				self._gameSocket.emit("loadedFinish", { "ready": 0, "tableId": self.tableId, "seatId": self.seatId, "playerId": self.playerId });
			}catch(e){}
		},2000);
		console.log(this.tableId,this.seatId,this.playerId);
    };

	//接收大厅信息
	this.initNetWork = function(){
		var self = this;
		this._socket.on('connected',function(msg){
        	//console.log(msg);
    	})

    	this._socket.on('loginResult',function(result){
    		//console.log(result)
    		self._sign = result.Obj.sign;
	      	self._userId = result.Obj.id;
	      	//console.log(self._userId + "进入经典牛牛");
	      	self._socre = result.Obj.score;
	      	self._online = true;
    	})

	    this._socket.on('ServerListResult',function(msg){

	    	console.log(self._userId + "进入斗地主" + parseInt(self.idx + 1) +"倍房间!");
	        self._ip = msg.GameInfo[9].serverInfo.normal[self.idx].ip;
	        self._port = msg.GameInfo[9].serverInfo.normal[self.idx].prot;

	        //进入游戏
	        self.connectGame();
	    })

	}


	//接收游戏信息
	this.initGameSocket = function(){
		
		var self = this;
		this._gameSocket.on('connected',function(msg){
			console.log("****",msg,self._gameSocket);
			
		})

		this._gameSocket.on('loginGameResult',function(msg){
			//console.log(msg);
			//结束与登录服务器通信
			console.log("msg",msg);
			self.loginroom();
		})


	    this._gameSocket.on('getDownTimeResult',function(msg){
	        console.log(msg);
	    })
		
		
		
		
	};

	this.show = function(){
		this._gameSocket.emit('show');
	}


	this.disconnect = function(){
		if (this._gameSocket){
			this._gameSocket.disconnect();
			this._gameSocket = null;
		}
		if (this._socket){
			this._socket.disconnect();
			this._socket = null;
		}
		this._online = false;
		console.log(this._userId +"离开斗地主")
	} 

	this.isOnline = function(){
		return this.PlayCount > 0;
	}

	this.init(_userInfo);
		
}
