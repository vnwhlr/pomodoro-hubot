var Events = require('./events.js');
var PomodoroManager = require('./pomodoro_manager.js');

module.exports = function(robot) {
  var pomodoroManager = new PomodoroManager(robot);

  function withPomodoro(f) {
    return function(msg) {
      var pomodoro = pomodoroManager.getOrCreateFor(msg.user);
      var newPomodoro = f(msg, pomodoro);
      if(newPomodoro != null) {
        pomodoroManager.persist(user, newPomodoro);
      }
    }
  }

  // TODO: parse arguments for settings?
  robot.respond(/begin/i, withPomodoro(function(msg, pomodoro) {
    pomodoro.begin();
    return pomodoro;
  });

  robot.respond(/start/i, withPomodoro(function(msg, pomodoro) {
    pomodoro.start();
    return pomodoro;
  });

  robot.respond(/end/i, withPomodoro(function(msg, pomodoro)) {
    pomodoro.end();
    return pomodoro;
  });

  // TODO: more inspiring replies
  robot.on(events.POMODORO_DONE, function(event) {
    // TODO: could you set the user to Online?
    robot.send(event.user, "Pomodoro done!");
  });

  robot.on(events.POMODORO_STARTED, function(event) {
    // TODO: could you set the user to Busy?
    robot.send(event.user, "Pomodoro started!");
  });

  robot.on(events.POMODOROS_OVER, function(event) {
    robot.send(event.user, "You're done! Good job!");
    pomodoroManager.remove();
  });
}
