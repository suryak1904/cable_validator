"use client";

import dynamic from "next/dynamic";

const ClientOnlyPage = dynamic(() => import("./page_content"), {
  ssr: false,
});

export default function Page() {
  return <ClientOnlyPage />;
}
