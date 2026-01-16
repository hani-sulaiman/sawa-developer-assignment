import { TextInput, TextInputProps, PasswordInput, PasswordInputProps, Textarea, TextareaProps, Select, SelectProps } from '@mantine/core';
import { forwardRef } from 'react';

const inputStyles = {
  input: `
    h-12 px-4 pl-12
    bg-white dark:bg-gray-800 
    border-2 border-gray-200 dark:border-gray-700 rounded-xl
    text-gray-800 dark:text-gray-100 text-base font-medium
    placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal
    focus:border-primary-500 dark:focus:border-primary-400 
    focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/20
    transition-all duration-200
  `,
  label: 'text-gray-700 dark:text-gray-200 font-semibold text-sm mb-2',
  error: 'text-red-500 dark:text-red-400 text-sm mt-1.5',
  section: 'w-12 text-gray-400 dark:text-gray-500',
};

interface StyledInputProps extends TextInputProps {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        classNames={{
          input: inputStyles.input,
          label: inputStyles.label,
          error: inputStyles.error,
          section: inputStyles.section,
        }}
        styles={{
          input: {
            paddingLeft: props.leftSection ? '48px' : '16px',
          },
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

interface StyledPasswordInputProps extends PasswordInputProps {
  error?: string;
}

export const PasswordInputField = forwardRef<HTMLInputElement, StyledPasswordInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <PasswordInput
        ref={ref}
        classNames={{
          input: inputStyles.input,
          label: inputStyles.label,
          error: inputStyles.error,
          section: inputStyles.section,
          innerInput: 'h-full pl-12',
        }}
        styles={{
          innerInput: {
            paddingLeft: props.leftSection ? '48px' : '16px',
          },
        }}
        {...props}
      />
    );
  }
);

PasswordInputField.displayName = 'PasswordInputField';

interface StyledTextareaProps extends TextareaProps {
  error?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        classNames={{
          input: `
            min-h-[120px] p-4
            bg-white dark:bg-gray-800 
            border-2 border-gray-200 dark:border-gray-700 rounded-xl
            text-gray-800 dark:text-gray-100 text-base font-medium
            placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal
            focus:border-primary-500 dark:focus:border-primary-400 
            focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/20
            transition-all duration-200 resize-none
          `,
          label: inputStyles.label,
          error: inputStyles.error,
        }}
        {...props}
      />
    );
  }
);

TextareaField.displayName = 'TextareaField';

interface StyledSelectProps extends SelectProps {
  error?: string;
}

export const SelectField = forwardRef<HTMLInputElement, StyledSelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <Select
        ref={ref}
        classNames={{
          input: inputStyles.input,
          label: inputStyles.label,
          error: inputStyles.error,
          section: inputStyles.section,
          dropdown: 'rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-xl p-2',
          option: 'rounded-lg py-2.5 px-3 text-gray-800 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 data-[selected]:bg-primary-100 dark:data-[selected]:bg-primary-900/30 data-[selected]:text-primary-700 dark:data-[selected]:text-primary-300',
        }}
        styles={{
          input: {
            paddingLeft: props.leftSection ? '48px' : '16px',
          },
        }}
        {...props}
      />
    );
  }
);

SelectField.displayName = 'SelectField';
