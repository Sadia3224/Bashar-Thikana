import { useMemo, useState } from "react";
import api from "../../api/axios";
import Icon from "../common/Icon";
export default function ImageUploader({ value = [], onChange }) {
  const [files,setFiles]=useState([]); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const previews=useMemo(()=>files.map(f=>({f,url:URL.createObjectURL(f)})),[files]);
  const upload=async()=>{ if(!files.length)return; const fd=new FormData(); files.forEach(f=>fd.append("images",f)); setBusy(true); setError(""); try{const {data}=await api.post("/uploads/property-images",fd);onChange([...value,...data.images.map(x=>x.url)]);setFiles([]);}catch(e){setError(e.response?.data?.message||"Upload failed");}finally{setBusy(false)} };
  return <div className="image-uploader"><label className="upload-drop"><Icon name="image" size={28}/><div><strong>Add property photos</strong><p>JPG, PNG or WebP · up to 8 files · 5 MB each</p></div><span className="button button-outline button-small">Choose photos</span><input hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,8))}/></label>
    {previews.length>0 && <><div className="upload-grid">{previews.map(({f,url})=><img key={f.name+f.size} src={url} alt={f.name}/>)}</div><button type="button" className="button button-primary button-small" disabled={busy} onClick={upload}>{busy?"Uploading…":`Upload ${files.length} photo${files.length>1?"s":""}`}</button></>}
    {value.length>0 && <div className="upload-grid uploaded">{value.map(url=><div key={url}><img src={url} alt="Uploaded property"/><button type="button" onClick={()=>onChange(value.filter(x=>x!==url))}>×</button></div>)}</div>}{error&&<p className="form-error">{error}</p>}</div>
}
