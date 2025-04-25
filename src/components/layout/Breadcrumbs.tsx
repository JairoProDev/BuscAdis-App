'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumbs" 
      className={`text-sm text-gray-400 dark:text-gray-400 mb-3 ${className}`}
    >
      <ol className="flex flex-wrap items-center space-x-1 md:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          
          return (
            <React.Fragment key={item.href}>
              <li className="flex items-center">
                {isFirst && (
                  <HomeIcon className="h-4 w-4 mr-1 text-gray-400" />
                )}
                
                {isLast || item.active ? (
                  <span 
                    className="font-medium text-white" 
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href}
                    className="hover:text-gray-300 transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              
              {!isLast && (
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 