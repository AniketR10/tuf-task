'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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

const TORN_EDGE_CLIP_PATH = 'polygon(0% 4%, 2% 0%, 5% 5%, 8% 1%, 11% 6%, 14% 0%, 18% 5%, 22% 2%, 25% 7%, 29% 1%, 32% 6%, 35% 0%, 39% 5%, 43% 2%, 46% 8%, 50% 1%, 54% 7%, 58% 2%, 61% 6%, 65% 0%, 68% 5%, 72% 1%, 75% 7%, 78% 2%, 82% 5%, 86% 0%, 89% 6%, 93% 2%, 96% 7%, 100% 0%, 100% 100%, 0% 100%)';


type Popover = { day: number; text: string; x: number; y: number };
type StickyNote = { id: number; day: number; month: number; text: string; visible: boolean };

const POPOVER_W = 208;
const POPOVER_H = 220;

const WallCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [tearTargetMonth, setTearTargetMonth] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [popovers, setPopovers] = useState<Popover[]>([]);

  const [dateNotes, setDateNotes] = useState<Record<string, string>>({});
  const [monthNotes, setMonthNotes] = useState<Record<number, string>>({});
  const [savedNotes, setSavedNotes] = useState<StickyNote[]>([]);

  const noteIdRef = useRef(0);

  const year = 2026;
  const daysInMonth = getDaysInMonth(currentMonth, year);
  const startDayOffset = getStartDayOffset(currentMonth, year);
  const prevMonthDays = getPrevMonthDays(currentMonth, year);
  const totalSlots = Math.ceil((daysInMonth + startDayOffset) / 7) * 7;

  const nextMonth = tearTargetMonth !== null
    ? tearTargetMonth
    : (currentMonth < 11 ? currentMonth + 1 : null);
  const nextDaysInMonth = nextMonth !== null ? getDaysInMonth(nextMonth, year) : 0;
  const nextStartDayOffset = nextMonth !== null ? getStartDayOffset(nextMonth, year) : 0;
  const nextPrevMonthDays = nextMonth !== null ? getPrevMonthDays(nextMonth, year) : 0;
  const nextTotalSlots = Math.ceil((nextDaysInMonth + nextStartDayOffset) / 7) * 7;


  useEffect(() => {
    try {
      const dn = localStorage.getItem('cal-dateNotes');
      if (dn) setDateNotes(JSON.parse(dn));
      const mn = localStorage.getItem('cal-monthNotes');
      if (mn) setMonthNotes(JSON.parse(mn));
      const sn = localStorage.getItem('cal-savedNotes');
      if (sn) setSavedNotes((JSON.parse(sn) as StickyNote[]).map(n => ({ ...n, visible: true })));
    } catch { /* corrupted storage — start fresh */ }
  }, []);

  useEffect(() => { setPopovers([]); }, [currentMonth]);

  useEffect(() => { localStorage.setItem('cal-dateNotes', JSON.stringify(dateNotes)); }, [dateNotes]);
  useEffect(() => { localStorage.setItem('cal-monthNotes', JSON.stringify(monthNotes)); }, [monthNotes]);
  useEffect(() => {
    const toStore = savedNotes.filter(n => n.visible);
    localStorage.setItem('cal-savedNotes', JSON.stringify(toStore));
  }, [savedNotes]);

  const finishTear = useCallback((nextMonthFn: (p: number) => number) => {
    setSkipTransition(true);
    setDragY(0);
    setDragX(0);
    setCurrentMonth(nextMonthFn);
    setIsTearing(false);
    setTearTargetMonth(null);
    requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
  }, []);

  const completeManualTear = useCallback(() => {
    if (isTearing || currentMonth === 11) return;
    setIsTearing(true);
    setTearTargetMonth(currentMonth + 1);
    setDragY(1000);
    setDragX(prev => prev * 3);
    setTimeout(() => finishTear(p => p + 1), 400);
  }, [currentMonth, isTearing, finishTear]);

  const triggerAutoTear = useCallback((direction: 'next' | 'prev') => {
    if (isTearing) return;
    if (direction === 'next' && currentMonth === 11) return;
    if (direction === 'prev' && currentMonth === 0) return;
    setIsTearing(true);
    setTearTargetMonth(direction === 'next' ? currentMonth + 1 : currentMonth - 1);
    setDragY(800);
    setDragX(direction === 'next' ? 400 : -400);
    setTimeout(() => finishTear(p => direction === 'next' ? p + 1 : p - 1), 400);
  }, [currentMonth, isTearing, finishTear]);

  const handleImagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsDragging(true);
    calendarRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (dragY + e.movementY > 0) {
      setDragY(prev => prev + e.movementY);
      setDragX(prev => prev + e.movementX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragY > 150) {
      completeManualTear();
    } else {
      setDragY(0);
      setDragX(0);
    }
  };

  const handleDateClick = (day: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (popovers.some(p => p.day === day)) {
      setPopovers(prev => prev.filter(p => p.day !== day));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left + rect.width / 2 - POPOVER_W / 2;
    let y = rect.bottom + 8;
    x = Math.max(8, Math.min(x, window.innerWidth - POPOVER_W - 8));
    if (y + POPOVER_H > window.innerHeight - 8) y = rect.top - POPOVER_H - 8;
    const key = `${currentMonth}-${day}`;
    setPopovers(prev => [...prev, { day, text: dateNotes[key] || '', x, y }]);
  };

  const updatePopoverText = (day: number, text: string) => {
    setPopovers(prev => prev.map(p => p.day === day ? { ...p, text } : p));
  };

  const closePopover = (day: number) => {
    setPopovers(prev => prev.filter(p => p.day !== day));
  };

  const handleSaveNote = (day: number) => {
    const popover = popovers.find(p => p.day === day);
    if (!popover) return;
    const text = popover.text.trim();
    closePopover(day);
    if (!text) return;
    const key = `${currentMonth}-${day}`;
    setDateNotes(prev => ({ ...prev, [key]: text }));
    const id = ++noteIdRef.current;
    setSavedNotes(prev => [...prev, { id, day, month: currentMonth, text, visible: false }]);
    setTimeout(() => {
      setSavedNotes(prev => prev.map(n => n.id === id ? { ...n, visible: true } : n));
    }, 30);
  };

  const handleDismissNote = (id: number) => {
    const note = savedNotes.find(n => n.id === id);
    if (note) {
      setDateNotes(prev => {
        const next = { ...prev };
        delete next[`${note.month}-${note.day}`];
        return next;
      });
    }
    setSavedNotes(prev => prev.map(n => n.id === id ? { ...n, visible: false } : n));
    setTimeout(() => setSavedNotes(prev => prev.filter(n => n.id !== id)), 400);
  };

  const getDayClass = (day: number) => {
    const hasNote = !!dateNotes[`${currentMonth}-${day}`];
    const isWeekend = (day - 1 + startDayOffset) % 7 >= 5;
    return [
      'relative h-9 w-9 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-colors duration-200',
      hasNote
        ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
        : isWeekend
          ? 'text-blue-500 hover:bg-blue-50'
          : 'text-gray-700 hover:bg-gray-100',
    ].join(' ');
  };

  const tiltX = dragY * 0.05;
  const tiltY = dragX * 0.05;
  const rotationZ = dragX * 0.02;

  return (
    <>
      {popovers.map(popover => (
        <div
          key={popover.day}
          className="fixed z-50 bg-yellow-100 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
          style={{ left: popover.x, top: popover.y, width: POPOVER_W }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              {MONTHS[currentMonth].slice(0, 3)} {popover.day}, {year}
            </span>
            <button
              onClick={() => closePopover(popover.day)}
              className="text-gray-400 hover:text-gray-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-yellow-200 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <textarea
            className="w-full h-24 bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-400"
            placeholder="What's happening?"
            value={popover.text}
            onChange={e => updatePopoverText(popover.day, e.target.value)}
            autoFocus
          />
          <button
            onClick={() => handleSaveNote(popover.day)}
            className="w-full py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Save & Pin
          </button>
        </div>
      ))}

      <div className="fixed top-4 right-4 z-200 flex flex-col gap-2 w-48">
        {savedNotes.map(note => (
          <div
            key={note.id}
            className={[
              'bg-yellow-200 rounded-lg shadow-lg p-3 transition-all duration-500 ease-out',
              note.visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-90',
            ].join(' ')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-yellow-800 uppercase tracking-wide">
                {MONTHS[note.month].slice(0, 3)} {note.day}
              </span>
              <button
                onClick={() => handleDismissNote(note.id)}
                className="text-yellow-600 hover:text-yellow-900 w-4 h-4 flex items-center justify-center rounded-full hover:bg-yellow-300 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-700 wrap-break-word leading-relaxed">{note.text}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg font-sans perspective-distant">

        <div className="relative z-30 pointer-events-none -mb-2 mx-6">
          <div className="h-2.5 rounded-full shadow-lg bg-gradient-to-b from-gray-300 via-gray-500 to-gray-400" />
          <div className="absolute -top-3 inset-x-0 flex justify-evenly px-6">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="w-3.5 h-6 rounded-t-full border-[3px] border-b-0 border-gray-500 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_1px_3px_rgba(0,0,0,0.4)]"
              />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden">
        {nextMonth !== null ? (
          <div className="absolute inset-0 rounded-xl -z-10 scale-[0.98] translate-y-2 overflow-hidden shadow-xl pointer-events-none border border-gray-200 bg-white">
            <div className="relative h-52 w-full bg-gray-200">
              <Image
                src={MONTH_IMAGES[nextMonth]}
                alt={MONTHS[nextMonth]}
                className="object-cover w-full h-full select-none"
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                draggable={false}
              />
              <div className="absolute bottom-0 w-full h-16 bg-linear-to-t from-white to-transparent" />
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-4 py-3 rounded-tl-2xl shadow-lg">
                <h2 className="text-lg font-bold leading-tight text-right">{year}</h2>
                <h1 className="text-2xl font-black tracking-wider text-right">{MONTHS[nextMonth]}</h1>
              </div>
            </div>
            <div className="flex justify-center gap-6 py-1.5 bg-white border-b border-gray-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full shadow-inner bg-gray-200" />
              ))}
            </div>
            <div className="p-5 bg-white">
              <div className="grid grid-cols-7 gap-1 mb-3 text-center">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={day} className={`text-[10px] font-bold ${index >= 5 ? 'text-blue-500' : 'text-gray-400'}`}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 place-items-center">
                {Array.from({ length: nextStartDayOffset }).map((_, i) => (
                  <div key={`ne-${i}`} className="h-9 w-9 text-gray-300 flex items-center justify-center text-xs">
                    {nextPrevMonthDays - nextStartDayOffset + i + 1}
                  </div>
                ))}
                {Array.from({ length: nextDaysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isWeekend = (day - 1 + nextStartDayOffset) % 7 >= 5;
                  return (
                    <div key={`nd-${day}`} className={`h-9 w-9 flex items-center justify-center rounded-full text-xs font-medium ${isWeekend ? 'text-blue-500' : 'text-gray-700'}`}>
                      {day}
                    </div>
                  );
                })}
                {Array.from({ length: nextTotalSlots - (nextDaysInMonth + nextStartDayOffset) }).map((_, i) => (
                  <div key={`nee-${i}`} className="h-9 w-9 text-gray-300 flex items-center justify-center text-xs">{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 rounded-xl -z-10 scale-[0.98] translate-y-2 bg-gray-50 shadow-xl border border-gray-200 flex items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-400">End of Year</span>
          </div>
        )}

        <div
          ref={calendarRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="bg-white shadow-2xl rounded-xl overflow-hidden touch-none origin-top"
          style={{
            transform: `translate3d(${dragX}px, ${dragY}px, ${isDragging ? 50 : 0}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotationZ}deg)`,
            transition: isDragging || skipTransition ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), clip-path 0s',
            clipPath: isTearing || dragY > 80 ? TORN_EDGE_CLIP_PATH : 'none',
          }}
        >
          <div className="absolute top-4 w-full flex justify-between px-6 z-50 pointer-events-none">
            <button
              onClick={() => triggerAutoTear('prev')}
              disabled={currentMonth === 0}
              className="pointer-events-auto bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => triggerAutoTear('next')}
              disabled={currentMonth === 11}
              className="pointer-events-auto bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform hover:scale-110 disabled:opacity-0 group relative"
            >
              <span className="absolute -top-8 right-0 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded">
                Tear Page Automatically
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div
            className="relative h-52 w-full bg-gray-200 cursor-grab active:cursor-grabbing"
            onPointerDown={handleImagePointerDown}
          >
            <Image
              src={MONTH_IMAGES[currentMonth]}
              alt={`${MONTHS[currentMonth]} scenery`}
              className="object-cover w-full h-full pointer-events-none select-none"
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              priority
              draggable={false}
            />
            <div className="absolute bottom-0 w-full h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white px-4 py-3 rounded-tl-2xl shadow-lg pointer-events-none">
              <h2 className="text-lg font-bold leading-tight text-right">{year}</h2>
              <h1 className="text-2xl font-black tracking-wider text-right">{MONTHS[currentMonth]}</h1>
            </div>
          </div>

          <div className="flex justify-center gap-6 py-1.5 bg-white border-b border-gray-100 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full shadow-inner bg-gray-200" />
            ))}
          </div>

          <div className="flex flex-row p-5 gap-4 bg-white">

            <div className="w-36 shrink-0 flex flex-col">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h3>
              <textarea
                className="flex-1 min-h-32 bg-transparent resize-none focus:outline-none text-gray-600 text-xs leading-6 placeholder-gray-300"
                placeholder="Jot down memos..."
                value={monthNotes[currentMonth] || ''}
                onChange={e => setMonthNotes(prev => ({ ...prev, [currentMonth]: e.target.value }))}
              />
            </div>

            <div className="w-px bg-gray-100 self-stretch shrink-0" />

            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 mb-3 text-center">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={day} className={`text-[10px] font-bold ${index >= 5 ? 'text-blue-500' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 place-items-center">
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-9 text-gray-300 flex items-center justify-center text-xs">
                    {prevMonthDays - startDayOffset + i + 1}
                  </div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const hasNote = !!dateNotes[`${currentMonth}-${day}`];
                  return (
                    <div
                      key={`day-${day}`}
                      className={getDayClass(day)}
                      onClick={e => handleDateClick(day, e)}
                    >
                      {day}
                      {hasNote && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-500" />
                      )}
                    </div>
                  );
                })}
                {Array.from({ length: totalSlots - (daysInMonth + startDayOffset) }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="h-9 w-9 text-gray-300 flex items-center justify-center text-xs">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>  
        </div>  
      </div>   
    </>
  );
};

export default WallCalendar;
