var Events = require('./events.js');
var Pomodoro = require('./pomodoro_fsm.js');

// TODO: persist to hubot-brain
var PomodoroManager = function(robot) {
  var pomodoros = {};

  function subscribeToEvents(pomodoroMachine) {
    _.each(Events, function(event) {
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
    var pom = new Pomodoro(user);
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

module.exports = PomodoroManager;
