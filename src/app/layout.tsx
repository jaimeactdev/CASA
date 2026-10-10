import "./globals.css";

import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/hooks/ToastProvider';
import { RouteModalProvider } from '@/shared/components/RouteModalProvider';
import { CustomMessageModal } from '@/shared/ui/Modal/CustomMessageModal';
import SessionTimeoutProvider from '@/components/SessionTimeoutProvider';
import ConsoleConfig from '@/components/ConsoleConfig';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import MuiThemeProvider from '@/providers/ThemeProvider';
import AuthGuard from '@/core/guards/AuthGuard';
import { SessionBinder } from '@/features/login/view/SessionBinder';
import type { CSSProperties } from "react";
import { seoMetadata } from '@/core/seo/seoMetadata';
import { brandCssVars } from '@/styles/cssVariables';
import { appConfig } from '@/config/appConfig';
import { resolveAssetUrl } from '@/shared/ui/brand/monogram';

export const metadata = {
  ...seoMetadata.home,
  ...(appConfig.assets.favicon
    ? { icons: { icon: resolveAssetUrl(appConfig.assets.favicon) } }
    : {}),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" style={brandCssVars() as CSSProperties}>
      <body>
        <MuiThemeProvider>
          <ConsoleConfig />
          <QueryProvider>
            <ToastProvider>
              <SessionTimeoutProvider>
                <RouteModalProvider>
                  <SessionBinder>
                    <AuthGuard>
                      {children}
                    </AuthGuard>
                  </SessionBinder>
                </RouteModalProvider>
              </SessionTimeoutProvider>
              <CustomMessageModal />
            </ToastProvider>
          </QueryProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
