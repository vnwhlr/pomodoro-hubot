var events = require('./events.js')

var DEFAULT_SETTINGS = Object.freeze({
  numberOfPomodoros: 8,
  pomodoroLength: 25 * 1000,
  breakLength: 5 * 1000
});

var machine = {
  namespace: "pomodoro-bot",
  initialState: "inactive",

  initialize: function(options) {
    this.pomodorosRemaining: options.numberOfPomodoros,
    this.pomodoroLength: options.pomodoroLength,
    this.breakLength: options.breakLength
  },

  states: {

    inactive: {
      begin: function() {
        this.transition("doingPomodoro");
      }
    },

    doingPomodoro: {
      _onEnter: function() {
        this.emit(events.POMODORO_STARTED);
        this.timer = setTimeout(function() {
          this.handle("done");
        }.bind(this), this.pomodoroLength);
      },
      _reset: "ending",
      done: function() {
        this.emit(events.POMODORO_DONE);

        this.pomodorosRemaining--;
        if(this.pomodorosRemaining <= 0) {
          this.transition("end");
        } else {
          this.transition("onBreak");
        };
      },
      _onExit: function() {
        clearTimeout( this.timer );
      }
    },

    onBreak: {
      _onEnter: function() {
        this.timer = setTimeout(function() {
          this.handle("start");
        }.bind(this), this.breakLength);
      },
      start: "doingPomodoro",
      _reset: "ending",
      _onExit: function() {
        clearTimeout(this.timer);
      }
    },

    ending: {
      _onEnter: function() {
        this.emit(events.POMODOROS_DONE);
        this.transition("inactive");
      }
    }
  }
}

module.exports = function(user, settings) {
  var settings ||= defaultSettings;
  var pomodoroMachine = new machine.Fsm(machine.merge(settings));

  return {
    begin: function() { pomodoroMachine.handle("begin") },
    start: function() { pomodoroMachine.handle("start") },
    end: function() { pomodoroMachine.reset() }
  };
});

