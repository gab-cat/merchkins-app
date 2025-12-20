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
  inbox?: 'admin' | 'platform' | 'org'; // Which inbox type for HMAC validation
  launcherTitle?: string; // Custom title for the chat bubble
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
  inbox,
  launcherTitle = 'Chat with us',
}: ChatwootProviderProps) {
  const { userId: clerkId, isLoaded: authLoaded } = useAuth();
  const { user } = useCurrentUser();
  const generateHmac = useAction(api.users.actions.generateChatwootHmac.generateChatwootHmac);
  const [sdkReady, setSdkReady] = useState(false);
  const initializedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
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

  /**
   * Destroy existing Chatwoot widget completely
   * This removes the iframe, bubble, script, and resets SDK state
   */
  const destroyChatwootWidget = (removeScript = false) => {
    console.log('[Chatwoot] Destroying widget', { removeScript });

    // Reset the $chatwoot session
    if (window.$chatwoot) {
      try {
        window.$chatwoot.reset();
      } catch (e) {
        // Ignore errors during reset
      }
    }

    // Remove the widget holder iframe
    const widgetHolder = document.querySelector('.woot-widget-holder');
    if (widgetHolder) {
      widgetHolder.remove();
    }

    // Remove the bubble element
    const bubble = document.querySelector('.woot-widget-bubble');
    if (bubble) {
      bubble.remove();
    }

    // Remove any woot elements
    const wootElements = document.querySelectorAll('[class^="woot"]');
    wootElements.forEach((el) => el.remove());

    // Remove the SDK script if requested (needed when token changes)
    if (removeScript) {
      const existingScript = document.querySelector('script[data-chatwoot-sdk]');
      if (existingScript) {
        existingScript.remove();
      }
      // Clear SDK references completely
      delete window.chatwootSDK;
    }

    // Clear widget reference
    delete window.$chatwoot;

    initializedRef.current = false;
    setSdkReady(false);
  };

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

  // Handle websiteToken changes - destroy and reinitialize widget
  useEffect(() => {
    // If token changed, we need to destroy completely and reinitialize
    if (lastTokenRef.current && lastTokenRef.current !== websiteToken) {
      console.log('[Chatwoot] Token changed from', lastTokenRef.current.substring(0, 8), 'to', websiteToken.substring(0, 8));
      // Remove script too so SDK reloads with new token
      destroyChatwootWidget(true);
    }

    lastTokenRef.current = websiteToken;
  }, [websiteToken]);

  // Load Chatwoot SDK script and initialize widget
  useEffect(() => {
    console.log('[Chatwoot] SDK loading effect running', {
      websiteToken: websiteToken.substring(0, 8) + '...',
      baseUrl,
      existingScript: !!document.querySelector('script[data-chatwoot-sdk]'),
      hasChatwootSDK: !!window.chatwootSDK,
      has$chatwoot: !!window.$chatwoot,
    });

    // Configure Chatwoot widget settings before SDK loads
    window.chatwootSettings = {
      type: 'expanded_bubble',
      launcherTitle,
      position: 'right',
      darkMode: 'light',
    };

    const initializeWidget = () => {
      console.log('[Chatwoot] initializeWidget called, chatwootSDK exists:', !!window.chatwootSDK);
      if (window.chatwootSDK) {
        console.log('[Chatwoot] Initializing widget with token', websiteToken.substring(0, 8) + '...');
        window.chatwootSDK.run({
          websiteToken,
          baseUrl,
        });
        // Reset user initialization flag so user info is resent for the new widget
        initializedRef.current = false;
      }
    };

    // Check if script already exists (shouldn't happen after cleanup, but safety check)
    const existingScript = document.querySelector('script[data-chatwoot-sdk]');
    if (existingScript && window.chatwootSDK) {
      // This shouldn't happen after proper cleanup, but handle it
      console.log('[Chatwoot] Script already exists, reinitializing widget');
      initializeWidget();
    } else if (existingScript) {
      // Script exists but SDK not ready yet, wait for it
      console.log('[Chatwoot] Script exists but SDK not ready, waiting...');
    } else {
      console.log('[Chatwoot] Loading SDK script from', `${baseUrl}/packs/js/sdk.js`);
      // Create and load script
      const script = document.createElement('script');
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.defer = true;
      script.async = true;
      script.setAttribute('data-chatwoot-sdk', 'true');

      script.onload = () => {
        console.log('[Chatwoot] Script loaded successfully');
        initializeWidget();
      };

      script.onerror = (e) => {
        console.error('[Chatwoot] Script failed to load', e);
      };

      document.head.appendChild(script);
      console.log('[Chatwoot] Script appended to head');
    }

    // Listen for SDK ready event - this is the reliable way to know when widget is ready
    const handleReady = () => {
      console.log('[Chatwoot] Widget ready event received');
      setSdkReady(true);
    };

    window.addEventListener('chatwoot:ready', handleReady);

    // Cleanup: destroy widget on unmount
    return () => {
      window.removeEventListener('chatwoot:ready', handleReady);
      console.log('[Chatwoot] Provider unmounting, destroying widget');
      destroyChatwootWidget(true);
    };
  }, [websiteToken, baseUrl]);

  // Initialize user when SDK is ready and user is authenticated
  useEffect(() => {
    if (!sdkReady || !authLoaded || !user || !clerkId) return;

    // Skip if already initialized for this user
    if (initializedRef.current) {
      console.log('[Chatwoot] User already initialized, skipping');
      return;
    }

    const initializeUser = async () => {
      try {
        // Generate HMAC for identity validation
        const identifier = user._id;
        console.log('[Chatwoot] Generating HMAC for user', identifier, 'org:', organizationId);

        const identifierHash = await generateHmac({
          identifier,
          organizationId,
          inbox,
        });

        // Set user information in Chatwoot
        if (window.$chatwoot) {
          const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

          console.log('[Chatwoot] Setting user info', {
            identifier,
            email: user.email,
            name: userName,
            hasHash: !!identifierHash,
          });

          window.$chatwoot.setUser(identifier, {
            email: user.email,
            name: userName,
            avatar_url: user.imageUrl || undefined,
            phone_number: user.phone || undefined,
            identifier_hash: identifierHash,
          });

          initializedRef.current = true;
          console.log('[Chatwoot] User info set successfully');
        } else {
          console.warn('[Chatwoot] $chatwoot not available when trying to set user');
        }
      } catch (error) {
        console.error('[Chatwoot] Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, [sdkReady, authLoaded, user, clerkId, organizationId, inbox, generateHmac]);

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
