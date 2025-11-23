import { NextResponse } from "next/server";

// High-value flags (critical issues)
const HIGH_VALUE_FLAGS = [
  "IMPROPER_REPAIR", "MISSING_PART", "CORROSION", "PAINT_PEELING",
  "GLASS_SHATTER", "PUNCTURE", "BROKEN_LIGHT", "FLAT_TYRE", "FLOOD_RESIDUE"
];

interface DecodedDamage {
  part: string;
  defect_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  paint_status: 'INTACT' | 'BROKEN' | 'UNKNOWN';
  repair_action: string;
  confidence: number;
  raw_class: string;
}

// Decode 417-class predictions
function decodePrediction(pred: any): DecodedDamage {
  const raw = pred.class.toUpperCase();

  // Handle high-value flags
  if (HIGH_VALUE_FLAGS.includes(raw)) {
    return {
      part: "VEHICLE",
      defect_type: raw.replace(/_/g, ' '),
      severity: 'CRITICAL',
      paint_status: 'UNKNOWN',
      repair_action: "MANUAL_REVIEW_REQUIRED",
      confidence: pred.confidence,
      raw_class: raw
    };
  }

  // Parse standard format: COMPONENT_DEFECT_SEVERITY_PAINTSTATUS
  const parts = raw.split('_');

  if (parts.length < 4) {
    return {
      part: "UNKNOWN",
      defect_type: raw,
      severity: 'LOW',
      paint_status: 'UNKNOWN',
      repair_action: "INSPECT",
      confidence: pred.confidence,
      raw_class: raw
    };
  }

  const paintStatus = parts[parts.length - 1] as 'INTACT' | 'BROKEN';
  const severityCode = parts[parts.length - 2];
  const defectType = parts[parts.length - 3];
  const componentParts = parts.slice(0, parts.length - 3);
  const componentName = componentParts.join(' ');

  // Determine repair action
  let action = "Refinish/Repair";
  if (paintStatus === 'INTACT' && defectType === 'DENT' && severityCode !== 'HIGH') {
    action = "PDR (Paintless Dent Repair)";
  } else if (severityCode === 'HIGH' || paintStatus === 'BROKEN') {
    action = "Bodywork & Paint Required";
  }
  if (defectType === 'CRACK' || defectType === 'PUNCTURE') {
    action = "Replace Component";
  }

  return {
    part: componentName,
    defect_type: defectType,
    severity: severityCode as 'LOW' | 'MEDIUM' | 'HIGH',
    paint_status: paintStatus,
    repair_action: action,
    confidence: pred.confidence,
    raw_class: raw
  };
}

// Generate AI summary
function generateAISummary(damages: DecodedDamage[]): string {
  if (damages.length === 0) return "No visible damage detected. Vehicle appears to be in good condition.";

  const critical = damages.filter(d => d.severity === 'CRITICAL');
  const severe = damages.filter(d => d.severity === 'HIGH');
  const moderate = damages.filter(d => d.severity === 'MEDIUM');
  const minor = damages.filter(d => d.severity === 'LOW');

  let narrative = `AI Inspection found ${damages.length} issue${damages.length > 1 ? 's' : ''}. `;

  if (critical.length > 0) {
    narrative += `⚠️ CRITICAL FLAGS: ${critical.map(c => c.defect_type).join(', ')} detected. Policy review required. `;
  }

  if (severe.length > 0) {
    const parts = [...new Set(severe.map(d => d.part))].join(', ');
    narrative += `Severe damage found on: ${parts}. These components likely require replacement or major bodywork. `;
  }

  if (moderate.length > 0) {
    narrative += `Moderate damage detected on ${moderate.length} panel${moderate.length > 1 ? 's' : ''} requiring refinishing. `;
  }

  if (minor.length > 0) {
    const pdrCandidates = minor.filter(m => m.repair_action.includes("PDR"));
    if (pdrCandidates.length > 0) {
      narrative += `Minor dents found on ${pdrCandidates.length} panel${pdrCandidates.length > 1 ? 's' : ''} are candidates for cost-saving PDR. `;
    } else {
      narrative += `Minor cosmetic imperfections noted. `;
    }
  }

  return narrative;
}

export async function POST(request: Request) {
  const { image } = await request.json();

  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;

  if (!apiKey || !modelId) {
    return NextResponse.json(
      { error: "Server configuration error. API key or Model ID is missing." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://detect.roboflow.com/${modelId}?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: image.split(",")[1],
      }
    );

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      // Decode predictions
      const structuredFindings = data.predictions.map(decodePrediction);

      // Generate AI summary
      const aiSummary = generateAISummary(structuredFindings);

      return NextResponse.json({
        ...data,
        structured_findings: structuredFindings,
        ai_summary: aiSummary
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Roboflow error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image.", details: error.message },
      { status: 500 }
    );
  }
}