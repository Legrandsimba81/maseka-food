import React from 'react';
import { Hamburger, Pizza, Croissant, Sandwich } from 'lucide-react';

export default function FoodBar() {
  return (
    <div className="w-full h-[50px] bg-[#ffdabb] dark:bg-gray-800 text-[#7a472a] dark:text-gray-300 flex justify-around items-center px-4 overflow-hidden text-base max-[600px]:text-sm max-[400px]:text-xs font-sans">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Hamburger size={16} className="text-[#7a472a] dark:text-gray-300" />
        <span>Hamburger</span>
      </div>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Pizza size={16} className="text-[#7a472a] dark:text-gray-300" />
        <span>Pizza</span>
      </div>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Croissant size={16} className="text-[#7a472a] dark:text-gray-300" />
        <span>Boulangerie</span>
      </div>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Sandwich size={16} className="text-[#7a472a] dark:text-gray-300" />
        <span>Fast Food</span>
      </div>
    </div>
  );
}