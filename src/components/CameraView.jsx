import { useEffect, useRef, useState } from "react";
import PhotoStripPreview from "./PhotostripPreview";


export default function CameraView() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [countdown, setCountdown] = useState(3);
    const [phase, setPhase] = useState("countdown"); 
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

    if (phase === "countdown") {
        if (countdown === 0) {
            capturePhoto();
            setPhase("cooldown");
            return;
        }

        const t = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(t);
    }

    if (phase === "cooldown") {
        const t = setTimeout(() => {
            setCountdown(3);
            setShotIndex(i => i + 1);
            setPhase("countdown");
        }, 1000); 

        return () => clearTimeout(t);
    }
}, [countdown, phase, shotIndex]);

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
        <>
            {photos.length < 4 ? (
            <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline muted />
                {shotIndex < 4 && phase === "countdown" &&(
                    <div className="countdown">
                        {countdown}
                    </div>
                )}
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            ) : (
                <PhotoStripPreview photos = {photos} />
            )}
        </>
    );
}