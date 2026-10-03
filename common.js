// ============================================================
// إعدادات Firebase الخاصة بمشروعك
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyCx6sM4KaYXCXABxE9ieio_QhPDX-SP6xg",
  authDomain: "manhaj-science1.firebaseapp.com",
  projectId: "manhaj-science1",
  storageBucket: "manhaj-science1.firebasestorage.app",
  messagingSenderId: "275504808566",
  appId: "1:275504808566:web:16d3951b587e2727c9d557"
};

// ============================================================
// فك رمز الإنجاز (يدعم الصيغة القديمة والصيغة v3 الجديدة)
// الصيغة القديمة:  اسم|فصل|توقيت|صحيح|إجمالي|دقائق|          (base64).checksum
// الصيغة v3:       v3|اسم|فصل|رقم_الطالب|توقيت|صحيح|إجمالي|دقائق|[أبواب متقنة]  (base64).checksum
// ============================================================
export function decodeCode(raw) {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\s+/g, "");
  // بعض الأجهزة تولّد رمزًا بدون لاحقة التحقق (.xxxxxx) — نقبله وما نعتبره
  // رمزًا تالفًا، لأن التحقق (checksum) مجرد تلميح إضافي وليس شرطًا لفك الرمز
  const dotIdx = trimmed.lastIndexOf(".");
  const payload = dotIdx === -1 ? trimmed : trimmed.slice(0, dotIdx);
  const checksum = dotIdx === -1 ? "" : trimmed.slice(dotIdx + 1);

  let decodedText;
  try {
    let b64 = payload;
    while (b64.length % 4 !== 0) b64 += "=";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    decodedText = new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    return null;
  }

  const parts = decodedText.split("|");
  if (parts.length < 5) return null;

  if (parts[0] === "v3") {
    return {
      version: "v3",
      name: parts[1] || "",
      cls: parts[2] || "",
      studentNumber: parts[3] || "",
      timestamp: parts[4] || "",
      correct: parseInt(parts[5] || "0", 10) || 0,
      total: parseInt(parts[6] || "0", 10) || 0,
      minutes: parseInt(parts[7] || "0", 10) || 0,
      mastered: parts[8] ? parts[8].split(",").filter(Boolean) : [],
      checksum,
      raw: trimmed
    };
  }

  // الصيغة القديمة: name|class|timestamp|correct|total|minutes|
  return {
    version: "v1",
    name: parts[0] || "",
    cls: parts[1] || "",
    studentNumber: "",
    timestamp: parts[2] || "",
    correct: parseInt(parts[3] || "0", 10) || 0,
    total: parseInt(parts[4] || "0", 10) || 0,
    minutes: parseInt(parts[5] || "0", 10) || 0,
    mastered: [],
    checksum,
    raw: trimmed
  };
}

// يحوّل التوقيت YYYYMMDDHHmm إلى صيغة مقروءة
export function formatTimestamp(ts) {
  if (!ts || ts.length < 12) return ts || "—";
  const y = ts.slice(0, 4), mo = ts.slice(4, 6), d = ts.slice(6, 8);
  const h = ts.slice(8, 10), mi = ts.slice(10, 12);
  return `${y}/${mo}/${d} ${h}:${mi}`;
}

// هوية فريدة للطالب: رقم الطالب إن وجد، وإلا الاسم + الفصل
export function studentKey(decoded, fallbackClass) {
  const cls = decoded.cls || fallbackClass || "";
  if (decoded.studentNumber) return `${cls}#${decoded.studentNumber}`;
  return `${cls}#${decoded.name}`;
}
