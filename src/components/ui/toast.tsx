'use client';

import * as React from 'react';

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastViewport = () => {
  return <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 p-4"></div>;
};

const Toast = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className="bg-white border rounded-md shadow-sm p-4"
    >
      {children}
    </div>
  );
};

const ToastTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-sm font-semibold">{children}</h3>;
};

const ToastDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-500">{children}</p>;
};

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription };