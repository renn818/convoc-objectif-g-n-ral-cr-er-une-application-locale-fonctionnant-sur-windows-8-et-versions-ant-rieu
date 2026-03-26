'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ListOrdered, 
  Vote, 
  Library, 
  Download, 
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/import', label: 'Importer', icon: FileText },
  { href: '/ordre-du-jour', label: 'Ordre du jour', icon: ListOrdered },
  { href: '/resolutions', label: 'Résolutions', icon: Vote },
  { href: '/bibliotheque', label: 'Bibliothèque', icon: Library },
  { href: '/export', label: 'Exporter', icon: Download },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary font-heading">CONVOC</h1>
          <p className="text-xs text-muted mt-1">Gestion des AG Copropriétés</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx('sidebar-link', isActive && 'active')}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className={clsx(
            'flex items-center gap-2 text-sm px-3 py-2 rounded',
            isOnline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          )}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}