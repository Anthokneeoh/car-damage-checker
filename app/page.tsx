"use client";

import { useState, useRef, useEffect } from "react";

export default function DamageAssessor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const modelName = "InsurTech-Damage-Audit";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setResults(null);

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => setImageBase64(reader.result as string);
      reader.onerror = () => setError("Failed to read file.");
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageBase64) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "An unknown error occurred.");

      // Validate if it's a vehicle image
      if (data.predictions && data.predictions.length > 0) {
        const hasVehicleParts = data.predictions.some((pred: any) => {
          const className = pred.class.toLowerCase();
          return className.includes('bumper') || 
                 className.includes('door') || 
                 className.includes('hood') || 
                 className.includes('window') || 
                 className.includes('headlight') ||
                 className.includes('tail_light') ||
                 className.includes('tyre') ||
                 className.includes('windscreen') ||
                 className.includes('mirror');
        });

        if (!hasVehicleParts) {
          setError("⚠️ This doesn't appear to be a vehicle image. Please upload a car photo.");
          setIsLoading(false);
          return;
        }
      } else {
        setError("⚠️ No vehicle parts detected. Please upload a clear car photo.");
        setIsLoading(false);
        return;
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (results && results.predictions && imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);

      results.predictions.forEach((pred: any) => {
        const { x, y, width, height, class: className, confidence } = pred;

        const boxX = x - width / 2;
        const boxY = y - height / 2;

        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX, boxY, width, height);

        const label = `${className} ${(confidence * 100).toFixed(1)}%`;
        ctx.font = "16px Arial";
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(boxX, boxY - 25, textWidth + 10, 25);

        ctx.fillStyle = "#000000";
        ctx.fillText(label, boxX + 5, boxY - 7);
      });
    }
  }, [results]);

  return (
    <>
      <style jsx>{`
        .container {
          font-family: Inter, sans-serif;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
          box-sizing: border-box;
        }
        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-start;
        }
        @media (min-width: 768px) {
          .results-grid {
            flex-direction: row;
          }
        }
      `}</style>
      
      <div className="container">
        <h1 style={{ marginBottom: 10, fontSize: "clamp(24px, 5vw, 32px)" }}>
          🧠 AI Car Damage Assessor
        </h1>
        <p style={{ marginBottom: 30, fontSize: "clamp(14px, 3vw, 16px)" }}>
          Upload an image to detect car damages using the <strong>{modelName}</strong> model.
        </p>

        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: "10px" }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ fontSize: "14px" }}
          />
          <button
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            style={{
              padding: "12px 20px",
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: isLoading ? "#ccc" : "#0070f3",
              color: "#fff",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
              width: "100%",
              maxWidth: "300px"
            }}
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {error && (
          <p style={{ 
            color: "red",
            padding: "15px",
            backgroundColor: "#fee",
            borderRadius: 6,
            marginBottom: 20
          }}>
            {error}
          </p>
        )}

        <div className="results-grid">
          {imageBase64 && (
            <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
              <h3 style={{ fontSize: "clamp(18px, 4vw, 20px)" }}>Your Image</h3>
              <div style={{ position: "relative", width: "100%" }}>
                <img
                  ref={imageRef}
                  src={imageBase64}
                  alt="Upload preview"
                  style={{ 
                    display: results ? "none" : "block", 
                    width: "100%",
                    height: "auto",
                    borderRadius: 8, 
                    border: "1px solid #ddd" 
                  }}
                />
                
                {results && (
                  <canvas
                    ref={canvasRef}
                    style={{ 
                      width: "100%",
                      height: "auto",
                      borderRadius: 8, 
                      border: "1px solid #ddd" 
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {results && (
            <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
              <h3 style={{ fontSize: "clamp(18px, 4vw, 20px)" }}>Results</h3>

              {results?.predictions?.length > 0 && (
                <ul style={{ paddingLeft: 20, fontSize: "clamp(14px, 3vw, 16px)" }}>
                  {results.predictions.map((pred: any, i: number) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <strong>{pred.class}</strong> — Confidence: {(pred.confidence * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setShowJson(!showJson)}
                style={{
                  marginTop: 15,
                  background: "#f0f0f0",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                {showJson ? "Hide JSON" : "Show JSON"}
              </button>

              {showJson && (
                <pre style={{
                  backgroundColor: "#f8f8f8",
                  padding: 10,
                  borderRadius: 6,
                  overflowX: "auto",
                  marginTop: 10,
                  fontSize: "clamp(10px, 2.5vw, 12px)",
                  maxWidth: "100%"
                }}>
                  {JSON.stringify(results, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}