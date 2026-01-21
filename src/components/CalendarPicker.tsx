import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CalendarPicker.css';

interface CalendarPickerProps {
  selectedDate: string;
  availableDates: string[];
  onSelect: (date: string) => void;
}

export function CalendarPicker({ selectedDate, availableDates, onSelect }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the selected date to get the current month view
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());

  // Create a Set of available dates for quick lookup
  const availableDateSet = new Set(availableDates);
  
  // Today's date for visual indicator
  const today = new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    onSelect(dateStr);
    setIsOpen(false);
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(viewYear, viewMonth, day);
    const isAvailable = availableDateSet.has(dateStr);
    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === today;

    days.push(
      <button
        key={dateStr}
        className={`calendar-day ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
        onClick={() => isAvailable && handleDateClick(dateStr)}
        disabled={!isAvailable}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="calendar-picker">
      <button 
        className="calendar-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="calendar-icon">📅</span>
        <span className="calendar-date">{formatDisplayDate(selectedDate)}</span>
        <span className="calendar-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="calendar-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="calendar-header">
              <button className="calendar-nav" onClick={handlePrevMonth}>‹</button>
              <span className="calendar-month">{monthName}</span>
              <button className="calendar-nav" onClick={handleNextMonth}>›</button>
            </div>
            
            <div className="calendar-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-grid">
              {days}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
