import { useEffect, useRef, useState, useCallback } from "react";
import { savePhoto } from "../utils/indexedDB";

const SHOT_COUNT = 4;
const COUNTDOWN_START = 3;

export default function CameraView({
    frame,
    filter,
    photos,
    setPhotos,
    onDone
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [countdown, setCountdown] = useState(3);
    const [phase, setPhase] = useState("countdown"); 
    const [shotIndex, setShotIndex] = useState(0);

  // Start camera
    useEffect(() => {
        let stream = null;
        async function startCamera() {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            videoRef.current.srcObject = stream;
        }
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;

            const currentPhotoIndex = shotIndex;
            
            savePhoto(blob, currentPhotoIndex, frame, filter).catch((error) => {
                console.error("Failed to save photo to IndexedDB:", error);
            });

            setPhotos((prev) => {
                const newPhotos = [...prev, blob];
                console.log("Captured photo", newPhotos.length);
                return newPhotos;
            });
        }, "image/png");
    }, [setPhotos, shotIndex, frame, filter]);

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
    }, [countdown, phase, shotIndex, capturePhoto]);

    useEffect(() => {
        if (photos.length === 4) {
            console.log("All photos captured", photos);
            onDone();
        }
    }, [photos, onDone]);

    
    return (
        <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline muted />
            {shotIndex < 4 && phase === "countdown" && (
                <div className="countdown">
                    {countdown}
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}