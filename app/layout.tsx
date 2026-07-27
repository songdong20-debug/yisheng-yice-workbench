import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "涓€鐢熶竴绛?路 鏅烘収宸ヤ綔鍙?,
  description: "闈㈠悜杈呭鍛樼殑瀛︾敓鎴愰暱妗ｆ銆佷换鍔¤窡杩涖€侀闄╅璀︿笌缁熻宸ヤ綔鍙般€?,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

