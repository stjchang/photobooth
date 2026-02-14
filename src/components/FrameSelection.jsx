import { useEffect } from "react";
import frameSelectBg from "../assets/backdrops/frame_select.png";
import switchImg from "../assets/switch.png";
import pinkFrame from "../assets/frames/pinkFrame.png";
import pinkFrameMini from "../assets/frames/pinkFrameMini.png";
import valentineFrame from "../assets/frames/valentineFrame.png";
import valentineFrameMini from "../assets/frames/valentineFrameMini.png";
import blackFrame from "../assets/frames/blackFrame.png";
import blackFrameMini from "../assets/frames/blackFrameMini.png";

const frameOptions = [
    { id: "pinkFrame", src: pinkFrame, miniSrc: pinkFrameMini, label: "Pink Frame" },
    { id: "valentineFrame", src: valentineFrame, miniSrc: valentineFrameMini, label: "Valentine Frame" },
    { id: "blackFrame", src: blackFrame, miniSrc: blackFrameMini, label: "Black Frame" },
];

export default function FrameSelection({
    frame,
    setFrame,
    miniFrame,
    setMiniFrame,
    filter,
    setFilter,
    onConfirm
}) {
    // Default to first frame when entering so Start always has a valid frame
    useEffect(() => {
        if (!frame || !miniFrame) {
            setFrame(frameOptions[0].src);
            setMiniFrame(frameOptions[0].miniSrc);
        }
    }, [frame, miniFrame, setFrame, setMiniFrame]);

    const currentIndex = frameOptions.findIndex((opt) => opt.src === frame);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentLabel = frameOptions[safeIndex]?.label ?? frameOptions[0].label;

    const goPrevious = () => {
        const prevIndex = safeIndex === 0 ? frameOptions.length - 1 : safeIndex - 1;
        const opt = frameOptions[prevIndex];
        setFrame(opt.src);
        setMiniFrame(opt.miniSrc);
    };

    const goNext = () => {
        const nextIndex = safeIndex === frameOptions.length - 1 ? 0 : safeIndex + 1;
        const opt = frameOptions[nextIndex];
        setFrame(opt.src);
        setMiniFrame(opt.miniSrc);
    };

    const toggleFilter = () => {
        setFilter((prev) => (prev === "color" ? "bw" : "color"));
    };

    return (
        <div className="frame-selection">
            <div
                className="frame-selection__bg"
                style={{ backgroundImage: `url(${frameSelectBg})` }}
            />
            <div className="frame-selection__frame-picker">
                <button
                    type="button"
                    className="frame-selection__arrow frame-selection__arrow--left"
                    onClick={goPrevious}
                    aria-label="Previous frame"
                >
                    ←
                </button>
                <span className="frame-selection__frame-label">{currentLabel}</span>
                <button
                    type="button"
                    className="frame-selection__arrow frame-selection__arrow--right"
                    onClick={goNext}
                    aria-label="Next frame"
                >
                    →
                </button>
            </div>
            <button
                type="button"
                className="frame-selection__switch-btn"
                onClick={toggleFilter}
                aria-label="Toggle filter"
                style={{
                    backgroundImage: `url(${switchImg})`,
                    transform: filter === "bw" ? "scaleX(-1)" : "none",
                }}
            />
            <button
                type="button"
                className="frame-selection__start-btn"
                onClick={onConfirm}
                aria-label="Start Shooting"
            />
        </div>
    );
}
