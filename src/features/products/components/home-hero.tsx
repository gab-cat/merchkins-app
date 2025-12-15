'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BlurFade } from '@/src/components/ui/animations';
import { useCurrentUser } from '@/src/features/auth/hooks/use-current-user';
import { R2Image } from '@/src/components/ui/r2-image';
import { Plus } from 'lucide-react';

// Joined Organizations Carousel Component
function JoinedOrgsCarousel() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const orgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, user?._id ? { userId: user._id } : 'skip');

  if (isUserLoading || !user || !orgs || orgs.length === 0) {
    return null;
  }

  return (
    <BlurFade delay={0.4}>
      <div className="mt-12 space-y-4">
        <p className="text-sm text-muted-foreground/70 tracking-wide uppercase font-medium">Your Organizations</p>
        <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {orgs.map((org) => (
            <Link key={org._id} href={`/o/${org.slug}`} className="group flex-shrink-0">
              <motion.div
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-border/50 hover:ring-primary/50 transition-all duration-300 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.1, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <R2Image
                  fileKey={org.logo}
                  alt={org.name as string}
                  fill
                  className="object-cover"
                  sizes="80px"
                  fallbackClassName="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.div>
              {/* Org name */}
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground/60 group-hover:text-foreground/80 transition-colors truncate block max-w-[80px]">
                  {org.name}
                </span>
              </div>
            </Link>
          ))}

          {/* Explore more button */}
          <Link href="/orgs" className="group flex-shrink-0">
            <motion.div
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-dashed ring-border/50 hover:ring-primary/50 transition-all duration-300 flex items-center justify-center bg-muted/30 hover:bg-muted/50"
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            </motion.div>
            <div className="mt-2 text-center">
              <span className="text-xs text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">Explore</span>
            </div>
          </Link>
        </div>
      </div>
    </BlurFade>
  );
}

export function HomeHero() {
  const { user, isLoading } = useCurrentUser();

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'there';

  return (
    <section className="relative min-h-[40vh] md:min-h-[60vh] flex items-center justify-center w-full">
      <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
        {/* Minimalist Greeting */}
        <BlurFade delay={0.1}>
          <p className="text-muted-foreground/60 text-sm md:text-base tracking-widest uppercase mb-4">{getGreeting()}</p>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            {isLoading ? (
              <span className="text-foreground/30">Welcome back</span>
            ) : user ? (
              <>
                <span className="text-foreground/90">{firstName}</span>
                <span className="text-muted-foreground/40">.</span>
              </>
            ) : (
              <>
                <span className="text-foreground/90">Welcome to </span>
                <span className="relative inline-block">
                  <span className="relative z-10 inline-flex items-center bg-primary px-3 py-1 md:px-6 md:py-2 rounded-full shadow-lg">
                    <span className="font-genty tracking-normal">
                      <span className="text-white">Merch</span>
                      <span className="text-brand-neon">kins</span>
                    </span>
                  </span>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl scale-110 -z-10" />
                </span>
              </>
            )}
          </h1>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground/70 max-w-xl mx-auto leading-relaxed">
            {user ? 'Ready to explore your merch.' : 'Custom merchandise, made easy.'}
          </p>
        </BlurFade>

        {/* Joined Organizations Carousel - Only shown when user is logged in */}
        <JoinedOrgsCarousel />
      </div>
    </section>
  );
}
