import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import vi from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const STATUS_COLORS = {
  PENDING: '#f59e0b', // Yellow
  CONFIRMED: '#3b82f6', // Blue
  COMPLETED: '#10b981', // Green
  CANCELLED: '#ef4444', // Red
  NO_SHOW: '#8b5cf6', // Purple
};

export default function AppointmentCalendar({ appointments = [], onSelectEvent }) {
  
  const events = useMemo(() => {
    return appointments.map(appt => {
      const startDateTime = new Date(`${appt.appointmentDate}T${appt.startTime}`);
      const endDateTime = new Date(`${appt.appointmentDate}T${appt.endTime || appt.startTime}`);
      
      const line = appt.lines?.[0];
      const serviceName = line?.serviceName || 'Dich vu';
      const customerName = appt.customerName || 'Khach hang';
      
      return {
        id: appt.id,
        title: `${serviceName} - ${customerName}`,
        start: startDateTime,
        end: endDateTime,
        resource: appt,
      };
    });
  }, [appointments]);

  const eventStyleGetter = (event, start, end, isSelected) => {
    const status = event.resource.status;
    const backgroundColor = STATUS_COLORS[status] || '#cbd5e1';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div style={{ height: '70vh', minHeight: 500, background: '#fff', padding: 20, borderRadius: 12, boxShadow: 'var(--shadow-soft)' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        culture="vi"
        messages={{
          next: "Tiep",
          previous: "Truoc",
          today: "Hom nay",
          month: "Thang",
          week: "Tuan",
          day: "Ngay",
          agenda: "Lich trinh"
        }}
      />
    </div>
  );
}
