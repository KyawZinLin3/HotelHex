"use client";

import { App as AntdApp, ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#2563eb",
        borderRadius: 10,
        fontFamily: "Arial, Helvetica, sans-serif",
      },
    }}
  >
    <AntdApp message={{ top: 84, duration: 4, maxCount: 3 }}>
      {children}
    </AntdApp>
  </ConfigProvider>;
}
