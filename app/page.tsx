"use client";

import { useState } from "react";

export default function DamageAssessor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const modelName = process.env.NEXT_PUBLIC_MODEL_NAME || "InsurTech-Damage-Audit";

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

      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 10 }}>🧠 AI Car Damage Assessor</h1>
      <p style={{ marginBottom: 30 }}>
        Upload an image to detect car damages using the <strong>{modelName}</strong> model.
      </p>

      {/* Upload Section */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            marginLeft: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            backgroundColor: isLoading ? "#ccc" : "#0070f3",
            color: "#fff",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        {imageBase64 && (
          <div style={{ flex: 1 }}>
            <h3>Your Image</h3>
            <img
              src={imageBase64}
              alt="Upload preview"
              style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #ddd" }}
            />
          </div>
        )}

        {results && (
          <div style={{ flex: 1 }}>
            <h3>Results</h3>

            {/* Damage Predictions */}
            {results?.predictions?.length > 0 && (
              <ul>
                {results.predictions.map((pred: any, i: number) => (
                  <li key={i}>
                    <strong>{pred.class}</strong> —{" "}
                    {pred.severity
                      ? `Severity: ${pred.severity}%`
                      : `Confidence: ${(pred.confidence * 100).toFixed(1)}%`}
                  </li>
                ))}
              </ul>
            )}

            {/* Damages Extracted Section */}
            {results?.damages_extracted && (
              <div style={{ marginTop: 20 }}>
                <h4>Structured Damage Summary</h4>
{Object.entries(results.damages_extracted as Record<string, { part: string; type: string; severity: number | null }[]>)
  .map(([section, damages]) => (
                    <div key={section} style={{ marginBottom: 10 }}>
                      <h5 style={{ textTransform: "capitalize" }}>{section}</h5>
                      <ul>
                        {damages.map((dmg, idx) => (
                          <li key={idx}>
                            {dmg.part} — {dmg.type} (
                            {dmg.severity !== null ? `${dmg.severity}%` : "N/A"})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw JSON Output */}
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                marginTop: 15,
                background: "#f0f0f0",
                border: "none",
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {showJson ? "Hide JSON" : "Show JSON"}
            </button>

            {showJson && (
              <pre
                style={{
                  backgroundColor: "#f8f8f8",
                  padding: 10,
                  borderRadius: 6,
                  overflowX: "auto",
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
