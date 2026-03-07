import { useNavigate } from 'react-router-dom';

export function Link({ children, to, onClick }: { children: React.ReactNode, to: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  }

  return (
    <a
      href={to}
      className="cursor-pointer text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      onClick={handleClick}
    >
      {children}
    </a>
  )
}