import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function OutIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="7.19104" y1="8.70264" x2="7.19104" y2="9.56306" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <path d="M8 9L13 9" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <line x1="5.72974" y1="12.1213" x2="5.12133" y2="12.7297" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <path d="M6.09149 12.9036L9.62703 16.4391" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <line x1="1.5" y1="-1.5" x2="2.36042" y2="-1.5" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 5.72998 8.29999)" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <path d="M6.09174 5.39638L9.62727 1.86084" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      <circle cx="2.89506" cy="9.195" r="2.395" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5"
      />
    </svg>
  )
}