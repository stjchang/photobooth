import { useState } from "react";

import HomeScreen from "./components/HomeScreen";
import FrameSelection from "./components/FrameSelection";
import CameraView from "./components/CameraView";
import PhotoStripPreview from "./components/PhotoStripPreview";

function App() {
  const [screen, setScreen] = useState("home");

  const [frame, setFrame] = useState(null);
  const [filter, setFilter] = useState("color"); 
  const [photos, setPhotos] = useState([]);

  const resetApp = () => {
    setFrame(null);
    setFilter("color");
    setPhotos([]);
    setScreen("home");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          onStart={() => setScreen("frame")}
        />
      )}

      {screen === "frame" && (
        <FrameSelection
          frame={frame}
          setFrame={setFrame}
          filter={filter}
          setFilter={setFilter}
          onConfirm={() => setScreen("camera")}
          onBack={resetApp}
        />
      )}

      {screen === "camera" && (
        <CameraView
          frame={frame}
          filter={filter}
          photos={photos}
          setPhotos={setPhotos}
          onDone={() => setScreen("preview")}
        />
      )}

      {screen === "preview" && (
        <PhotoStripPreview
          photos={photos}
          frameSrc={frame}
          filter={filter}
          onReset={resetApp}
        />
      )}
    </div>
  );
}

export default App;
