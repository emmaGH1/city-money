'use client';

import Link from 'next/link';
import { ArrowUpRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function SiteHeader({ workspace = false }: { workspace?: boolean }) {
  const links = workspace ? [{ href: '/', label: 'The story' }, { href: '#receipts', label: 'On-chain proof' }] : [{ href: '#how-it-works', label: 'How it works' }, { href: '#proof', label: 'On-chain proof' }];
  return <header className="site-header">
    <Link href="/" className="wordmark" aria-label="City Money home"><span className="logo-mark" aria-hidden="true">⌂</span> CITY MONEY<span className="wordmark-period">.</span></Link>
    <div className="header-actions">
      <NavigationMenu className="city-navigation" viewport={false} aria-label="Main navigation"><NavigationMenuList>{links.map(link => <NavigationMenuItem key={link.href}><NavigationMenuLink asChild><Link href={link.href}>{link.label}</Link></NavigationMenuLink></NavigationMenuItem>)}</NavigationMenuList></NavigationMenu>
      <span className="network-label"><span aria-hidden="true" />Monad testnet</span>
      {!workspace && <Button asChild className="header-cta"><Link href="/workspace">Use City Money<ArrowUpRight size={16} aria-hidden="true" /></Link></Button>}
      <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" className="mobile-menu-trigger" aria-label="Open navigation"><Menu size={21} aria-hidden="true" /></Button></SheetTrigger><SheetContent className="city-menu" side="right"><SheetHeader><SheetTitle>City Money</SheetTitle><SheetDescription>A neighborhood-sized benefit. Cleanverse eligibility, Monad settlement.</SheetDescription></SheetHeader><nav aria-label="Mobile navigation">{links.map(link => <SheetClose asChild key={link.href}><Link href={link.href}>{link.label}<ArrowUpRight size={20} aria-hidden="true" /></Link></SheetClose>)}<SheetClose asChild><Button asChild className="button-primary"><Link href="/workspace">Open the workspace<ArrowUpRight size={20} aria-hidden="true" /></Link></Button></SheetClose></nav><p className="menu-footnote">Fictional program · genuine CVA · testnet credits</p></SheetContent></Sheet>
    </div>
  </header>;
}
