const schedule = require('./');
const sinon = require('sinon');
const clock = sinon.useFakeTimers(Date.now());

function initTimer() {
  console.log("Starting & initializing the timer");
  let rule = new schedule.RecurrenceRule();
  rule.second = 10;
  rule.minute = 1;

  let job = schedule.scheduleJob(rule, function(){
    console.log(new Date());
  });
  return job;
};

initTimer();
clock.tick(24 * 60 * 60 * 1000);
