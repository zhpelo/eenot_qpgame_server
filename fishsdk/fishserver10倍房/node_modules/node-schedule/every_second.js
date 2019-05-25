const schedule = require('./');

const job1 = schedule.scheduleJob({ second : null }, () => {
   console.log(new Date(), 'job1');
});

const job2 = schedule.scheduleJob('* * * * * *', () => {
   console.log(new Date(), 'job2');
});
