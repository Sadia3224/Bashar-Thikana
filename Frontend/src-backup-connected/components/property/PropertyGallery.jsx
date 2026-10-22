export default function PropertyGallery({ images = [], title = "Property" }) {
  const imgs = images.length ? images : [null];
  return <div className={`property-gallery count-${Math.min(imgs.length,3)}`}>{imgs.slice(0,3).map((src,i)=><div className={`gallery-cell gallery-${i}`} key={src||i}>{src?<img src={src} alt={`${title} ${i+1}`}/>:<div className="image-fallback">No property photo</div>}{i===2 && images.length>3 && <span className="more-photos">+{images.length-3} photos</span>}</div>)}</div>
}
