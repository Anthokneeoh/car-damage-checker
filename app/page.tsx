"use client";

import { useState, useRef, useEffect } from "react";

export default function DamageAssessor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const modelName = "InsurTech-Damage-Audit";

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };

        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setResults(null);
      setIsLoading(true);

      try {
        const compressed = await compressImage(selectedFile);
        setImageBase64(compressed);
      } catch {
        setError("Failed to process image.");
      } finally {
        setIsLoading(false);
      }
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

      // Filter low-confidence predictions
      const validPredictions = data.predictions?.filter((pred: any) => pred.confidence >= 0.48) || [];

      if (validPredictions.length === 0) {
        setError("⚠️ No damage detected with sufficient confidence. Please upload a clearer car photo.");
        setIsLoading(false);
        return;
      }

      setResults({ ...data, predictions: validPredictions });
      setShowSummary(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (results?.predictions && imageRef.current && canvasRef.current) {
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
        const textWidth = ctx.measureText(label).width;

        ctx.font = "16px Arial";
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
          Upload an image to detect car damages using the <strong>{modelName}</strong> model with 417 granular classes.
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
            disabled={isLoading || !imageBase64}
            style={{
              padding: "12px 20px",
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: isLoading || !imageBase64 ? "#ccc" : "#0070f3",
              color: "#fff",
              cursor: isLoading || !imageBase64 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            {isLoading ? "Processing..." : "Analyze Image"}
          </button>
        </div>

        {error && (
          <p style={{
            color: "red",
            padding: "15px",
            backgroundColor: "#fee",
            borderRadius: 6,
            marginBottom: 20,
          }}>
            {error}
          </p>
        )}

        {/* Toggle Buttons */}
        {results && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowSummary(!showSummary)}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: showSummary ? "2px solid #9333ea" : "1px solid #ccc",
                backgroundColor: showSummary ? "#9333ea" : "#f0f0f0",
                color: showSummary ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {showSummary ? "Hide AI Summary" : "Show AI Summary"}
            </button>
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: showJson ? "2px solid #1f2937" : "1px solid #ccc",
                backgroundColor: showJson ? "#1f2937" : "#f0f0f0",
                color: showJson ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {showJson ? "Hide JSON" : "Show JSON"}
            </button>
          </div>
        )}

        {/* AI Summary */}
        {results && showSummary && results.ai_summary && (
          <div style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #9333ea",
            marginBottom: 20
          }}>
            <h2 style={{ fontSize: "20px", marginBottom: 10, color: "#9333ea" }}>
              ✨ AI Inspection Report
            </h2>
            <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
              {results.ai_summary}
            </p>

            {/* Detailed Findings */}
            {results.structured_findings && (
              <div style={{ marginTop: 15 }}>
                {results.structured_findings.map((item: any, idx: number) => (
                  <div key={idx} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: "14px",
                    flexWrap: "wrap",
                    gap: 5
                  }}>
                    <span style={{ fontWeight: "600", color: "#333" }}>{item.part}</span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: "12px",
                      backgroundColor:
                        item.severity === 'HIGH' || item.severity === 'CRITICAL' ? '#fee' :
                          item.severity === 'MEDIUM' ? '#fef3c7' : '#d1fae5',
                      color:
                        item.severity === 'HIGH' || item.severity === 'CRITICAL' ? '#991b1b' :
                          item.severity === 'MEDIUM' ? '#92400e' : '#065f46'
                    }}>
                      {item.defect_type} ({item.repair_action})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JSON Display */}
        {results && showJson && (
          <div style={{
            backgroundColor: "#1f2937",
            color: "#10b981",
            padding: 15,
            borderRadius: 8,
            overflowX: "auto",
            marginBottom: 20,
            fontSize: "12px",
            fontFamily: "monospace"
          }}>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
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
                    border: "1px solid #ddd",
                  }}
                />
                {results && (
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {results && (
            <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
              <h3 style={{ fontSize: "clamp(18px, 4vw, 20px)" }}>Raw Detections</h3>
              {results?.predictions?.length > 0 && (
                <ul style={{ paddingLeft: 20, fontSize: "clamp(14px, 3vw, 16px)" }}>
                  {results.predictions.map((pred: any, i: number) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      <strong>{pred.class}</strong> — Confidence: {(pred.confidence * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}