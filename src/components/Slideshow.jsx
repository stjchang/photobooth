export default function Slideshow({ onBack }) {
    return (
        <div className="slideshow">
            <h2>Our Photos</h2>
            <p className="slideshow__placeholder">Add your slideshow content here.</p>
            <button type="button" className="slideshow__back-btn" onClick={onBack}>
                Back
            </button>
        </div>
    );
}
