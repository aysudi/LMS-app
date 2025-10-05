import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Base input styles
const baseInputStyles = `
  w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  transition duration-150 ease-in-out text-gray-900
  disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
  placeholder:text-gray-400
`;

// Label styles
const labelStyles = `block text-sm font-medium text-gray-700 mb-1`;

// Helper text styles
const helperTextStyles = `mt-1.5 text-sm text-gray-500`;

// Error styles
const errorStyles = `mt-1.5 text-sm text-red-600`;

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

interface FormTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

export const FormInput = ({
  label,
  helperText,
  error,
  className = "",
  ...props
}: FormInputProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className={labelStyles}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={`${baseInputStyles} ${
          error ? "border-red-300 focus:ring-red-500" : ""
        } ${className}`}
      />
      {helperText && <p className={helperTextStyles}>{helperText}</p>}
      {error && <p className={errorStyles}>{error}</p>}
    </div>
  );
};

export const FormTextArea = ({
  label,
  helperText,
  error,
  className = "",
  ...props
}: FormTextAreaProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className={labelStyles}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`${baseInputStyles} resize-none ${
          error ? "border-red-300 focus:ring-red-500" : ""
        } ${className}`}
      />
      {helperText && <p className={helperTextStyles}>{helperText}</p>}
      {error && <p className={errorStyles}>{error}</p>}
    </div>
  );
};

export const FormSelect = ({
  label,
  helperText,
  error,
  children,
  className = "",
  ...props
}: FormSelectProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={props.id} className={labelStyles}>
          {label}
        </label>
      )}
      <select
        {...props}
        className={`${baseInputStyles} appearance-none pr-8 ${
          error ? "border-red-300 focus:ring-red-500" : ""
        } ${className}`}
      >
        {children}
      </select>
      {helperText && <p className={helperTextStyles}>{helperText}</p>}
      {error && <p className={errorStyles}>{error}</p>}
    </div>
  );
};

// Rich text editor related styles
export const richTextEditorStyles = {
  menuBar: `flex flex-wrap gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg`,
  menuButton: `p-2 rounded hover:bg-gray-200 transition-colors duration-150`,
  menuButtonActive: `bg-gray-200`,
  editor: `p-4 min-h-[300px] prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none`,
  container: `border rounded-lg overflow-hidden bg-white`,
};

// Tag styles
export const tagStyles = {
  container: `inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800`,
  removeButton: `ml-2 text-indigo-400 hover:text-indigo-600 focus:outline-none`,
  input: `${baseInputStyles} pr-10`,
};

// Section styles
export const sectionStyles = {
  container: `bg-white rounded-lg shadow-sm p-6`,
  title: `text-lg font-medium text-gray-900 mb-4`,
  grid: `grid gap-6`,
  gridCols2: `grid-cols-1 md:grid-cols-2`,
};
