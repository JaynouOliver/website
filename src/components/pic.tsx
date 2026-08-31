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
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  if (src.startsWith("/")) {
    return (
      <Image src={src} alt={alt} width={width} height={height} className={className} style={style} priority={priority} />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt={alt} width={width} height={height} className={className} style={style} loading={priority ? undefined : "lazy"} />
  );
}
