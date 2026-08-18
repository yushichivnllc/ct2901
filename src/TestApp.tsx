export function TestApp() {
  console.log("✅ TestApp rendering");
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
      }}>
        <h1 style={{ color: "#333", margin: "0 0 20px 0" }}>✅ React is Working!</h1>
        <p style={{ color: "#666", margin: "0 0 20px 0" }}>TestApp component rendered successfully</p>
        <p style={{ color: "#999", fontSize: "12px" }}>If you see this, React and styling are working.</p>
      </div>
    </div>
  );
}
