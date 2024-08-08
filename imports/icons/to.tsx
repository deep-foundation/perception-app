import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function ToIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="21" height="13" viewBox="0 0 21 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 6.21901H19.9637M19.9637 6.21901L14.4651 11.1401M19.9637 6.21901L14.4651 1.50001" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        />
      <circle cx="4.215" cy="6.215" r="3.715" 
        strokeWidth="0.5" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
      />
    </svg>
  )
}