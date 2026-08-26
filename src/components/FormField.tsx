import { IonInput } from '@ionic/react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'decimal';
  maxlength?: number;
}

export function FormField({
  label,
  value,
  onChange,
  error,
  placeholder,
  inputMode = 'text',
  maxlength,
}: FormFieldProps) {
  const fieldId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <IonInput
        id={fieldId}
        className={`form-field__input${error ? ' form-field__input--invalid' : ''}`}
        value={value}
        placeholder={placeholder}
        inputmode={inputMode}
        maxlength={maxlength}
        onIonInput={(event) => onChange(event.detail.value ?? '')}
      />
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}
