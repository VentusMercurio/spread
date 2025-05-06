export const metadata = {
    title: 'Oracle Spread',
    description: 'A three-card divination with Sophia, the Oracle Unbound',
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  