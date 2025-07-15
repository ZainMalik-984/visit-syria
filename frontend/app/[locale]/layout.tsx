import { NextIntlClientProvider } from 'next-intl'; // Client provider (ensure 'use client' in Providers)
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/components/Providers'; // Your client wrapper (must include Redux <Provider>)
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/globals.css';
import { getMessages } from 'next-intl/server'; // Server-side messages

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist({ variable: '--font-geist-mono', subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Unwrap locale on server
  const messages = await getMessages(); // Load messages server-side

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Providers is your client component (Redux + bootstrap) - ensure it has <Provider> inside */}
        <Providers>
          {/* Nest NextIntlClientProvider inside Providers for client-side translation context */}
          <NextIntlClientProvider messages={messages}>
            <Header />
            {/* ProtectedRoute can be used here if needed */}
            {/* <ProtectedRoute> */}
            {children}
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
