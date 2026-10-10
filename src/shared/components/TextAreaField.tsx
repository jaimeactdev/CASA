import React, { forwardRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';

interface TextareaFieldProps {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    error?: string;  
    disabled?: boolean;
}


const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ name, value, onChange, onBlur, error, disabled }, ref) => {
        return (
            <>
                <InputTextarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}  
                    disabled={disabled}
                    className={error ? 'p-invalid' : ''}
                    ref={ref}  
                />
                {error && <small className="p-error label_form-small-required">{error}</small>} 
            </>
        );
    }
);


TextareaField.displayName = 'TextareaField';

export default TextareaField;
