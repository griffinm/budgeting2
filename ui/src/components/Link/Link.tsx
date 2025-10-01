import { Anchor } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function Link({ href, children }: { href: string; children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <Anchor href={href} className="hover:underline cursor-pointer" onClick={handleLinkClick}>
      {children}
    </Anchor>
  );
}