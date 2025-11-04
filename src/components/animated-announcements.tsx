'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { fadeInUp, fadeInUpContainer } from '@/lib/animations';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category?: string;
  publishedAt: number;
}

interface AnimatedAnnouncementsProps {
  announcements: Announcement[];
}

export function AnimatedAnnouncements({ announcements }: AnimatedAnnouncementsProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <motion.section
      className="container mx-auto px-3 pt-6 sm:pt-8"
      variants={fadeInUpContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-primary">
            <Megaphone className="h-4 w-4" />
            <span>Announcements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.map((a) => (
              <motion.div key={a._id} className="rounded-lg border bg-card p-2.5" variants={fadeInUp}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                      <span className="truncate max-w-[120px]">{a.category || 'General'}</span>
                    </span>
                    <div className="truncate font-medium" title={a.title}>
                      {a.title}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{a.content}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
