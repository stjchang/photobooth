import pinkFrame from "../assets/frames/pinkFrame.png";
import pinkFrameMini from "../assets/frames/pinkFrameMini.png";
import valentineFrame from "../assets/frames/valentineFrame.png";
import valentineFrameMini from "../assets/frames/valentineFrameMini.png";
import blackFrame from "../assets/frames/blackFrame.png";
import blackFrameMini from "../assets/frames/blackFrameMini.png";

export default function FrameSelection({
    frame,
    setFrame,
    miniFrame,
    setMiniFrame,
    filter,
    setFilter,
    onConfirm
}) {
    // Placeholder frame options 
    const frameOptions = [
        { id: "pinkFrame", src: pinkFrame, miniSrc: pinkFrameMini, label: "Pink Frame" },
        { id: "valentineFrame", src: valentineFrame, miniSrc: valentineFrameMini, label: "Valentine Frame" },
        { id: "blackFrame", src: blackFrame, miniSrc: blackFrameMini, label: "Black Frame" },
    ];

    return (
        <div className="frame-selection">
            <h2>Choose your frame</h2>

            <div className="frame-grid">
                {frameOptions.map((frameOption) => (
                    <div
                        key={frameOption.id}
                        className={`frame-option ${frame === frameOption.src ? "selected" : ""}`}
                        onClick={() => {
                            setFrame(frameOption.src);
                            setMiniFrame(frameOption.miniSrc);
                        }}
                    >
                        {/* Placeholder for 1x4 photostrip frame preview */}
                        <div className="frame-preview">
                            {/* Replace this with your actual frame image */}
                            <div className="frame-placeholder">
                                <div className="frame-strip">
                                    <div className="frame-photo-slot"></div>
                                    <div className="frame-photo-slot"></div>
                                    <div className="frame-photo-slot"></div>
                                    <div className="frame-photo-slot"></div>
                                </div>
                            </div>
                        </div>
                        <span>{frameOption.label}</span>
                    </div>
                ))}
            </div>

            <div className="filter-toggle">
                <button
                    className={filter === "color" ? "active" : ""}
                    onClick={() => setFilter("color")}
                >
                    Color
                </button>
                <button
                    className={filter === "bw" ? "active" : ""}
                    onClick={() => setFilter("bw")}
                >
                    B&W
                </button>
            </div>

            <button
                disabled={!frame}
                onClick={onConfirm}
            >
                Start Shooting
            </button>
        </div>
    );
}
