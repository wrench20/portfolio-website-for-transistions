import { ImageResponse } from "next/og";
import { LOGO_PATH_N, LOGO_PATH_J } from "../components/Logo";

export const size = { width: 32, height: 32 };
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
          background: "#0e0f13",
        }}
      >
        <svg width="22" height="15.5" viewBox="-10 -1 27.22 19.19">
          <path d={LOGO_PATH_N} fill="#e5432d" />
          <path d={LOGO_PATH_J} fill="#dbe7f1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
