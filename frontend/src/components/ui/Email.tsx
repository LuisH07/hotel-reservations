import { forwardRef } from "react";
import styles from "./Email.module.css";

interface EmailProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  message: string;
  label: string;
  required: boolean;
  value: string;
  disabled: boolean;
}

const EmailInput = forwardRef<HTMLInputElement, EmailProps>(({
  onChange,
  name,
  message,
  label,
  required,
  value,
  disabled
}, ref) => {
  return (
    <div>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        type="email"
        id={name}
        name={name}
        className={styles.input}
        placeholder={message}
        value={value}
        onChange={(e) => onChange({ target: { name: e.target.name, value: e.target.value } })}
        disabled={disabled}
        required={required}
        ref={ref}
      />
    </div>
  );
});

export default EmailInput;