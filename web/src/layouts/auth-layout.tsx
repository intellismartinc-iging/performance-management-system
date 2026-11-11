import Image from "next/image";
import fullLogo from "../../public/assets/hrdotnet-logo-full.png";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center px-pms-gutter py-8">
      <div className="grid w-full max-w-sm gap-6">
        <Image
          src={fullLogo}
          alt="HRDotNet Performance"
          loading="eager"
          fetchPriority="high"
          sizes="10rem"
          className="h-auto w-40 justify-self-center"
        />
        {children}
      </div>
    </main>
  );
}
