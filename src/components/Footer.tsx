export function Footer() {
  const footerLinks = [
    { label: "© 2026 The New York Times Company", href: "#" },
    { label: "NYTimes.com", href: "#" },
    { label: "Sitemap", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Terms of Sale", href: "#" },
    { label: "Your Privacy Choices", href: "#" },
  ];

  return (
    <footer className="border-t py-4 mt-auto bg-background">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground whitespace-nowrap">
          {footerLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
