import React, { useState, useEffect } from "react";

function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Danh sách thứ trong tuần
  const weekdays = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ];

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // Format ngày tháng năm
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day < 10 ? "0" + day : day}/${
      month < 10 ? "0" + month : month
    }/${year}`;
  };

  // Format thời gian
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  // Lấy thứ trong tuần
  const getWeekday = (date) => {
    return weekdays[date.getDay()];
  };

  return (
    <div className="real-time-clock">
      <div className="time-display">
        <span className="weekday">{getWeekday(currentTime)} </span>
        <span className="date">{formatDate(currentTime)}, </span>
        <span className="time">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

export default RealTimeClock;
