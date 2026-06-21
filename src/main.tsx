import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { markPerformance } from "./utils/performance";

markPerformance("app-start");

const root = document.getElementById("root");

if (!root) {
  throw new Error("The application root element is missing.");
}

createRoot(root).render(<App />);
