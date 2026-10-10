import React, { forwardRef } from 'react';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';

interface InputCheckboxProps {
    name: string;
    value: any[];
    direction: string;
    options: { label: string; value: any }[];
    onChange: (value: any[]) => void;
    error?: string;
    disabled?: boolean;
}

// Convertimos el componente en una función que acepta una referencia
const InputCheckbox = forwardRef<HTMLDivElement, InputCheckboxProps>(
    ({ name, value, direction, options, onChange, error, disabled }, ref) => {
        const handleCheckboxChange = (e: CheckboxChangeEvent, optionValue: any) => {
            if (e.checked) {
                // Agregar opción seleccionada al array
                onChange([...value, optionValue]);
            } else {
                // Eliminar opción deseleccionada del array
                onChange(value.filter((v) => v !== optionValue));
            }
        };

        return (
            <div ref={ref}>
                <div className="custom-checkbox-form" style={{ flexDirection: direction === "vertical" ? "column" : "row" }}>
                    {options.map((option) => (
                        <div key={option.value} className="field-checkbox" style={{ marginLeft: "6px" }}>
                            <Checkbox
                                inputId={`${name}_${option.value}`}
                                name={name}
                                value={option.value}
                                checked={value.includes(option.value)}
                                onChange={(e) => handleCheckboxChange(e, option.value)} // Usar la función modificada
                                disabled={disabled}
                            />
                            <label htmlFor={`${name}_${option.value}`}>{option.label}</label>
                        </div>
                    ))}
                </div>
                {error && <div style={{ textAlign: "left" }}><small className="p-error label_form-small-required">{error}</small></div>}
            </div>
        );
    }
);

InputCheckbox.displayName = 'InputCheckbox';

export default InputCheckbox;
