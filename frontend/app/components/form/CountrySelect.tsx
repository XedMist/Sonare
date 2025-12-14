import { useMemo } from "react";
import { SelectField } from "../ui/SelectField";
import { getCountryOptions } from "../../lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export function CountrySelect({ value, onChange, label = "País", helperText, required }: CountrySelectProps) {
  const options = useMemo(() => getCountryOptions(), []);

  return (
    <SelectField
      name="country"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={label}
      helperText={helperText}
      required={required}
    >
      <option value="">Selecciona un país</option>
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </SelectField>
  );
}
