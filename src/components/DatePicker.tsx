"use client";
import { useState, useRef, useEffect } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface HorizontalDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function DatePicker({
  selectedDate,
  onDateSelect,
}: HorizontalDatePickerProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dateOffset, setDateOffset] = useState(0);
  const monthConstraintsRef = useRef(null);
  const dateConstraintsRef = useRef(null);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaysInMonth = (monthIdx: number, year: number) => {
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, monthIdx, i + 1)
    );
  };

  const currentMonthDays = getDaysInMonth(currentMonthIndex, currentYear);

  useEffect(() => {
    if (selectedDate) {
      const selectedDay = selectedDate.getDate();
      const centerOffset = Math.max(0, selectedDay - 5); // Position selected date around the 5th slot
      const maxOffset = currentMonthDays.length - 9; // Ensure we don't exceed the number of days
      setDateOffset(Math.min(centerOffset, maxOffset));
    } else {
      const today = new Date();
      if (
        today.getMonth() === currentMonthIndex &&
        today.getFullYear() === currentYear
      ) {
        const todayDay = today.getDate();
        const centerOffset = Math.max(0, todayDay - 5);
        const maxOffset = currentMonthDays.length - 9;
        setDateOffset(Math.min(centerOffset, maxOffset));
      } else {
        setDateOffset(0); // Default to start of the month if today is not in the current month
      }
    }
  }, [selectedDate, currentMonthIndex, currentYear, currentMonthDays.length]);

  const getVisibleMonths = () => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      let monthIdx = currentMonthIndex + i;
      let year = currentYear;
      if (monthIdx < 0) {
        monthIdx += 12;
        year -= 1;
      } else if (monthIdx > 11) {
        monthIdx -= 12;
        year += 1;
      }
      result.push({ name: months[monthIdx], index: monthIdx, year, offset: i });
    }
    return result;
  };

  const getVisibleDates = () => {
    const startIdx = Math.max(0, dateOffset);
    const endIdx = Math.min(currentMonthDays.length, startIdx + 9);
    return currentMonthDays.slice(startIdx, endIdx);
  };

  const handleMonthDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      changeMonth(-1);
    } else if (info.offset.x < -threshold) {
      changeMonth(1);
    }
  };

  const handleDateDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    if (info.offset.x > threshold && dateOffset > 0) {
      setDateOffset(Math.max(0, dateOffset - 5));
    } else if (
      info.offset.x < -threshold &&
      dateOffset + 10 < currentMonthDays.length
    ) {
      setDateOffset(Math.min(currentMonthDays.length - 10, dateOffset + 5));
    }
  };

  const changeMonth = (direction: number) => {
    let newMonthIndex = currentMonthIndex + direction;
    let newYear = currentYear;
    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear -= 1;
    } else if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear += 1;
    }
    setCurrentMonthIndex(newMonthIndex);
    setCurrentYear(newYear);
    setDateOffset(0); // Will be overridden by useEffect if selectedDate exists
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (monthIdx: number, year: number) => {
    return monthIdx === currentMonthIndex && year === currentYear;
  };

  const visibleMonths = getVisibleMonths();
  const visibleDates = getVisibleDates();

    const formattedSelectedDate = selectedDate
    ? formatDate(selectedDate)
    : "No date selected"


  return (
    <div className="p-2 shadow-lg">
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div
            className="flex-1 flex overflow-hidden relative justify-center"
            ref={monthConstraintsRef}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleMonthDragEnd}
              className="flex gap-1 cursor-grab active:cursor-grabbing"
            >
              {visibleMonths.map((month, idx) => (
                <motion.button
                  key={`${month.year}-${month.index}`}
                  onClick={() => {
                    if (month.offset !== 0) {
                      changeMonth(month.offset);
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                    isCurrentMonth(month.index, month.year)
                      ? "bg-yellow-400 text-black shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {month.name}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateOffset(Math.max(0, dateOffset - 5))}
            disabled={dateOffset === 0}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div
            className="flex-1 overflow-hidden relative flex justify-center"
            ref={dateConstraintsRef}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDateDragEnd}
              className="flex gap-1 cursor-grab active:cursor-grabbing"
            >
              {visibleDates.map((day) => (
                <motion.button
                  key={day.toISOString()}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "min-w-[32px] h-8 rounded-full text-sm font-medium transition-all flex-shrink-0",
                    isSelected(day)
                      ? "bg-yellow-400 text-black shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {day.getDate()}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <button
            onClick={() =>
              setDateOffset(
                Math.min(currentMonthDays.length - 10, dateOffset + 5)
              )
            }
            disabled={dateOffset + 10 >= currentMonthDays.length}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex justify-center mt-2 text-sm">
        {months[currentMonthIndex]}{" "}
        {formatDate(formattedSelectedDate).split(' ')[1]}{" "}
        {currentYear}
      </div>
    </div>
  );
}
