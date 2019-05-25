var express = require('express');

module.exports=function(){
	router= express.Router();
	
	router.get('/',function(req,res){
		res.send('0')
	})
	
	return router
}
