import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function FromIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16.815" cy="6.715" r="3.715" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth='0.5'
      />
      <path d="M1 1V12.4545" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeLinecap="round"
      />
      <path d="M1 6.72726L12.5237 6.72726" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeLinecap="round"
      />
    </svg>
  )
}