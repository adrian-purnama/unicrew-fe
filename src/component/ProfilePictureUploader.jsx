// ProfilePictureUploader (protected assets)
// - Displays current profile image by fetching as blob with Authorization header
// - Lets the user pick and crop a new image; emits a File via onChange
import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import axiosInstance from "../../utils/ApiHelper";

export default function ProfilePictureUploader({
  initialUrl,
  onChange,
  disabled = false,
  size = 128,
}) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Load initial protected image
  useEffect(() => {
    let revoke;
    async function load() {
      setError("");
      if (!initialUrl) { setPreviewUrl(null); return; }
      try {
        setLoading(true);
        const res = await axiosInstance.get(initialUrl, { responseType: "blob" });
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        revoke = () => URL.revokeObjectURL(url);
      } catch {
        setError("Failed to load image");
        setPreviewUrl(null);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { if (revoke) revoke(); };
  }, [initialUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageSrc(reader.result); setCropMode(true); };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
      const url = URL.createObjectURL(croppedBlob);
      setPreviewUrl(url);
      setCropMode(false);
      onChange && onChange(file);
    } catch {
      setError("Failed to crop image");
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange && onChange(null);
  };

  const dim = { width: `${size}px`, height: `${size}px` };

  return (
    <div className="relative mb-4 mx-auto" style={dim}>
      <div
        className={`w-full h-full rounded-full border overflow-hidden ${disabled ? "opacity-60" : "cursor-pointer"}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Loading…</div>
        ) : (
          <img
            src={previewUrl || "/default-profile.png"}
            alt="Profile"
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
      </div>
      {error && <div className="mt-1 text-xs text-red-500 text-center">{error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {previewUrl && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -bottom-2 right-0 text-xs bg-red-600 text-white px-2 py-0.5 rounded"
        >
          Remove
        </button>
      )}

      {cropMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-lg p-4">
            <div className="relative w-full h-64">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedAreaPixels(area)}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-1/2"
              />
              <div className="space-x-2">
                <button onClick={() => setCropMode(false)} className="px-3 py-1 rounded border">Cancel</button>
                <button onClick={handleCropConfirm} className="px-3 py-1 rounded bg-blue-600 text-white">Crop & Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
