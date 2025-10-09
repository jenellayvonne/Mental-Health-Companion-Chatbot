import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" {...props} />;
};
