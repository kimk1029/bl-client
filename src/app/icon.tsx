import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 132,
          fontWeight: 800,
          letterSpacing: -6,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        b
      </div>
    ),
    size,
  );
}
