import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClockCircleOutlined } from "@ant-design/icons";
import constantKeys from "i18n/constant-keys";

interface SeasonTimerProps {
  endTime: string;
  className?: string;
}

export default function SeasonTimer({ endTime, className = "balance" }: SeasonTimerProps) {
  const { t } = useTranslation();

  const [remainingTime, setRemainingTime] = useState(() => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "0d 0h 0min";

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return `${days}d ${hours}h ${minutes}min`;
  });

  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setRemainingTime("0d 0h 0min");
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      setRemainingTime(`${days}d ${hours}h ${minutes}min`);
    };
    
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={className}>
      <ClockCircleOutlined className="clock-icon" />
      <span className="text">{`${t(constantKeys.SEASON_END_TIME)}:`}</span>
      <span className="value">{remainingTime}</span>
    </div>
  );
};



