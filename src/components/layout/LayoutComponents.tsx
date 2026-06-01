export const Header: React.FC<React.HTMLAttributes<HTMLHeaderElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <header
      className={`bg-black text-white px-4 py-4 shadow-md ${className}`}
      {...props}
    >
      {children}
    </header>
  );
};

export const Footer: React.FC<React.HTMLAttributes<HTMLFooterElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <footer
      className={`bg-black text-white px-4 py-6 mt-12 ${className}`}
      {...props}
    >
      {children}
    </footer>
  );
};

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
