import React from 'react';
import { useColorMode } from "@chakra-ui/react";

export function UpIcon({
  strokePath = '#000',
  strokeCircle = '#000',
}:{
  strokePath?: string;
  strokeCircle?: string;
}) {
  const { colorMode } = useColorMode();
  return (
    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.02392 14.4655C1.68155 14.9684 1.81392 15.659 2.33829 16.0043C2.86266 16.3495 3.56232 16.2068 3.90469 15.7038C4.24707 15.2009 4.11469 14.5103 3.59032 14.1651C3.06595 13.8198 2.3663 13.9625 2.02392 14.4655Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5"
      />
      <path d="M12.5639 3.8095C13.0633 3.07582 12.8657 2.07791 12.1132 1.58244C11.3607 1.08697 10.3473 1.28755 9.84787 2.02124C9.34842 2.75492 9.54598 3.75283 10.2985 4.2483C11.051 4.74376 12.0644 4.54319 12.5639 3.8095Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}
        strokeWidth="1"
      />
      <path d="M12.1462 14.4655C12.4886 14.9684 12.3562 15.659 11.8319 16.0043C11.3075 16.3495 10.6079 16.2068 10.2655 15.7038C9.9231 15.2009 10.0555 14.5103 10.5798 14.1651C11.1042 13.8198 11.8039 13.9625 12.1462 14.4655Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="0.5"
      />
      <path d="M1.60632 3.8095C1.10687 3.07582 1.30443 2.07791 2.05693 1.58244C2.80943 1.08697 3.82285 1.28755 4.3223 2.02124C4.82175 2.75492 4.62419 3.75283 3.87169 4.2483C3.11919 4.74376 2.10577 4.54319 1.60632 3.8095Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'}
        strokeWidth="1"
      />


      <path d="M8.20461 8.89081C8.20461 9.48348 7.71143 9.99228 7.06782 9.99228C6.42421 9.99228 5.93103 9.48348 5.93103 8.89081C5.93103 8.29813 6.42421 7.78934 7.06782 7.78934C7.71143 7.78934 8.20461 8.29813 8.20461 8.89081Z" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        strokeWidth="1"
      />
      <path d="M8.21705 10.3524L10.1023 12.93M10.1023 12.93L8.80066 12.3202M10.1023 12.93L9.89807 11.5176" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        stroke-linecap="round" 
        strokeLinejoin="round"
        strokeWidth="0.5"
      />
      <path d="M4.1634 4.44231L5.88946 6.80235M5.88946 6.80235L4.65068 6.27845M5.88946 6.80235L5.74809 5.47584" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        stroke-linecap="round" 
        strokeLinejoin="round"
        strokeWidth="0.5"
      />
      <path d="M9.96193 4.39263L8.19953 6.80236M8.19953 6.80236L9.45266 6.25885M8.19953 6.80236L8.35525 5.45623" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        stroke-linecap="round" 
        strokeLinejoin="round"
        strokeWidth="0.5"
      />
      <path d="M5.87194 10.3524L3.98672 12.93M3.98672 12.93L5.28833 12.3202M3.98672 12.93L4.19092 11.5176" 
        stroke={colorMode === 'dark' ? '#fff' : '#19202B'} 
        stroke-linecap="round" 
        strokeLinejoin="round"
        strokeWidth="0.5"
      />
    </svg>
  )
}
