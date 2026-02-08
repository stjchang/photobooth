import { useEffect, useRef, useState } from "react";

export default function CameraView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [countdown, setCountdown] = useState(3);
    const [photos, setPhotos] = useState([]);
    const [shotIndex, setShotIndex] = useState(0);

  // Start camera
    useEffect(() => {
        async function startCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            videoRef.current.srcObject = stream;
        }
        startCamera();
    }, []);

  // Countdown + capture loop
    useEffect(() => {
        if (shotIndex >= 4) return;

        if (countdown === 0) {
            capturePhoto();
            setShotIndex((i) => i + 1);
            setCountdown(3);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((c) => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, shotIndex]);

    function capturePhoto() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            setPhotos((prev) => [...prev, blob]);
            console.log("Captured photo", photos.length + 1);
        }, "image/png");
    } 

    useEffect(() => {
        if (photos.length === 4) {
            console.log("All photos captured", photos);
        }
    }, [photos]);

    return (
        <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline muted />

            {shotIndex < 4 && (
                <div className="countdown">
                    {countdown} 
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}
