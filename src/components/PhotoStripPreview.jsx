import { useEffect, useRef, useState } from "react";
import { savePhoto } from "../utils/indexedDB";

export default function PhotoStripPreview({ photos, frameSrc, miniFrame, filter, onReset }) {
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
        const STRIP_HEIGHT = 600;
        const SCALE_FACTOR = 4; // Render at 4x resolution for high quality

        // Margins
        const MARGIN_TOP = 20; // Top margin for first photo
        const MARGIN_SIDES = 10; // Left and right margins
        const MARGIN_BETWEEN = 10; // Gap between photos
        const MARGIN_BOTTOM = 10; // Bottom margin

        // Calculate photo dimensions with margins
        const PHOTO_WIDTH = STRIP_WIDTH - (MARGIN_SIDES * 2); // 130px
        const PHOTO_HEIGHT = (STRIP_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - (MARGIN_BETWEEN * 3)) / 4; // 135px

        // Set canvas internal resolution (high resolution)
        const scaledWidth = STRIP_WIDTH * SCALE_FACTOR;
        const scaledHeight = STRIP_HEIGHT * SCALE_FACTOR;
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        setIsCanvasReady(false);

        // Calculate Y positions for each photo - exact positions specified
        const getPhotoY = (index) => {
            const positions = [15, 165, 315, 465];
            return positions[index] || 5;
        };

        // Load and draw frame first (behind photos) - must complete before photos
        const framePromise = frameSrc
            ? new Promise((resolve) => {
                const frame = new Image();
                frame.src = frameSrc;
                
                frame.onload = () => {
                    // Draw frame at scaled size - this goes behind photos
                    ctx.drawImage(frame, 0, 0, scaledWidth, scaledHeight);
                    resolve();
                };

                frame.onerror = () => {
                    console.error("Failed to load frame");
                    resolve();
                };
            })
            : Promise.resolve();

        // Chain promises: draw frame first, THEN draw photos on top
        framePromise.then(() => {
            // Load all photos as promises (drawn on top of frame)
            const photoPromises = photos.map((blob, index) => {
                return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);

            img.onload = () => {
                const photoX = MARGIN_SIDES * SCALE_FACTOR;
                const photoY = getPhotoY(index) * SCALE_FACTOR;
                const scaledPhotoWidth = PHOTO_WIDTH * SCALE_FACTOR;
                const scaledPhotoHeight = PHOTO_HEIGHT * SCALE_FACTOR;

                        // Draw photo with mirror effect (on top of frame)
                ctx.save();
                ctx.translate(scaledWidth - photoX, photoY);
                ctx.scale(-1, 1);

                ctx.drawImage(img, 0, 0, scaledPhotoWidth, scaledPhotoHeight);
                ctx.restore();

                if (filter === "bw") {
                    const drawX = scaledWidth - photoX - scaledPhotoWidth;
                    const drawY = photoY;
                    const imageData = ctx.getImageData(drawX, drawY, scaledPhotoWidth, scaledPhotoHeight);
                    const data = imageData.data;

                    const contrast = 1.35;
                    const brightness = 10;
                    const grainAmount = 12;

                    for (let i = 0; i < data.length; i += 4) {
                        let gray =
                            0.299 * data[i] +
                            0.587 * data[i + 1] +
                            0.114 * data[i + 2];

                        gray = (gray - 128) * contrast + 128;
                        gray += brightness;

                        const grain = (Math.random() - 0.5) * grainAmount;
                        gray += grain;

                        gray = Math.max(0, Math.min(255, gray));

                        data[i] = data[i + 1] = data[i + 2] = gray;
                    }

                    ctx.putImageData(imageData, drawX, drawY);
                }

                        resolve();
                    };

                    img.onerror = () => {
                        console.error(`Failed to load photo ${index}`);
                        resolve();
                    };
                });
            });

            // Wait for all photos to be drawn
            Promise.all(photoPromises).then(() => {
                setIsCanvasReady(true);
            });
        });
    }, [photos, frameSrc, filter]);

    // Auto-generate individual framed photos when canvas is ready
    useEffect(() => {
        if (!isCanvasReady || !miniFrame || photos.length !== 4) return;

        const generateIndividualFramedPhoto = async (photoBlob, photoIndex) => {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const SCALE_FACTOR = 4;

                const photoImg = new Image();
                photoImg.src = URL.createObjectURL(photoBlob);

                photoImg.onload = () => {
                    const frameImg = new Image();
                    frameImg.src = miniFrame;

                    frameImg.onload = () => {
                        canvas.width = frameImg.width * SCALE_FACTOR;
                        canvas.height = frameImg.height * SCALE_FACTOR;

                        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

                        const MARGIN_SIDES = 20 * SCALE_FACTOR;
                        const MARGIN_TOP = 60 * SCALE_FACTOR;
                        const MARGIN_BOTTOM = 10 * SCALE_FACTOR;
                        const photoWidth = (canvas.width - (MARGIN_SIDES * 2));
                        const photoHeight = canvas.height - MARGIN_TOP - MARGIN_BOTTOM;

                        const photoX = MARGIN_SIDES;
                        const photoY = MARGIN_TOP;

                        ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);

                        if (filter === "bw") {
                            const imageData = ctx.getImageData(photoX, photoY, photoWidth, photoHeight);
                            const data = imageData.data;

                            const contrast = 1.35;
                            const brightness = 10;
                            const grainAmount = 12;

                            for (let i = 0; i < data.length; i += 4) {
                                let gray =
                                    0.299 * data[i] +
                                    0.587 * data[i + 1] +
                                    0.114 * data[i + 2];

                                gray = (gray - 128) * contrast + 128;
                                gray += brightness;

                                const grain = (Math.random() - 0.5) * grainAmount;
                                gray += grain;

                                gray = Math.max(0, Math.min(255, gray));

                                data[i] = data[i + 1] = data[i + 2] = gray;
                            }

                            ctx.putImageData(imageData, photoX, photoY);
                        }

                        // Convert to blob and save to IndexedDB
                        canvas.toBlob(async (framedBlob) => {
                            if (framedBlob) {
                                try {
                                    // Save framed individual photo to IndexedDB
                                    // Use a special photoIndex to indicate it's a framed version
                                    // We'll use photoIndex + 10 to differentiate (0-3 for regular, 10-13 for framed)
                                    await savePhoto(framedBlob, photoIndex + 10, frameSrc, filter);
                                    console.log(`Saved framed individual photo ${photoIndex + 1} to IndexedDB`);
                                } catch (error) {
                                    console.error(`Failed to save framed photo ${photoIndex + 1}:`, error);
                                }
                            }
                            URL.revokeObjectURL(photoImg.src);
                            resolve();
                        }, "image/png");
                    };

                    frameImg.onerror = () => {
                        console.error(`Failed to load mini frame for photo ${photoIndex + 1}`);
                        URL.revokeObjectURL(photoImg.src);
                        resolve();
                    };
                };

                photoImg.onerror = () => {
                    console.error(`Failed to load photo ${photoIndex + 1} for framing`);
                    resolve();
                };
            });
        };

        // Generate all individual framed photos
        Promise.all(
            photos.map((photoBlob, index) => 
                generateIndividualFramedPhoto(photoBlob, index)
            )
        ).then(() => {
            console.log("All individual framed photos generated and saved to IndexedDB");
        });
    }, [isCanvasReady, miniFrame, photos, frameSrc, filter]);

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
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, "image/png");
    };

    const handleDownloadIndividual = (photoIndex) => {
        if (photoIndex < 0 || photoIndex >= photos.length) return;

        const photoBlob = photos[photoIndex];
        if (!photoBlob) return;
        
        // Create canvas for individual photo with frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const SCALE_FACTOR = 4; // Match the scale factor used in preview

        // Load photo and frame
        const photoImg = new Image();
        photoImg.src = URL.createObjectURL(photoBlob);

        photoImg.onload = () => {
            if (miniFrame) {
                const frameImg = new Image();
                frameImg.src = miniFrame;

                frameImg.onload = () => {
                    canvas.width = frameImg.width * SCALE_FACTOR;
                    canvas.height = frameImg.height * SCALE_FACTOR;

                    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

                    const MARGIN_SIDES = 20 * SCALE_FACTOR;
                    const MARGIN_TOP = 60 * SCALE_FACTOR;
                    const MARGIN_BOTTOM = 10 * SCALE_FACTOR;
                    const photoWidth = (canvas.width - (MARGIN_SIDES * 2));
                    const photoHeight = canvas.height - MARGIN_TOP - MARGIN_BOTTOM;

                    const photoX = MARGIN_SIDES;
                    const photoY = MARGIN_TOP;

                    ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);

                    if (filter === "bw") {
                        const imageData = ctx.getImageData(photoX, photoY, photoWidth, photoHeight);
                        const data = imageData.data;

                        const contrast = 1.35;
                        const brightness = 10;
                        const grainAmount = 12;

                        for (let i = 0; i < data.length; i += 4) {
                            let gray =
                                0.299 * data[i] +
                                0.587 * data[i + 1] +
                                0.114 * data[i + 2];

                            gray = (gray - 128) * contrast + 128;
                            gray += brightness;

                            const grain = (Math.random() - 0.5) * grainAmount;
                            gray += grain;

                            gray = Math.max(0, Math.min(255, gray));

                            data[i] = data[i + 1] = data[i + 2] = gray;
                        }

                        ctx.putImageData(imageData, photoX, photoY);
                    }

                    // Download
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error("Failed to create blob");
                            return;
                        }

                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        
                        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
                        link.download = `photo-${photoIndex + 1}-${timestamp}.png`;
                        
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                            URL.revokeObjectURL(photoImg.src);
                        }, 100);
                        
                        setShowIndividualSelection(false);
                    }, "image/png");
                };

                frameImg.onerror = () => {
                    console.error("Failed to load small frame, downloading photo without frame");
                    // Fallback: download photo without frame
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
            } 
        };

        photoImg.onerror = () => {
            console.error("Failed to load photo");
            setShowIndividualSelection(false);
        };
    };
    
    return (
        <div className="photo-strip-preview">
            <div className="photo-strip-preview__strip-and-select">
                <canvas
                    ref={canvasRef}
                    style={{
                        background: "white",
                        width: "150px",
                        height: "600px",
                    }}
                />
                {showIndividualSelection && (
                    <div className="photo-strip-preview__individual-btns">
                        {photos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDownloadIndividual(index)}
                                className="photo-strip-preview__individual-btn"
                            >
                                Photo {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="preview-actions">
                <button
                    onClick={handleDownload}
                    disabled={!isCanvasReady}
                    className="preview-actions__btn"
                >
                    Download
                </button>
                <button
                    onClick={() => setShowIndividualSelection(!showIndividualSelection)}
                    disabled={!isCanvasReady}
                    className="preview-actions__btn"
                >
                    Select
                </button>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="preview-actions__btn"
                    >
                        Restart
                    </button>
                )}
            </div>
        </div>
    );
}

