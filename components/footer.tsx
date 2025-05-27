import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t bg-background py-4 text-center text-sm text-muted-foreground">
    <div className="container mx-auto px-4">
      Built with <span role="img" aria-label="heart">❤️</span> by {' '}
      <a
        href="https://instagram.com/wolfofdalalst19" 
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
      >
        wolfofdalalst
      </a>
      . The source code is available on{' '}
      <a
        href="https://github.com/wolfofdalalst/aether"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
      >
        GitHub
      </a>
      .
    </div>
    </footer>
  );
};

export default Footer;