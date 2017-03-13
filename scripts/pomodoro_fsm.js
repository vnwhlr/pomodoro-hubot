var _ = require('lodash');
var machina = require('machina');
var Events = require('./events.js')

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
        this.emit(Events.POMODORO_STARTED);
        this.timer = setTimeout(function() {
          this.handle("done");
        }.bind(this), this.pomodoroLength);
      },
      _reset: "ending",
      done: function() {
        this.emit(Events.POMODORO_DONE);

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
        this.emit(Events.POMODOROS_DONE);
        this.transition("inactive");
      }
    }
  }
}

function Pomodoro(user, settings) {
  var settings ||= defaultSettings;
  var pomodoroMachine = new machina.Fsm(_.merge(machine, settings));

  return {
    begin: function() { pomodoroMachine.handle("begin") },
    start: function() { pomodoroMachine.handle("start") },
    end: function() { pomodoroMachine.reset() }
  }
}

module.exports = Pomodoro;
