import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { cn } from "@/lib/utils";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import { syncUserToDatabase } from "@/lib/sync-user";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter=Inter({
  subsets:["latin"]
})
export const metadata: Metadata = {
  title: "DocuAI - AI Powered Multi-tenant Document Analysis",
  description: "Analysis and collaboration on documents with Google",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncUserToDatabase();
  return (
    <ClerkProvider> <html
      lang="en"
      suppressHydrationWarning 
     >
      <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
          {/* header */}
          <Header />
          {/* Main */}
          <main className="flex-1"> {children}</main>
          {/* Footer */}
          <Footer />
          </div>
       </body>
    </html>
    </ClerkProvider>
   
  );
}
