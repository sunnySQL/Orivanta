import { createRoot } from "react-dom/client";
import "cesium/Build/Cesium/Widgets/widgets.css";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("The application root element is missing.");
}

createRoot(root).render(<App />);
