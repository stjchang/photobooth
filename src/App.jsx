import { useState } from "react";
import CameraView from "./components/CameraView";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="app">
      {!started ? (
        <button className="start-btn" onClick={() => setStarted(true)}>
          START
        </button>
      ) : (
        <CameraView />
      )}
    </div>
  );
}