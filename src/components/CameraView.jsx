import { useEffect, useRef, useState } from "react";

export default function CameraView() {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError("Camera access denied");
                console.error(err);
            }   
        }

        startCamera();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="camera-container">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-feed"
            />
        </div>
    );
}
