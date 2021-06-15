const pomodoroTimer = function (dur) {
  // convert duration to seconds
  let durInSec = dur * 60;

  // countdown logic
  const countdown = setInterval(() => {
    durInSec--;
    console.log(durInSec);
    if (durInSec <= 0) {
      clearInterval(countdown);
    }
  }, 1000);
};

module.exports = {
  pomodoroTimer,
};
