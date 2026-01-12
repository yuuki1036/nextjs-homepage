import { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href: string;
  className?: string;
};

const ExternalLink: FC<Props> = ({ children, href, className }) => (
  <a href={href} className={className} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default ExternalLink;
