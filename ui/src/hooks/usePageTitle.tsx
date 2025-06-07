import { useEffect, useState } from "react";

export function usePageTitle() {
  const [currentTitle, setCurrentTitle] = useState('');
  
  useEffect(() => {
    const fullTitle = currentTitle ? `${currentTitle} | Budgeting` : 'Budgeting';
    document.title = fullTitle;
  }, [currentTitle]);

  return setCurrentTitle;
}
