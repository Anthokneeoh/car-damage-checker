// app/layout.tsx
export const metadata = {
  title: 'Car Damage Checker',
  description: 'AI-powered car damage assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}