// SuccessMessage.tsx
'use client';

import React from 'react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  return (
    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
      {message}
    </div>
  );
};

export default SuccessMessage;