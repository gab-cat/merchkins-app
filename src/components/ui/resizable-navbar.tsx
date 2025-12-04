'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarScrollContextType {
  isScrolled: boolean;
}

const NavbarScrollContext = createContext<NavbarScrollContextType>({ isScrolled: false });

export const useNavbarScroll = () => useContext(NavbarScrollContext);

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: Array<{ name: string; link: string }>;
  className?: string;
  onItemClick?: () => void;
  textColor?: string;
  hoverColor?: string;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MobileNavToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

interface NavbarButtonProps {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
  onClick?: () => void;
}

export function Navbar({ children, className, style }: NavbarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  // Get initial background color from style prop if provided
  const initialBgColor = style?.backgroundColor || 'rgba(255, 255, 255, 0.95)';

  // Extract backgroundColor from style to animate it separately
  const { backgroundColor, ...restStyle } = style || {};

  // Remove backdrop blur from className when scrolled
  const processedClassName = isScrolled ? className?.replace(/supports-\[backdrop-filter\]:backdrop-blur-md/g, '').trim() : className;

  return (
    <NavbarScrollContext.Provider value={{ isScrolled }}>
      <motion.nav
        className={cn('fixed top-0 left-0 right-0 z-50', processedClassName)}
        style={{
          position: 'fixed',
          ...restStyle,
          backdropFilter: isScrolled ? 'none' : undefined,
        }}
        animate={{
          top: isScrolled ? '1rem' : '0',
          paddingLeft: isScrolled ? '1.5rem' : 'clamp(1rem, 4vw, 2rem)',
          paddingRight: isScrolled ? '2rem' : 'clamp(1rem, 4vw, 2rem)',
          height: isScrolled ? '4rem' : '6rem',
          backgroundColor: isScrolled ? 'transparent' : backgroundColor || initialBgColor,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
          mass: 0.5,
        }}
      >
        <motion.div
          className={cn('mx-auto flex items-center w-full h-full', isScrolled && 'supports-[backdrop-filter]:backdrop-blur-sm')}
          style={{
            overflow: 'hidden',
          }}
          animate={{
            maxWidth: isScrolled ? '56rem' : '100%',
            borderRadius: isScrolled ? '9999px' : '0px',
            backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.4)' : initialBgColor,
            paddingLeft: isScrolled ? '1.5rem' : '0',
            paddingRight: isScrolled ? '1.5rem' : '0',
          }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 20,
            mass: 0.5,
          }}
        >
          {children}
        </motion.div>
      </motion.nav>
    </NavbarScrollContext.Provider>
  );
}

export function NavBody({ children, className, visible = true }: NavBodyProps) {
  return (
    <motion.div
      className={cn('flex items-center justify-between w-full relative z-10', className)}
      initial={{ opacity: 0 }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function NavItems({ items, className, onItemClick, textColor, hoverColor }: NavItemsProps) {
  const isHexColor = textColor?.startsWith('#');
  const defaultTextColor = isHexColor ? undefined : textColor || 'text-white';
  const defaultHoverColor = hoverColor || 'hover:text-brand-neon';
  const underlineColor = hoverColor === 'hover:text-primary' ? 'bg-primary' : 'bg-brand-neon';

  return (
    <div className={cn('hidden md:flex items-center gap-6', className)}>
      {items.map((item, index) => (
        <motion.a
          key={item.link}
          href={item.link}
          className={cn('text-sm font-medium transition-colors duration-200 relative group', defaultTextColor, defaultHoverColor)}
          style={isHexColor ? { color: textColor } : undefined}
          onClick={onItemClick}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {item.name}
          <motion.div
            className={cn('absolute bottom-0 left-0 right-0 h-0.5 origin-left', underlineColor)}
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.a>
      ))}
    </div>
  );
}

export function MobileNav({ children, className, visible = false }: MobileNavProps) {
  return (
    <motion.div className={cn('md:hidden', className)} initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return <div className={cn('flex items-center justify-between', className)}>{children}</div>;
}

export function MobileNavMenu({ children, className, isOpen, onClose }: MobileNavMenuProps) {
  return (
    <>
      <motion.div
        className={cn('fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      />
      <motion.div
        className={cn('fixed top-0 left-0 h-full w-80 bg-background border-r shadow-xl z-50 md:hidden p-6 overflow-y-auto', className)}
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </>
  );
}

export function MobileNavToggle({ isOpen, onClick }: MobileNavToggleProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden" aria-label="Toggle menu">
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );
}

export function NavbarButton({ href, as: Component = 'a', children, className, variant = 'primary', onClick }: NavbarButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    dark: 'bg-gray-900 text-white hover:bg-gray-800',
    gradient: 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90',
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Component
        href={href}
        onClick={onClick}
        className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200', variants[variant], className)}
      >
        {children}
      </Component>
    </motion.div>
  );
}
