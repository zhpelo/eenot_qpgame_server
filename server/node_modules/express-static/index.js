const fs    = require('fs');
const url   = require('url');
const path  = require('path');
const mime  = require('mime');
/**
 * [exports description]
 * @param  {[type]} root    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function(root, options){
  options = options || {};
   var defaults = {
     index: 'index.html'
   };
   for(var k in options)
     defaults[ k ] = options[ k ];
   options = defaults;
 return function(req, res, next){
   var filename = url.parse(req.url).pathname;
   if(options.decodeURI) filename = decodeURIComponent(filename);
   if(/\/$/.test(filename)) filename += options.index;
   filename = path.join(path.resolve(root), filename);
   fs.stat(filename, function(err, stat){
     if(err) return next((~[ 'ENOENT' ].indexOf(err.code)) ? null : err);
     if(stat.isDirectory()) return res.redirect(filename + '/'); 
     var type = mime.lookup(filename);
     var charset = mime.charsets.lookup(type);
     res.setHeader('Content-Type'  , type + (charset ? '; charset=' + charset : '' ));
     res.setHeader('Content-Length', stat.size);
     res.setHeader('Last-Modified' , stat.mtime.toUTCString());
     fs.createReadStream(filename).pipe(res);
   });
 };
};
