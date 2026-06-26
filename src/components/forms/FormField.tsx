type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, ...props }: FieldProps) {
  return (
    <label>
      <span className="field-label">
        {label}
        {props.required ? <span className="text-red-600"> *</span> : null}
      </span>
      <input className="field-input" {...props} />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: React.ReactNode;
};

export function FormSelect({ label, children, ...props }: SelectProps) {
  return (
    <label>
      <span className="field-label">
        {label}
        {props.required ? <span className="text-red-600"> *</span> : null}
      </span>
      <select className="field-input" {...props}>
        {children}
      </select>
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function FormTextarea({ label, ...props }: TextareaProps) {
  return (
    <label>
      <span className="field-label">
        {label}
        {props.required ? <span className="text-red-600"> *</span> : null}
      </span>
      <textarea className="field-textarea" {...props} />
    </label>
  );
}
