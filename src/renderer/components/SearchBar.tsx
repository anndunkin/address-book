import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function SearchBar({ value, onChange, inputRef }: SearchBarProps): JSX.Element {
  return (
    <input
      ref={inputRef}
      className="search-input"
      type="search"
      placeholder="Search name, company, email, phone…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search contacts"
    />
  );
}
