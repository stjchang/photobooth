import { useEffect, useRef } from "react";

export default function PhotoStripPreview({ photos, frameSrc, filter }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (photos.length !== 4) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const STRIP_WIDTH = 150;
        const PHOTO_SIZE = 150;

        canvas.width = STRIP_WIDTH;
        canvas.height = PHOTO_SIZE * 4;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photos.forEach((blob, index) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);

            img.onload = () => {
                const y = index * PHOTO_SIZE;

                ctx.save();
                ctx.translate(STRIP_WIDTH, y);
                ctx.scale(-1, 1);

                ctx.drawImage(img, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
                ctx.restore();
                
                // apply filter

                if (filter === "bw") {
                    const imageData = ctx.getImageData(0, y, STRIP_WIDTH, PHOTO_SIZE);
                    const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = data[i + 1] = data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, y);
                    }
            };
        });

        if (frameSrc) {
        const frame = new Image();
        frame.src = frameSrc;
            
        frame.onload = () => {
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
        };
    }
}, [photos, frameSrc, filter]);
    
    return ( 
        <canvas 
            ref={canvasRef}
            style={{
                border: "2px solid black",
                background: "white",
            }}
        />
    );
}
