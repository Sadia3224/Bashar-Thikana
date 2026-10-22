import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyImage from "./PropertyImage";

export default function Gallery({ images, title }) {
  const [index, setIndex] = useState(0);
  const list = images.length ? images : [null];
  const current = Math.min(index, list.length - 1);
  const go = (step) => setIndex((current + step + list.length) % list.length);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <PropertyImage src={list[current]} alt={`${title}, photo ${current + 1} of ${list.length}`} eager />
        {list.length > 1 && (
          <>
            <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft size={22} />
            </button>
            <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight size={22} />
            </button>
            <span className="gallery-count">
              {current + 1} / {list.length}
            </span>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="gallery-thumbs">
          {list.map((src, i) => (
            <button key={`${src}-${i}`} type="button" className={`gallery-thumb ${i === current ? "is-active" : ""}`} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === current}>
              <PropertyImage src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
