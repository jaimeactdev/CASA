import React, { forwardRef } from 'react';
import { SelectButton, SelectButtonChangeEvent, SelectButtonProps } from 'primereact/selectbutton';

// Extendemos la interfaz para incluir las propiedades de SelectButton
interface InputSelectButtonProps extends Omit<SelectButtonProps, 'ref'> {
    name: string;
    value: any;
    onChange: (e: SelectButtonChangeEvent) => void;
    error?: string;
    disabled?: boolean;
}

// Convertimos el componente en una función que acepta una referencia
const InputSelectButton = forwardRef<HTMLDivElement, InputSelectButtonProps>(
    ({ name, value, options, onChange, error, disabled, ...props }, ref) => {
        return (
            <div ref={ref}>
                <div className="card flex justify-content-flex-start">
                    <SelectButton
                        id={name}
                        value={value}
                        options={options}
                        onChange={onChange}
                        className={error ? 'p-invalid' : ''}
                        disabled={disabled}
                        {...props}  // Pasamos las demás propiedades
                    />
                </div>
                {error && <div style={{ textAlign: "left" }}><small className="p-error label_form-small-required">{error}</small></div>}
            </div>
        );
    }
);

InputSelectButton.displayName = 'InputSelectButton';


export default InputSelectButton;
