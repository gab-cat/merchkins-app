'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/src/features/auth/hooks/use-current-user';
import { Id } from '@/convex/_generated/dataModel';

interface ChatwootProviderProps {
  websiteToken: string;
  baseUrl?: string;
  organizationId?: Id<'organizations'>;
  primaryColor?: string; // Hex color for the widget theme
}

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      setUser: (
        identifier: string,
        userData: {
          email?: string;
          name?: string;
          avatar_url?: string;
          phone_number?: string;
          identifier_hash?: string;
        }
      ) => void;
      reset: () => void;
      toggle: (state?: 'open' | 'close') => void;
      setCustomAttributes: (attributes: Record<string, unknown>) => void;
      deleteCustomAttribute: (attributeKey: string) => void;
      setLocale: (locale: string) => void;
      setLabel: (label: string) => void;
      removeLabel: (label: string) => void;
      toggleBubbleVisibility: (state: 'show' | 'hide') => void;
      popoutChatWindow: () => void;
    };
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: 'left' | 'right';
      locale?: string;
      type?: 'standard' | 'expanded_bubble';
      darkMode?: 'light' | 'auto';
      launcherTitle?: string;
      widgetStyle?: string; // CSS to customize widget appearance
    };
  }
}

export function ChatwootProvider({
  websiteToken,
  baseUrl = 'https://chat.merchkins.com',
  organizationId,
  primaryColor = '#1d43d8',
}: ChatwootProviderProps) {
  const { userId: clerkId, isLoaded: authLoaded } = useAuth();
  const { user } = useCurrentUser();
  const generateHmac = useAction(api.users.actions.generateChatwootHmac.generateChatwootHmac);
  const [sdkReady, setSdkReady] = useState(false);
  const scriptLoadedRef = useRef(false);
  const initializedRef = useRef(false);
  const lastOrgIdRef = useRef<string | undefined>(organizationId);

  // Debug log for provider mount
  useEffect(() => {
    console.log('[Chatwoot] Provider mounted', {
      websiteToken: websiteToken.substring(0, 8) + '...',
      baseUrl,
      organizationId,
      primaryColor,
    });
  }, [websiteToken, baseUrl, organizationId, primaryColor]);

  // Reset user initialization when organization changes
  useEffect(() => {
    if (lastOrgIdRef.current !== organizationId) {
      lastOrgIdRef.current = organizationId;
      // Reset so user info is re-sent with new HMAC for the new org
      if (initializedRef.current && window.$chatwoot) {
        console.log('[Chatwoot] Organization changed, resetting user');
        window.$chatwoot.reset();
        initializedRef.current = false;
      }
    }
  }, [organizationId]);

  // Load Chatwoot SDK script
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    // Configure Chatwoot widget settings before SDK loads
    window.chatwootSettings = {
      type: 'expanded_bubble',
      launcherTitle: 'Chat with us',
      position: 'right',
      darkMode: 'light',
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[data-chatwoot-sdk]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      // Wait for SDK to be ready
      const checkReady = () => {
        if (window.chatwootSDK) {
          setSdkReady(true);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
      return;
    }

    scriptLoadedRef.current = true;

    // Create and load script
    const script = document.createElement('script');
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;
    script.setAttribute('data-chatwoot-sdk', 'true');

    script.onload = () => {
      // Initialize Chatwoot SDK
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken,
          baseUrl,
        });
      }
    };

    document.head.appendChild(script);

    // Listen for SDK ready event
    const handleReady = () => {
      setSdkReady(true);
    };

    window.addEventListener('chatwoot:ready', handleReady);

    return () => {
      window.removeEventListener('chatwoot:ready', handleReady);
    };
  }, [websiteToken, baseUrl]);

  // Initialize user when SDK is ready and user is authenticated
  useEffect(() => {
    if (!sdkReady || !authLoaded || !user || !clerkId || initializedRef.current) return;

    const initializeUser = async () => {
      try {
        // Generate HMAC for identity validation
        const identifier = user._id;
        const identifierHash = await generateHmac({
          identifier,
          organizationId,
        });

        // Set user information in Chatwoot
        if (window.$chatwoot) {
          const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

          window.$chatwoot.setUser(identifier, {
            email: user.email,
            name: userName,
            avatar_url: user.imageUrl || undefined,
            phone_number: user.phone || undefined,
            identifier_hash: identifierHash,
          });

          initializedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize Chatwoot user:', error);
      }
    };

    initializeUser();
  }, [sdkReady, authLoaded, user, clerkId, organizationId, generateHmac]);

  // Reset session when user logs out
  useEffect(() => {
    if (!sdkReady || !authLoaded) return;

    // If user was logged in but now is not, reset the session
    if (initializedRef.current && !user && !clerkId) {
      if (window.$chatwoot) {
        window.$chatwoot.reset();
        initializedRef.current = false;
      }
    }
  }, [sdkReady, authLoaded, user, clerkId]);

  // Inject custom CSS for widget primary color
  useEffect(() => {
    if (!sdkReady || !primaryColor) return;

    const styleId = 'chatwoot-custom-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // Custom CSS to override Chatwoot widget colors
    // Targets bubble, header, send button, and other accent elements
    styleEl.textContent = `
      /* Main bubble button */
      .woot-widget-bubble {
        background-color: ${primaryColor} !important;
      }
      .woot-widget-bubble:hover {
        background-color: ${primaryColor} !important;
        filter: brightness(1.1);
      }
      /* Close button lines */
      .woot--close::before,
      .woot--close::after {
        background-color: white !important;
      }
      /* Widget header background */
      .woot-widget-holder .header-wrap {
        background-color: ${primaryColor} !important;
      }
      /* Send button */
      .woot-widget-holder .send-button {
        background-color: ${primaryColor} !important;
      }
      /* Unread indicator */
      .woot-widget-bubble .unread-count {
        background-color: ${primaryColor} !important;
      }
      /* Launcher expanded bubble background */
      .woot-widget-bubble.woot--expanded {
        background-color: ${primaryColor} !important;
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [sdkReady, primaryColor]);

  return null;
}
