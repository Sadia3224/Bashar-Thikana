import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function PropertyImage({ src, alt, className = "", eager = false }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <ImageOff size={26} aria-hidden="true" />
        <span>Photo unavailable</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} onError={() => setFailedSrc(src)} />;
}
