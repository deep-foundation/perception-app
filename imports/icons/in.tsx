import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function InIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.2793 2.73366L6.34862 7.66435M6.34862 7.66435L6.51536 3.93844M6.34862 7.66435L10.0187 7.44183" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M11.2474 17.2303L6.31667 12.2996M6.31667 12.2996L10.0426 12.4663M6.31667 12.2996L6.53919 15.9697" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M14.368 9.98359H7.39493M7.39493 9.98359L10.1474 7.46688M7.39493 9.98359L10.1474 12.4214" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}  
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path d="M5.29 9.99501C5.29 11.3177 4.21772 12.39 2.895 12.39C1.57228 12.39 0.5 11.3177 0.5 9.99501C0.5 8.67228 1.57228 7.60001 2.895 7.60001C4.21772 7.60001 5.29 8.67228 5.29 9.99501Z" 
        strokeWidth="0.5"
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
      />
    </svg>
  )
}