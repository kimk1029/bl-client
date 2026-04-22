import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SITE.themeColor,
          color: "#FAFAF8",
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: -5,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 40,
        }}
      >
        b
      </div>
    ),
    size,
  );
}
