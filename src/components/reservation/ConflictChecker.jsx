// Utility functions for conflict checking and smart suggestions

export function checkTimeOverlap(start1, end1, start2, end2) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return (s1 < e2 && e1 > s2);
}

export function findConflicts(newReservation, existingReservations, excludeId = null) {
  const conflicts = existingReservations.filter(existing => {
    if (existing.status === 'rejected' || existing.status === 'cancelled') return false;
    if (excludeId && existing.id === excludeId) return false;
    if (existing.room_id !== newReservation.room_id) return false;
    if (existing.reservation_date !== newReservation.reservation_date) return false;
    
    return checkTimeOverlap(
      newReservation.start_time,
      newReservation.end_time,
      existing.start_time,
      existing.end_time
    );
  });
  
  return conflicts;
}

export function formatConflictMessage(conflicts) {
  if (conflicts.length === 0) return null;
  
  const conflict = conflicts[0];
  return `Ruangan sudah digunakan dari ${conflict.start_time} sampai ${conflict.end_time} oleh ${conflict.borrower_name}`;
}

// Check for duplicate requests
export function checkDuplicateRequest(newReservation, existingReservations) {
  return existingReservations.find(existing => {
    if (existing.status === 'rejected' || existing.status === 'cancelled') return false;
    
    return (
      existing.borrower_name?.toLowerCase() === newReservation.borrower_name?.toLowerCase() &&
      existing.room_id === newReservation.room_id &&
      existing.reservation_date === newReservation.reservation_date &&
      existing.start_time === newReservation.start_time &&
      existing.end_time === newReservation.end_time
    );
  });
}

// Smart suggestion: find available rooms at the same time
export function findAvailableRooms(date, startTime, endTime, rooms, reservations, excludeRoomId = null) {
  return rooms.filter(room => {
    if (room.status === 'unavailable') return false;
    if (excludeRoomId && room.id === excludeRoomId) return false;
    
    const roomReservations = reservations.filter(r => 
      r.room_id === room.id && 
      r.reservation_date === date &&
      r.status !== 'rejected' && 
      r.status !== 'cancelled'
    );
    
    const hasConflict = roomReservations.some(r => 
      checkTimeOverlap(startTime, endTime, r.start_time, r.end_time)
    );
    
    return !hasConflict;
  });
}

// Smart suggestion: find available time slots for a room
export function findAvailableTimeSlots(roomId, date, reservations, desiredDuration = 60) {
  const roomReservations = reservations
    .filter(r => 
      r.room_id === roomId && 
      r.reservation_date === date &&
      r.status !== 'rejected' && 
      r.status !== 'cancelled'
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  
  const slots = [];
  const dayStart = 7 * 60; // 07:00
  const dayEnd = 17 * 60;  // 17:00
  
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const toTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  let currentTime = dayStart;
  
  for (const reservation of roomReservations) {
    const resStart = toMinutes(reservation.start_time);
    const resEnd = toMinutes(reservation.end_time);
    
    if (resStart > currentTime && (resStart - currentTime) >= desiredDuration) {
      slots.push({
        start_time: toTime(currentTime),
        end_time: toTime(resStart)
      });
    }
    
    currentTime = Math.max(currentTime, resEnd);
  }
  
  if (dayEnd > currentTime && (dayEnd - currentTime) >= desiredDuration) {
    slots.push({
      start_time: toTime(currentTime),
      end_time: toTime(dayEnd)
    });
  }
  
  return slots.slice(0, 3); // Return max 3 suggestions
}