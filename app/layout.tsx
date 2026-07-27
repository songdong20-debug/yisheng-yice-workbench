import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一生一策 · 智慧工作台",
  description: "面向辅导员的学生成长档案、任务跟进、风险预警与统计工作台。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
