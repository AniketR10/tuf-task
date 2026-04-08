'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_IMAGES = [
  'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1482442120256-9c03866de390?auto=format&fit=crop&w=1200&q=80',
];

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOffset(month: number, year: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getPrevMonthDays(month: number, year: number): number {
  if (month === 0) return getDaysInMonth(11, year - 1);
  return getDaysInMonth(month - 1, year);
}

const WallCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  const year = 2026;
  const daysInMonth = getDaysInMonth(currentMonth, year);
  const startDayOffset = getStartDayOffset(currentMonth, year);
  const prevMonthDays = getPrevMonthDays(currentMonth, year);

  const flipToMonth = useCallback((targetMonth: number) => {
    if (isFlipping || targetMonth === currentMonth) return;
    if (targetMonth < 0 || targetMonth > 11) return;

    setFlipDirection(targetMonth > currentMonth ? 'next' : 'prev');
    setIsFlipping(true);
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);

    setTimeout(() => {
      setCurrentMonth(targetMonth);
      setIsFlipping(false);
    }, 600);
  }, [currentMonth, isFlipping]);

  const handleDateClick = (day: number) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day > startDate) {
        setEndDate(day);
      } else if (day < startDate) {
        setStartDate(day);
      } else {
        setStartDate(null);
      }
    }
  };

  const getDayClass = (day: number) => {
    let classes = "h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 ";

    const isStart = day === startDate;
    const isEnd = day === endDate;
    const isBetween = startDate && endDate && day > startDate && day < endDate;
    const isHovering = startDate && !endDate && hoverDate && day > startDate && day <= hoverDate;

    if (isStart || isEnd) {
      classes += "bg-blue-600 text-white shadow-md ";
    } else if (isBetween || isHovering) {
      classes += "bg-blue-100 text-blue-800 ";
    } else {
      classes += "text-gray-700 hover:bg-gray-100 ";
    }

    if ((day - 1 + startDayOffset) % 7 === 5 || (day - 1 + startDayOffset) % 7 === 6) {
      if (!isStart && !isEnd && !isBetween && !isHovering) {
        classes += "text-blue-500 ";
      }
    }

    return classes;
  };

  const totalSlots = Math.ceil((daysInMonth + startDayOffset) / 7) * 7;

  return (
    <div className="max-w-4xl mx-auto my-10 font-sans" style={{ perspective: '1500px' }}>
      <div
        className={`bg-white shadow-2xl rounded-xl overflow-hidden ${
          isFlipping
            ? flipDirection === 'next'
              ? 'animate-flip-up'
              : 'animate-flip-down'
            : ''
        }`}
        style={{
          transformOrigin: flipDirection === 'next' ? 'bottom center' : 'top center',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-80 w-full bg-gray-200">
          <Image
            src={MONTH_IMAGES[currentMonth]}
            alt={`${MONTHS[currentMonth]} scenery`}
            className="object-cover w-full h-full"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
          <div className="absolute bottom-0 w-full h-24 bg-linear-to-t from-white to-transparent" />
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-6 rounded-tl-3xl shadow-lg">
            <h2 className="text-3xl font-bold leading-tight text-right">{year}</h2>
            <h1 className="text-4xl font-black tracking-wider text-right">{MONTHS[currentMonth]}</h1>
          </div>

          {/* Navigation Arrows */}
          {currentMonth > 0 && (
            <button
              onClick={() => flipToMonth(currentMonth - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentMonth < 11 && (
            <button
              onClick={() => flipToMonth(currentMonth + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Spiral binding holes */}
        <div className="flex justify-center gap-8 py-2 bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-50" />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row p-8 gap-12">
          {/* Notes */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Notes</h3>
            <div className="relative h-full min-h-50">
              <textarea
                className="w-full h-full bg-transparent resize-none focus:outline-none text-gray-700 leading-8"
                style={{
                  backgroundImage: 'linear-gradient(transparent, transparent 31px, #e5e7eb 31px)',
                  backgroundSize: '100% 32px',
                  lineHeight: '32px'
                }}
                placeholder="Jot down memos here..."
                value={notes[currentMonth] || ''}
                onChange={(e) => setNotes(prev => ({ ...prev, [currentMonth]: e.target.value }))}
              />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-2">
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className={`text-xs font-bold ${index >= 5 ? 'text-blue-500' : 'text-gray-400'}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 place-items-center">
              {/* Previous month trailing days */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 w-10 text-gray-300 flex items-center justify-center text-sm">
                  {prevMonthDays - startDayOffset + i + 1}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                return (
                  <div
                    key={`day-${day}`}
                    className={getDayClass(day)}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => setHoverDate(day)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {day}
                  </div>
                );
              })}

              {/* Next month leading days */}
              {Array.from({ length: totalSlots - (daysInMonth + startDayOffset) }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-10 w-10 text-gray-300 flex items-center justify-center text-sm">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Month dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {MONTHS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => flipToMonth(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentMonth
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={MONTHS[i]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flipUp {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(-90deg); opacity: 0.5; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        @keyframes flipDown {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(90deg); opacity: 0.5; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        .animate-flip-up {
          animation: flipUp 0.6s ease-in-out;
        }
        .animate-flip-down {
          animation: flipDown 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default WallCalendar;
