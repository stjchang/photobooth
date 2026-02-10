import { useEffect, useRef, useState } from "react";

export default function PhotoStripPreview({ photos, frameSrc, filter, onReset }) {
    const canvasRef = useRef(null);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [showIndividualSelection, setShowIndividualSelection] = useState(false);

    useEffect(() => {
        if (photos.length !== 4) {
            setIsCanvasReady(false);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const STRIP_WIDTH = 150;
        const PHOTO_SIZE = 150;
        const SCALE_FACTOR = 4; // Render at 4x resolution for high quality

        // Set canvas internal resolution (high resolution)
        const scaledWidth = STRIP_WIDTH * SCALE_FACTOR;
        const scaledHeight = PHOTO_SIZE * SCALE_FACTOR * 4;
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        setIsCanvasReady(false);

        // Load all photos as promises
        const photoPromises = photos.map((blob, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(blob);

                img.onload = () => {
                    const scaledY = index * PHOTO_SIZE * SCALE_FACTOR;
                    const scaledPhotoSize = PHOTO_SIZE * SCALE_FACTOR;

                    ctx.save();
                    ctx.translate(scaledWidth, scaledY);
                    ctx.scale(-1, 1);

                    ctx.drawImage(img, 0, 0, scaledPhotoSize, scaledPhotoSize);
                    ctx.restore();
                    
                    if (filter === "bw") {
                        const imageData = ctx.getImageData(0, scaledY, scaledWidth, scaledPhotoSize);
                        const data = imageData.data;

                        for (let i = 0; i < data.length; i += 4) {
                            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                            data[i] = data[i + 1] = data[i + 2] = avg;
                        }
                        ctx.putImageData(imageData, 0, scaledY);
                    }

                    resolve();
                };

                img.onerror = () => {
                    console.error(`Failed to load photo ${index}`);
                    resolve();
                };
            });
        });

        // Load frame if provided
        const framePromise = frameSrc
            ? new Promise((resolve) => {
                const frame = new Image();
                frame.src = frameSrc;
                
                frame.onload = () => {
                    // Draw frame at scaled size
                    ctx.drawImage(frame, 0, 0, scaledWidth, scaledHeight);
                    resolve();
                };

                frame.onerror = () => {
                    console.error("Failed to load frame");
                    resolve();
                };
            })
            : Promise.resolve();

        // Wait for all images and frame to load
        Promise.all([...photoPromises, framePromise]).then(() => {
            setIsCanvasReady(true);
        });
    }, [photos, frameSrc, filter]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas || !isCanvasReady) return;

        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Failed to convert canvas to blob");
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
            link.download = `photostrip-${timestamp}.png`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, "image/png");
    };

    const handleDownloadIndividual = (photoIndex) => {
        if (photoIndex < 0 || photoIndex >= photos.length) return;

        const photoBlob = photos[photoIndex];
        if (!photoBlob) return;

        const url = URL.createObjectURL(photoBlob);
        const link = document.createElement("a");
        link.href = url;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
        link.download = `photo-${photoIndex + 1}-${timestamp}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        setShowIndividualSelection(false);
    };

    return (
        <div className="photo-strip-preview">
            <canvas 
                ref={canvasRef}
                style={{
                    border: "2px solid black",
                    background: "white",
                    width: "150px",
                    height: "600px",
                }}
            />
            <div className="preview-actions">
                <button
                    onClick={handleDownload}
                    disabled={!isCanvasReady}
                    className="download-btn"
                >
                    Download Full Strip
                </button>
                <button
                    onClick={() => setShowIndividualSelection(!showIndividualSelection)}
                    disabled={!isCanvasReady}
                    className="download-individual-btn"
                >
                    Download Individual Photo
                </button>
                {showIndividualSelection && (
                    <div className="individual-photo-selection">
                        {photos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDownloadIndividual(index)}
                                className="photo-select-btn"
                            >
                                Photo {index + 1}
                            </button>
                        ))}
                    </div>
                )}
                {onReset && (
                    <button
                        onClick={onReset}
                        className="reset-btn"
                    >
                        Restart
                    </button>
                )}
            </div>
        </div>
    );
}

