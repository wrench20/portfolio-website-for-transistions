import { ImageResponse } from "next/og";
import { LOGO_PATH_N, LOGO_PATH_J } from "../components/Logo";
import { config } from "../config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${config.developer.fullName} — ${config.developer.title}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#0e0f13",
          color: "#dbe7f1",
        }}
      >
        <svg width="64" height="45" viewBox="-10 -1 27.22 19.19" style={{ marginBottom: 40 }}>
          <path d={LOGO_PATH_N} fill="#e5432d" />
          <path d={LOGO_PATH_J} fill="#dbe7f1" />
        </svg>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>
          {config.developer.fullName}
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#e5432d", marginTop: 18 }}>
          {config.developer.title} · ERP Developer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#7f8fa0",
            marginTop: 28,
            maxWidth: 920,
          }}
        >
          {config.developer.description}
        </div>
      </div>
    ),
    { ...size }
  );
}
