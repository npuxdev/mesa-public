import { formatParameter, parameterByKey } from "../config/parameterSchema";
import type { NumericLightingKey } from "../config/parameterSchema";

interface SliderFieldProps {
  parameter: NumericLightingKey;
  value: number;
  onChange: (value: number) => void;
}

export function SliderField({ parameter, value, onChange }: SliderFieldProps) {
  const spec = parameterByKey(parameter);
  const id = `ct-${spec.key}`;
  return (
    <div className="ct-slider">
      <label className="ct-slider-label" htmlFor={id}>
        <span>{spec.label}</span>
        <span className="ct-slider-value">{formatParameter(spec.key, value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        aria-valuemin={spec.min}
        aria-valuemax={spec.max}
        aria-valuenow={value}
        aria-valuetext={formatParameter(spec.key, value)}
        aria-describedby={`${id}-hint`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p className="ct-hint" id={`${id}-hint`}>
        {spec.description}
      </p>
    </div>
  );
}
