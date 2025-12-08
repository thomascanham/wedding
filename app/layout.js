import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Playfair_Display, Raleway } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--playfairDisplay",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const raleway = Raleway({
  variable: '--raleway',
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata = {
  title: "10.10.26",
  description: "Tom & Sam's Wedding",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${playfairDisplay.variable} ${raleway.variable}`}>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
