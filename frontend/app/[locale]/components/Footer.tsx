'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl'; // Added for translations

const Footer = () => {
  const t = useTranslations('footer'); // Namespace to 'footer' in JSON
  const currentYear = new Date().getFullYear();

  const navigation = {
    services: [
      { name: t('services.webDevelopment'), href: '/services/web' },
      { name: t('services.mobileApps'), href: '/services/mobile' },
      { name: t('services.uiUxDesign'), href: '/services/design' },
      { name: t('services.consulting'), href: '/services/consulting' },
    ],
    company: [
      { name: t('company.aboutUs'), href: '/about' },
      { name: t('company.ourTeam'), href: '/team' },
      { name: t('company.careers'), href: '/careers' },
      { name: t('company.contact'), href: '/contact' },
    ],
    support: [
      { name: t('support.helpCenter'), href: '/help' },
      { name: t('support.documentation'), href: '/docs' },
      { name: t('support.privacyPolicy'), href: '/privacy' },
      { name: t('support.termsOfService'), href: '/terms' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: Facebook },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'Instagram', href: '#', icon: Instagram },
      { name: 'LinkedIn', href: '#', icon: Linkedin },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-3xl group-hover:animate-pulse transition-all duration-300">🧠</span>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                  Syria
                </span>
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  {t('brand.subtitle')}
                </span>
              </div>
            </Link>
            
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              {t('brand.description')}
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{t('contact.email')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Phone className="h-4 w-4 text-blue-500" />
                <span>{t('contact.phone')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{t('contact.address')}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {t('services.title')}
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {t('company.title')}
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              {t('support.title')}
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {t('newsletter.title')}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {t('newsletter.description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-96">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {t('newsletter.button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-800/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Copyright */}
            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
              <span>{t('copyright', { year: currentYear })}</span> {/* Dynamic year */}
              <Heart className="h-4 w-4 mx-1 text-red-500 fill-current animate-pulse" />
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {navigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                    aria-label={item.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
