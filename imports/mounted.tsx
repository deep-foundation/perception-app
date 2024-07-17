import React, { useEffect, useState } from 'react';

export function Mounted({ children }: { children?: any; }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);
  return <>{mounted ? children : null }</>;
}