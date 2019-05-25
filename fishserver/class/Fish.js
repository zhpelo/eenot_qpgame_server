Fish = function(fishId,fishType,fishPath){
	//相关属性

	this._fishId = -1;			//鱼ID
	this._fishType = -1;		//类型
	this._isDel = false;		//是否存活
	this._fishPath = -1;
	this._lifeTime = 120;
	this._prop = false;

	this.init = function(fishId,fishType,fishPath){
		this._fishId = fishId;
		this._fishType = fishType;
		this._fishPath = fishPath;
		this._isDel = false;
		this._lifeTime = 120;
		
	};

	//设置鱼ID
	this.setFishId = function(fishId){
		this._fishId = fishId; 
	}

	//获得鱼ID
	this.getFishId = function(){
		return this._fishId;
	}
	
	//设置鱼类型
	this.setFishType = function(fishType){
		this._fishType = fishType; 
	}

	//获得鱼类型
	this.getFishType = function(){
		return this._fishType;
	}

	//设置鱼路径
	this.setFishPath = function(fishPath){
		this._fishPath = fishPath; 
	}

	//获得鱼路径
	this.getFishPath = function(){
		return this._fishPath;
	}

	//死
	this.del = function(){
		this._isDel = true;
	}
	
	//复活
	this.agdel = function(){
		this._isDel = false;
	}

	//是否存活
	this.isDel = function(){
		return this._isDel;
	}

	this.init(fishId,fishType,fishPath);
		
}

module.exports = Fish;