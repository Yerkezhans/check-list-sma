/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

type LayoutInput = {
  children: React.ReactNode;
  params?: Promise<any>;
};

export default async function LocaleLayout(rawProps: LayoutInput) {
  const { children } = rawProps;

  const resolvedParams = rawProps.params
    ? await rawProps.params
    : { locale: "kz" };

  const locale: string = resolvedParams.locale;

  if (!routing.locales.includes(locale as "kz" | "ru")) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
