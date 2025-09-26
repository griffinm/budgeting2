import { useNavigate } from 'react-router-dom';

export function Link({ children, to }: { children: React.ReactNode, to: string }) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
  }

  return (
    <a
      href={to}
      className="cursor-pointer text-neutral-500 hover:text-neutral-700 transition-colors"
      onClick={handleClick}
    >
      {children}
    </a>
  )
}