import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App";
import { TestApp } from "./TestApp";

console.log("🚀 main.tsx loaded");

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("❌ React Error Boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "20px",
          color: "red",
          background: "yellow",
          margin: "20px",
          borderRadius: "5px",
          border: "2px solid red"
        }}>
          <h1>⚠️ React Rendering Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root")!);
console.log("✅ React root created");

try {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <TestApp />
      </ErrorBoundary>
    </StrictMode>
  );
  console.log("✅ React app rendered");
} catch (error) {
  console.error("❌ React render error:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="color: red; padding: 20px; background: yellow; margin: 20px; border-radius: 5px; border: 2px solid red;">
      <h1>❌ Top-Level React Error</h1>
      <pre>${error}</pre>
    </div>
  `;
}
