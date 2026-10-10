import React, { forwardRef } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

interface CalendarFieldProps {
    name: string;
    value: Date | null;
    onChange: (e: any) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    dateFormat?: string; // Formato de la fecha (e.g., 'dd/mm/yy')
    showIcon?: boolean; // Mostrar el ícono del calendario
    showTime?: boolean; // Mostrar el selector de hora
    minDate : string;
    placeholder?: string; // Placeholder del campo
}


const today = new Date();
const tomorrow = new Date(today);
const oldDay = new Date(today);
tomorrow.setDate(today.getDate() + 1);
oldDay.setDate(today.getDate() - 3000);

const CalendarField = forwardRef<HTMLInputElement, CalendarFieldProps>(
    ({ name, value, onChange, onBlur, error, disabled, dateFormat = 'dd/mm/yy', showIcon = true, showTime = false, minDate = '', placeholder = 'Selecciona una fecha' }, ref) => {

        addLocale('es', {
            firstDayOfWeek: 1,
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
            monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Limpiar'
        });


      return (
        <>
          <Calendar
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            dateFormat={dateFormat}
            showIcon={showIcon}
            showTime={showTime}
            showButtonBar={true}
            placeholder={placeholder}
            inputRef={ref} // Referencia del input
            className={error ? 'p-invalid' : ''}
             minDate={ minDate==="tomorrow" ? tomorrow : ( minDate=="today" ? today : oldDay )  } 
            locale="es"
          />
          {error && <small className="p-error label_form-small-required">{error}</small>}
        </>
      );
    }
);

CalendarField.displayName = 'CalendarField';

export default CalendarField;
