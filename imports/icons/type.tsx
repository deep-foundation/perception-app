import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function TypeIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg
      width="18" height="12" viewBox="0 0 25 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      
      <path d="M11.3765 5.99997C11.3765 9.04243 8.93684 11.5 5.93824 11.5C2.93965 11.5 0.5 9.04243 0.5 5.99997C0.5 2.95751 2.93965 0.499969 5.93824 0.499969C8.93684 0.499969 11.3765 2.95751 11.3765 5.99997Z" stroke={colorMode === 'dark' ? '#fff' : '#19202B'} strokeWidth="1" />
      <path
        d="M12.5363 6.05236H24M24 6.05236L18.5014 10.9735M24 6.05236L18.5014 1.33335" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="2 4"
      />
    </svg>
  )
}