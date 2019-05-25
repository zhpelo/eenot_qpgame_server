const schedule = require('./');

var ctx = {
  year: 2016,
  month: 3,
  day: 30,
  hour: 9,
  minute: 5,
  second: 0
};

schedule.scheduleJob(ctx, () => {
  console.log('RUN');
});
