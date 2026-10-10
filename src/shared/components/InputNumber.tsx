import React, { forwardRef, useEffect, useRef } from 'react';
import { InputNumber } from 'primereact/inputnumber';

interface InputNumberFieldProps {
    name: string;
    value: number | null;
    smallText?: string;
    onChange: (e: any) => void; // El evento de cambio de InputNumber de PrimeReact es de tipo 'any'
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    mode?: 'decimal' | 'currency'; // Puedes definir si es decimal o moneda
    currency?: string; // En caso de usar modo 'currency'
    locale?: string; // En caso de usar modo 'currency' para definir el locale
    minFractionDigits?: number; // Nuevo: Cantidad mínima de decimales
    maxFractionDigits?: number;
    showButtons? :boolean;
}

const InputNumberField = forwardRef<HTMLInputElement, InputNumberFieldProps>(
    ({ name, value, smallText = '', onChange, onBlur, error, disabled, min, max, mode, currency, locale, minFractionDigits, maxFractionDigits, showButtons=false }, ref) => {


      const inputRef = useRef<HTMLInputElement | null>(null);

      useEffect(() => {
        if (inputRef.current) {
          inputRef.current.setAttribute('autocomplete', 'off');
        }
      }, []);


      return (
        <>
          <InputNumber
            id={name}
            name={name}
            value={value}
            onValueChange={onChange} 
            onBlur={onBlur}
            disabled={disabled}
            min={min}
            max={max}
            mode={mode}
            currency={currency}
            locale={locale}
            minFractionDigits={minFractionDigits} 
            maxFractionDigits={maxFractionDigits}
            showButtons= {showButtons}
            inputRef={(el) => {
              inputRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                // Forward ref assignment
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }
            }} // Ref para el input de InputNumber
            className={error ? 'p-invalid' : ''}
           
          />
          {smallText && <small id={`${name}-help`} className='label_form-small'>{smallText}</small>}
          {error && <small className="p-error label_form-small-required">{error}</small>}
        </>
      );
    }
);


InputNumberField.displayName = 'InputNumberField';

export default InputNumberField;
