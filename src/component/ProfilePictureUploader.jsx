// src/component/user/ProfilePictureUploader.jsx
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";

const ProfilePictureUploader = ({ onChange, initialUrl }) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(initialUrl);
    const [cropMode, setCropMode] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setCropMode(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleCropConfirm = async () => {
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const fileName = "cropped-profile.jpg";

        // Convert Blob to File-like object that FormData accepts reliably
        const file = new File([croppedBlob], fileName, { type: "image/jpeg" });

        setPreviewUrl(URL.createObjectURL(croppedBlob));
        setCropMode(false);

        // ✅ This sends a valid File to parent
        onChange(file);
    };

    return (
        <div className="relative w-32 h-32 mb-4 mx-auto">
            <img
                src={previewUrl || "/default-profile.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover cursor-pointer border"
                onClick={() => fileInputRef.current.click()}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            {cropMode && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded w-full max-w-lg">
                        <div className="relative w-full h-64">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                            />
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button onClick={() => setCropMode(false)} className="text-gray-600">
                                Cancel
                            </button>
                            <button
                                onClick={handleCropConfirm}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePictureUploader;
