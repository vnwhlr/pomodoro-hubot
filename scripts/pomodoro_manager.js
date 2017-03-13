var events = require('./events.js');
var pomodoro = require('./pomodoro_fsm.js');

// TODO: persist to hubot-brain
module.exports = function(robot) {
  var pomodoros = {};

  function subscribeToEvents(pomodoroMachine) {
    events.forEach(function(event) {
      pomodoroMachine.on(event, function(data) {
        robot.emit(event, {
          user: this.user,
          data: data
        });
      });
    });
  }

  function keyFor(user) {
    return user.username;
  }

  function createFor(user) {
    var pom = pomodoro(user);
    subscribeToEvents(pom);
    persist(user, pom);
    return pom;
  }

  function getOrCreateFor(user) {
    var userKey = keyFor(user);
    if(pomodoros[userKey]) {
      return pomodoros[userKey];
    } else {
      return createFor(user);
    }
  }

  function persist(user, pomodoro) {
    var userKey = keyFor(user);
    pomodoros[userKey] = pomodoro;
  }

  function removeFor(user) {
    var userKey = keyFor(user);
    pomodoros.delete[userKey];
  }

  return {
    getOrCreateFor: getOrCreateFor,
    persist: persist,
    removeFor: removeFor
  }
}
