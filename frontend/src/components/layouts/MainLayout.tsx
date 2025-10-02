'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  MapPin, 
  Receipt, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navigation = [
    { name: t('dashboard'), href: '/', icon: Home },
    { name: t('trips'), href: '/trips', icon: MapPin },
    { name: t('expenses'), href: '/expenses', icon: Receipt },
    { name: t('reports'), href: '/reports', icon: BarChart3 },
    { name: t('settings'), href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/vi' || pathname === '/en';
    }
    return pathname.includes(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-2">
              <h1 className="text-xl font-bold text-gray-900">TripEasy</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive(item.href)
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Language switcher */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center space-x-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <Link
              href="/vi"
              className={`text-sm ${pathname.includes('/vi') ? 'text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              VI
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/en"
              className={`text-sm ${pathname.includes('/en') ? 'text-primary-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden ml-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex justify-between items-center px-4 lg:px-6">
            <div className="flex-1" />
            {/* Add user menu or other top bar items here */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
