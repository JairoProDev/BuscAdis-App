import React from 'react';

const Select = ({ children, defaultValue, onChange, ...props }) => (
    <select defaultValue={defaultValue} onChange={onChange} className="border rounded-md p-2" {...props}>
        {children}
    </select>
);

const SelectTrigger = ({ children }) => (
    <div className="cursor-pointer">{children}</div>
);

const SelectContent = ({ children }) => (
    <div className="absolute bg-white border rounded-md">{children}</div>
);

const SelectItem = ({ children, ...props }) => (
    <option {...props}>{children}</option>
);

const SelectValue = ({ placeholder }) => (
    <option value="">{placeholder}</option>
);

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
