import React, { useEffect } from 'react';
import type { AppProps } from "next/app";
import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import MainLayout from "@/layouts/main-layout";
import SettingsLayout from '@/layouts/settings-layout';
import { Fade } from '@/components/common/transition';
import { changeLanguage, localeResources } from '@/locales';
import { isProd } from '@/utils/env';
import chakraExtendTheme from '@/chakra-theme';

import "@/styles/globals.css";
import { ToastContextProvider } from '@/contexts/toast';

i18n
  .use(initReactI18next)
  .init({
    resources: localeResources,
    fallbackLng: 'zh-Hans',
    lng: 'zh-Hans',
    interpolation: {
      escapeValue: false,
    },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    // set locales
    const storedLocaleKey = localStorage.getItem('locale');
    if (storedLocaleKey) {
      changeLanguage(storedLocaleKey);
    } else {
      changeLanguage();
    }

    // forbid right mouse menu of webview
    if (isProd) {
      document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });
    }
  }, []);

  const layoutMappings: { prefix: string; layout: React.ComponentType<{ children: React.ReactNode }> }[] = [
    { prefix: '/settings/', layout: SettingsLayout },
  ];

  let SpecLayout: React.ComponentType<{ children: React.ReactNode }> = React.Fragment;

  for (const mapping of layoutMappings) {
    if (router.pathname.startsWith(mapping.prefix)) { SpecLayout = mapping.layout; break; }
  }

  return (
    <ChakraProvider theme={chakraExtendTheme}>
      <ToastContextProvider>
        <MainLayout>
          <Fade key={router.pathname.split("/")[1] || ""} in>
            <SpecLayout>
              <Component {...pageProps} />
            </SpecLayout>
          </Fade>
        </MainLayout>
      </ToastContextProvider>
    </ChakraProvider>
  );
}
