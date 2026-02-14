import { useState } from "react";
import { clearAllPhotos } from "./utils/indexedDB";

import HomeScreen from "./components/HomeScreen";
import FrameSelection from "./components/FrameSelection";
import CameraView from "./components/CameraView";
import PhotoStripPreview from "./components/PhotoStripPreview";
import Slideshow from "./components/Slideshow";

function App() {
  const [screen, setScreen] = useState("home");
  const [frame, setFrame] = useState(null);
  const [miniFrame, setMiniFrame] = useState(null);
  const [filter, setFilter] = useState("color"); 
  const [photos, setPhotos] = useState([]);

  const resetApp = async () => {
    try {
      await clearAllPhotos();
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }
    
    setFrame(null);
    setMiniFrame(null);
    setFilter("color");
    setPhotos([]);
    setScreen("home");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          onStart={() => setScreen("frame")}
          onOpenSlideshow={() => setScreen("slideshow")}
        />
      )}

      {screen === "slideshow" && (
        <Slideshow onBack={() => setScreen("home")} />
      )}

      {screen === "frame" && (
        <FrameSelection
          frame={frame}
          setFrame={setFrame}
          miniFrame={miniFrame}
          setMiniFrame={setMiniFrame}
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
          miniFrame={miniFrame}
          filter={filter}
          onReset={resetApp}
        />
      )}
    </div>
  );
}

export default App;
