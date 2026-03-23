import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
    label, 
    error, 
    helperText,
    required,
    children,
    className,
    style,
    ...props
}) => {
    return (
        <div style={{ marginBottom: '1.25rem', ...style }}>
            <label style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            
            <div style={{ position: 'relative' }}>
                {children ? children : (
                    <input
                        className={`admin-select ${className || ''}`}
                        style={{ 
                            width: '100%',
                            padding: '12px',
                            border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        required={required}
                        {...props}
                    />
                )}
            </div>

            {error && (
                <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#ef4444', 
                    marginTop: '6px',
                    fontWeight: 600
                }}>
                    {error}
                </p>
            )}
            
            {helperText && !error && (
                <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)', 
                    marginTop: '6px'
                }}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default FormField;
