import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function TypedIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0472 9.05161C11.0472 10.3752 9.97429 11.4481 8.65073 11.4481C7.32717 11.4481 6.25421 10.3752 6.25421 9.05161C6.25421 7.72805 7.32717 6.65509 8.65073 6.65509C9.97429 6.65509 11.0472 7.72805 11.0472 9.05161Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}
        strokeWidth="0.5" 
      />
      <path d="M1.81223 16.075L6.26039 11.6268M6.26039 11.6268L6.01666 15.6502M6.26039 11.6268L2.31459 11.9481" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="2 4"
      />
      <path d="M15.4556 16.1101L11.0074 11.662M11.0074 11.662L11.2512 15.6854M11.0074 11.662L14.9532 11.9833" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="2 4"
      />
      <path d="M1.95065 1.81223L6.39881 6.26039M6.39881 6.26039L2.37539 6.01666M6.39881 6.26039L6.07746 2.31459" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="2 4"
      />
      <path d="M15.2732 1.81223L10.825 6.26039M10.825 6.26039L14.8484 6.01666M10.825 6.26039L11.1464 2.31459" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="2 4"
      />
    </svg>
  )
}