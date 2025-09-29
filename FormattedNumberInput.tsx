
import React, { useState, useEffect } from 'react';

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, placeholder = "Amount" }) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toLocaleString('en-US') : '');

  useEffect(() => {
      // Update display value if prop changes from outside (e.g., OCR)
      if (Number(displayValue.replace(/,/g, '')) !== value) {
        setDisplayValue(value ? value.toLocaleString('en-US') : '');
      }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseInt(rawValue.replace(/,/g, ''), 10);

    if (isNaN(numericValue)) {
      setDisplayValue('');
      onChange(0);
    } else {
      setDisplayValue(numericValue.toLocaleString('en-US'));
      onChange(numericValue);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
  );
};

export default FormattedNumberInput;
