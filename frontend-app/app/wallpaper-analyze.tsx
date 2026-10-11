import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const SCREEN_W = Dimensions.get("window").width - 48;

export default function WallpaperAnalyze() {
  const { area, detectedWalls } = useLocalSearchParams<{
    area: string;
    detectedWalls?: string;
  }>();

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalBase64, setOriginalBase64] = useState<string>("");
  const [tileImage, setTileImage] = useState<string | null>(null);
  const [tileBase64, setTileBase64] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [repeatCount, setRepeatCount] = useState(4);
  const [analysisDesc, setAnalysisDesc] = useState("");
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const b64 = result.assets[0].base64 ?? "";
      setOriginalImage(uri);
      setOriginalBase64(b64);
      setTileImage(null);
      setTileBase64("");
      setAnalysisDesc("");
      setCropBox(null);

      Image.getSize(uri, (w, h) => setImgSize({ width: w, height: h }));
      analyzePattern(b64, uri);
    }
  };

  const analyzePattern = async (base64: string, uri: string) => {
    setIsAnalyzing(true);

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      // 더미 결과 — API 키 없을 때
      setTimeout(async () => {
        setAnalysisDesc("격자 무늬 패턴이 감지되었어요. 수평·수직 반복이 균일한 타일형 패턴이에요.");
        setRepeatCount(4);
        // 더미: 원본 이미지의 좌상단 25% 크롭
        try {
          Image.getSize(uri, async (w, h) => {
            const cropW = Math.floor(w * 0.5);
            const cropH = Math.floor(h * 0.5);
            const result = await ImageManipulator.manipulateAsync(
              uri,
              [{ crop: { originX: 0, originY: 0, width: cropW, height: cropH } }],
              { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            setTileImage(result.uri);
            setTileBase64(result.base64 ?? "");
            setCropBox({ x: 0, y: 0, w: cropW, h: cropH });
          });
        } catch {
          setTileImage(uri);
          setTileBase64(base64);
        }
        setIsAnalyzing(false);
      }, 2000);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: "image/jpeg", data: base64 } },
                {
                  text: `이 벽지 이미지를 분석해줘.
1. 패턴의 최소 반복 단위(타일 하나)의 영역을 이미지 전체 크기 대비 비율로 알려줘.
   - originX_ratio: 시작 X 비율 (0~1)
   - originY_ratio: 시작 Y 비율 (0~1)
   - width_ratio: 타일 너비 비율 (0~1)
   - height_ratio: 타일 높이 비율 (0~1)
2. 이 패턴을 벽에 타일처럼 붙일 때 적절한 반복 횟수 (1~8 중 하나)
3. 패턴에 대한 한 줄 설명 (한국어)

반드시 아래 JSON 형식으로만 답해줘. 다른 말은 절대 하지 마.
{
  "originX_ratio": 0.0,
  "originY_ratio": 0.0,
  "width_ratio": 0.5,
  "height_ratio": 0.5,
  "repeat": 4,
  "description": "패턴 설명"
}`,
                },
              ],
            }],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      setAnalysisDesc(parsed.description ?? "");
      setRepeatCount(parsed.repeat ?? 4);

      // 원본 이미지 크기 기반으로 픽셀 좌표 계산
      Image.getSize(uri, async (w, h) => {
        const originX = Math.floor((parsed.originX_ratio ?? 0) * w);
        const originY = Math.floor((parsed.originY_ratio ?? 0) * h);
        const cropW = Math.max(10, Math.min(w - originX, Math.floor((parsed.width_ratio ?? 0.5) * w)));
        const cropH = Math.max(10, Math.min(h - originY, Math.floor((parsed.height_ratio ?? 0.5) * h)));

        try {
          const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ crop: { originX, originY, width: cropW, height: cropH } }],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          setTileImage(result.uri);
          setTileBase64(result.base64 ?? "");
          setCropBox({ x: originX, y: originY, w: cropW, h: cropH });
        } catch {
          setTileImage(uri);
          setTileBase64(base64);
        }
      });
    } catch {
      Alert.alert("안내", "AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyWallpaper = () => {
    if (!tileBase64) {
      Alert.alert("안내", "먼저 벽지 사진을 분석해 주세요.");
      return;
    }

    const base64Uri = `data:image/jpeg;base64,${tileBase64}`;

    router.replace({
      pathname: "/material-select",
      params: {
        detectedWalls,
        wallpaperArea: area,
        wallpaperBase64: base64Uri,
        wallpaperRepeat: String(repeatCount),
      },
    } as any);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>벽지 패턴 분석</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.guide}>벽지 사진을 올리면 AI가 패턴 단위를 분석해 3D 벽면에 적용해요.</Text>

        {/* 사진 업로드 */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          {originalImage ? (
            <Image source={{ uri: originalImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>+</Text>
              <Text style={styles.uploadText}>벽지 사진 선택하기</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 분석 중 */}
        {isAnalyzing && (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="small" color="#222" />
            <Text style={styles.analyzingText}>AI가 패턴을 분석 중이에요...</Text>
          </View>
        )}

        {/* 분석 결과 */}
        {tileImage && !isAnalyzing && (
          <>
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>분석 결과</Text>
              {analysisDesc !== "" && (
                <Text style={styles.resultDesc}>{analysisDesc}</Text>
              )}

              <Text style={styles.tileLabel}>추출된 패턴 타일</Text>
              <View style={styles.tilePreviewWrap}>
                <Image source={{ uri: tileImage }} style={styles.tilePreview} />
              </View>

              {/* 반복 횟수 조절 */}
              <Text style={styles.repeatLabel}>패턴 반복 크기</Text>
              <View style={styles.repeatButtons}>
                <TouchableOpacity
                  style={styles.repeatBtn}
                  onPress={() => setRepeatCount((p) => Math.max(1, p + 1))}
                >
                  <Text style={styles.repeatBtnText}>작게 −</Text>
                </TouchableOpacity>
                <Text style={styles.repeatValue}>{repeatCount}</Text>
                <TouchableOpacity
                  style={styles.repeatBtn}
                  onPress={() => setRepeatCount((p) => Math.min(8, p - 1))}
                >
                  <Text style={styles.repeatBtnText}>크게 +</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 다시 분석 */}
            <TouchableOpacity style={styles.reanalyzeButton} onPress={pickImage}>
              <Text style={styles.reanalyzeText}>다른 사진으로 다시 분석</Text>
            </TouchableOpacity>

            {/* 적용하기 */}
            <TouchableOpacity style={styles.applyButton} onPress={applyWallpaper}>
              <Text style={styles.applyText}>이 패턴으로 적용하기</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f5f7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: "#f3f5f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: { width: 36, height: 36, justifyContent: "center" },
  backArrow: { fontSize: 26, fontWeight: "bold" },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 48 },
  guide: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
  },
  uploadedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  uploadPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  uploadIcon: { fontSize: 36, color: "#bbb", marginBottom: 8 },
  uploadText: { fontSize: 14, color: "#999", fontWeight: "bold" },
  analyzingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  analyzingText: { fontSize: 14, color: "#555" },
  resultBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  resultTitle: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 8 },
  resultDesc: { fontSize: 13, color: "#555", lineHeight: 20, marginBottom: 16 },
  tileLabel: { fontSize: 12, color: "#999", fontWeight: "bold", marginBottom: 8 },
  tilePreviewWrap: {
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  tilePreview: {
    width: SCREEN_W * 0.5,
    height: SCREEN_W * 0.5,
    borderRadius: 8,
    resizeMode: "cover",
  },
  repeatLabel: { fontSize: 12, color: "#999", fontWeight: "bold", marginBottom: 10 },
  repeatButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  repeatBtn: {
    backgroundColor: "#f3f5f7",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  repeatBtnText: { fontSize: 13, fontWeight: "bold", color: "#222" },
  repeatValue: { fontSize: 22, fontWeight: "bold", color: "#222", minWidth: 36, textAlign: "center" },
  reanalyzeButton: {
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  reanalyzeText: { fontSize: 13, color: "#999", fontWeight: "bold" },
  applyButton: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  applyText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
