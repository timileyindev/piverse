import React, { useState, useEffect } from "react";

const Countdown = ({ targetDate, minimal = false, valueOnly = false }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const difference = new Date(targetDate) - new Date();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const format = (num) => String(num).padStart(2, "0");

  if (!targetDate)
    return <span className="font-mono text-xs text-red-500">OFFLINE</span>;

  const isCritical =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5;
  const colorClass = isCritical ? "text-red-500 animate-pulse" : "text-primary";

  if (minimal || valueOnly) {
    return (
      <span className={`font-mono font-bold tracking-wider ${colorClass}`}>
        {timeLeft.days > 0 && <span>{format(timeLeft.days)}:</span>}
        {format(timeLeft.hours)}:{format(timeLeft.minutes)}:
        {format(timeLeft.seconds)}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 font-mono ${colorClass}`}
    >
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-[#a19db9] tracking-widest uppercase leading-none mb-1">
          REMAINING_TIME
        </span>
        <span className="text-xl sm:text-2xl font-bold tracking-wider leading-none">
          {timeLeft.days > 0 && <span>{format(timeLeft.days)}:</span>}
          {format(timeLeft.hours)}:{format(timeLeft.minutes)}:
          {format(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default Countdown;
