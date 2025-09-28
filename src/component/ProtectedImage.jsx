import { useEffect, useState } from "react";
import axiosInstance from "../../utils/ApiHelper";

export default function ProtectedImage({ src, alt = "", className = "", fallback = "/default-profile.png" }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let revoke;
    async function load() {
      try {
        if (!src) { setBlobUrl(null); return; }
        const res = await axiosInstance.get(src, { responseType: "blob" });
        const url = URL.createObjectURL(res.data);
        setBlobUrl(url);
        revoke = () => URL.revokeObjectURL(url);
      } catch {
        setBlobUrl(null);
      }
    }
    load();
    return () => { if (revoke) revoke(); };
  }, [src]);

  return <img src={blobUrl || fallback} alt={alt} className={className} />;
}

