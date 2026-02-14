import MQbooth from "../assets/backdrops/MQbooth.png";
import holdingCamera from "../assets/misc/holding_camera.jpg";

export default function HomeScreen({ onStart, onOpenSlideshow }) {
    return (
        <div className="home-screen">
            <div
                className="home-screen__bg"
                style={{ backgroundImage: `url(${MQbooth})` }}
            />
            <button
                type="button"
                className="home-screen__booth-link"
                onClick={onOpenSlideshow}
                aria-label="Meiqi's Booth"
                style={{ backgroundImage: `url(${holdingCamera})` }}
            />
            <button
                type="button"
                className="home-screen__enter-btn"
                onClick={onStart}
            >
                Enter
            </button>
        </div>
    );
}
