import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // ⚠️ THAY API_URL bằng Invoke URL thật từ API Gateway của bạn
  const API_URL = "https://4ho0sxrscg.execute-api.ap-southeast-2.amazonaws.com/dev/upload";

  const handleUpload = async () => {
    if (!username || !file) {
      setMessage("❌ Please enter username and select a file!");
      return;
    }

    setUploading(true);
    setMessage("⏳ Requesting pre-signed URL...");

    try {
      // Step 1️⃣ Gọi API Gateway → Lambda → tạo pre-signed URL
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          filename: file.name,
          mime: file.type,
        }),
      });

      if (!res.ok) throw new Error(`Lambda error: ${res.status}`);
      const data = await res.json();

      if (!data.uploadUrl) throw new Error("No upload URL received.");

      // Step 2️⃣ Upload file trực tiếp lên S3
      setMessage("⬆️ Uploading file to S3...");
      const putRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (putRes.ok) {
        setMessage("✅ Upload successful!");
      } else {
        throw new Error(`S3 upload failed (${putRes.status})`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>📁 DocShare Upload</h1>
      <div>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", width: "250px", marginBottom: "10px" }}
        />
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "15px" }}
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      <p style={{ marginTop: "20px" }}>{message}</p>
    </div>
  );
}

export default App;
