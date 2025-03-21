import React from 'react';

const Card = ({ children }) => (
    <div className="border rounded-md shadow-md p-4">{children}</div>
);

const CardHeader = ({ children }) => <div className="font-bold">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg">{children}</h3>;

export { Card, CardHeader, CardContent, CardTitle };
