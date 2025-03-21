import React from 'react';

const Badge = ({ children, className }) => (
    <span className={`inline-block px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded ${className}`}>
        {children}
    </span>
);

export default Badge;
