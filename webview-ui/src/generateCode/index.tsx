import React from "react";
import { createRoot } from "react-dom/client";
import "../css/main.css"
import { sendReady } from "../utilities/common-command-webview";
import GenerateCodeView from "./generateCodeView";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <GenerateCodeView />
  </React.StrictMode>,
);

sendReady();
