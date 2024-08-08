import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function DownIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.02385 3.03816C1.68148 2.53526 1.81385 1.84466 2.33822 1.49936C2.86259 1.15416 3.56225 1.29686 3.90462 1.79986C4.247 2.30276 4.11462 2.99336 3.59025 3.33856C3.06588 3.68386 2.36623 3.54116 2.02385 3.03816Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5"/>
      <path d="M12.5639 13.6941C13.0633 14.4278 12.8657 15.4257 12.1132 15.9212C11.3607 16.4166 10.3473 16.2161 9.84787 15.4824C9.34842 14.7487 9.54598 13.7508 10.2985 13.2553C11.051 12.7599 12.0644 12.9604 12.5639 13.6941Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}/>
      <path d="M12.1462 3.03816C12.4886 2.53526 12.3562 1.84466 11.8319 1.49936C11.3075 1.15416 10.6079 1.29686 10.2655 1.79986C9.92311 2.30276 10.0555 2.99336 10.5798 3.33856C11.1042 3.68386 11.8039 3.54116 12.1462 3.03816Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5"/>
      <path d="M1.60633 13.6941C1.10688 14.4278 1.30444 15.4257 2.05694 15.9212C2.80944 16.4166 3.82286 16.2161 4.32231 15.4824C4.82176 14.7487 4.6242 13.7508 3.8717 13.2553C3.1192 12.7599 2.10578 12.9604 1.60633 13.6941Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}/>
      <path d="M8.20455 8.61285C8.20455 8.02018 7.71137 7.51138 7.06776 7.51138C6.42415 7.51138 5.93097 8.02018 5.93097 8.61285C5.93097 9.20553 6.42415 9.71432 7.06776 9.71432C7.71137 9.71432 8.20455 9.20553 8.20455 8.61285Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}/>
      <path d="M8.21698 9.57367L10.1022 12.1513M10.1022 12.1513L8.80059 11.5415M10.1022 12.1513L9.898 10.7389" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M4.10001 3.60001L5.82607 5.96005M5.82607 5.96005L4.58729 5.43615M5.82607 5.96005L5.6847 4.63354" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M10.0324 3.59L8.26999 5.99973M8.26999 5.99973L9.52312 5.45622M8.26999 5.99973L8.42571 4.6536" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M5.87194 9.57367L3.98672 12.1513M3.98672 12.1513L5.28833 11.5415M3.98672 12.1513L4.19092 10.7389" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}