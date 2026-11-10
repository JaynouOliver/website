import Image from "next/image";

// Smart image: local files (in public/) go through Vercel's image optimizer —
// resized to fit, converted to WebP/AVIF, CDN-cached. Remote URLs render as a
// plain lazy-loaded <img> so any host works without config.
export default function Pic({
  src,
  alt = "",
  width,
  height,
  className,
  style,
  priority,
  sizes,
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string; // responsive hint for next/image, e.g. "(max-width: 860px) 100vw, 480px"
}) {
  if (src.startsWith("/")) {
    return (
      <Image src={src} alt={alt} width={width} height={height} className={className} style={style} priority={priority} sizes={sizes} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} style={style} loading={priority ? undefined : "lazy"} />
  );
}
