"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return; // silently skip rendering if not configured

    function setup() {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId as string,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    // The GSI script is loaded globally in app/layout.tsx — wait for it if not ready yet
    if (window.google) {
      setup();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          setup();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}
