import { useEffect, useRef } from "react";

export default function PhotoStripPreview({ photos }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (photos.length !== 4) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const STRIP_WIDTH = 150;
        const PHOTO_SIZE = 150;

        canvas.width = STRIP_WIDTH;
        canvas.height = PHOTO_SIZE * 4;

        const images = photos.map((blob) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            return img;
        });

        Promise.all(
            images.map(
                (img) =>
                    new Promise((res) => {
                    img.onload = res;
                })
            )
        ).then(() => {
            images.forEach((img, index) => {
                const y = index * PHOTO_SIZE;
                ctx.save()
                ctx.translate(STRIP_WIDTH, y);
                ctx.scale(-1, 1)

                ctx.drawImage(img, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
                ctx.restore()
            });

        });
    }, [photos]);

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
