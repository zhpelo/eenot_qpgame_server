var cron = require('./');

var j = cron.scheduleJob('nasr', '* * * * * *', function() {
    console.log('will get this console on every 5 sec.');
});
var k = cron.scheduleJob('30 * * * * *', function() {
    cron.scheduledJobs['nasr'].cancel();
    console.log('at first 30 sec of a minute the above job will get cancelled.');
});
