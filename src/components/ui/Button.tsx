import React from 'react';

const Button = ({ className, ...props }) => (
    <button className={`bg-blue-500 text-white rounded-md p-2 ${className}`} {...props} />
);

export default Button;
