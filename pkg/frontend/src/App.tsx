import { Scene } from "./components/Scene/Scene";
import { UI } from "@/config/constants";

function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Scene />
      <div
        style={{
          position: "fixed",
          bottom: UI.helpPanel.bottom,
          left: UI.helpPanel.left,
          padding: UI.helpPanel.padding,
          background: UI.helpPanel.background,
          borderRadius: UI.helpPanel.borderRadius,
          fontSize: UI.helpPanel.fontSize,
          color: UI.helpPanel.color,
          zIndex: UI.helpPanel.zIndex,
          border: UI.helpPanel.border,
        }}
      >
        <div>WASD: 移動</div>
        <div>タイルクリック: 炎魔法（準備中）</div>
      </div>
    </div>
  );
}

export default App;
