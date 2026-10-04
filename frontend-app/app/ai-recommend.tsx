import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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
} from "react-native";

// 제미나이 API 키 — Google AI Studio(aistudio.google.com)에서 발급 후 입력
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";


type AiRec = {
  tag: string;
  desc: string;
  colors: Record<string, string>;
  preview: string[];
};

export default function AiRecommend() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{
    imageUri: string;
    detectedWalls?: string;
  }>();

  const wallCount = detectedWalls ?? "3";

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<AiRec[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReferenceImage(result.assets[0].uri);
      setAiDescription("");
      setKeywords([]);
      setRecommendations([]);
      analyzeWithGemini(result.assets[0].base64 ?? "");
    }
  };

  const analyzeWithGemini = async (base64: string) => {
    setIsAnalyzing(true);

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      // API 키 없을 때 더미 결과
      setTimeout(() => {
        setAiDescription(
          "이 사진은 따뜻한 우드 소재와 내추럴한 색감이 잘 어우러진 북유럽 스타일의 인테리어예요. 밝은 베이지 계열의 벽과 원목 바닥이 공간에 자연스러운 온기를 더해주고 있어요. 군더더기 없이 깔끔하면서도 소재의 질감을 살린 구성이 특징적이에요. 이 스타일에는 따뜻한 톤의 마감재와 자연 소재를 활용한 조합이 잘 어울릴 거예요."
        );
        setKeywords(["우드", "내추럴"]);
        setRecommendations([
          {
            tag: "내추럴 우드",
            desc: "따뜻한 우드톤 중심의 자연스러운 조합",
            colors: { allWalls: "#eee3ce", wall1: "#eee3ce", wall2: "#eee3ce", wall3: "#eee3ce", wall4: "#eee3ce", floor: "#b98b5b", moldingTop: "#f7f4ee", moldingBottom: "#f7f4ee" },
            preview: ["#eee3ce", "#b98b5b", "#f7f4ee"],
          },
          {
            tag: "베이지 내추럴",
            desc: "편안하고 따뜻한 베이지톤 조합",
            colors: { allWalls: "#f0ebe0", wall1: "#f0ebe0", wall2: "#f0ebe0", wall3: "#f0ebe0", wall4: "#f0ebe0", floor: "#c4a882", moldingTop: "#faf7f2", moldingBottom: "#faf7f2" },
            preview: ["#f0ebe0", "#c4a882", "#faf7f2"],
          },
        ]);
        setIsAnalyzing(false);
      }, 2000);
      return;
    }

    try {
      // 1단계: 설명 생성
      const descResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: "image/jpeg", data: base64 } },
                {
                  text: `이 인테리어 사진을 분석해서 스타일과 분위기를 3~4문장으로 설명해줘. 마감재 추천은 하지 말고, 사진의 스타일 특징만 자연스럽게 설명해줘. 한국어로 답해줘.`,
                },
              ],
            }],
          }),
        }
      );
      const descData = await descResponse.json();
      const desc = descData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      setAiDescription(desc);

      // 2단계: 키워드 + 마감재 색상 추천 (AI가 직접 색상 결정)
      const kwResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: "image/jpeg", data: base64 } },
                {
                  text: `이 인테리어 사진을 분석해서 어울리는 마감재 조합 2개를 추천해줘.
각 조합마다 벽지(allWalls), 바닥(floor), 몰딩(moldingTop, moldingBottom)에 어울리는 hex 색상 코드를 직접 골라줘.
스타일 키워드도 함께 추출해줘 (미니멀/우드/모던/내추럴/빈티지 중 선택).
반드시 아래 JSON 형식으로만 답해줘. 다른 말은 절대 하지 마.

{
  "keywords": ["키워드1", "키워드2"],
  "recommendations": [
    {
      "tag": "조합 이름",
      "desc": "한 줄 설명",
      "colors": {
        "allWalls": "#hex", "wall1": "#hex", "wall2": "#hex", "wall3": "#hex", "wall4": "#hex",
        "floor": "#hex", "moldingTop": "#hex", "moldingBottom": "#hex"
      },
      "preview": ["벽색hex", "바닥색hex", "몰딩색hex"]
    }
  ]
}`,
                },
              ],
            }],
          }),
        }
      );
      const kwData = await kwResponse.json();
      const kwText = kwData.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleaned = kwText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setKeywords(parsed.keywords ?? []);
      setRecommendations(parsed.recommendations ?? []);
    } catch {
      Alert.alert("안내", "AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyRecommendation = (rec: AiRec) => {
    Alert.alert(
      "조합 적용",
      `'${rec.tag}' 조합을 적용할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "적용하기",
          onPress: () =>
            router.push({
              pathname: "/result",
              params: {
                detectedWalls: wallCount,
                selectedColors: JSON.stringify(rec.colors),
              },
            } as any),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 추천 마감재</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* 사진 업로드 */}
        <Text style={styles.uploadGuide}>원하는 마감재 스타일 사진을 올려주세요.</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          {referenceImage ? (
            <Image source={{ uri: referenceImage }} style={styles.referenceImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadIcon}>+</Text>
              <Text style={styles.uploadText}>사진 선택하기</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 분석 중 */}
        {isAnalyzing && (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="small" color="#222" />
            <Text style={styles.analyzingText}>AI가 스타일을 분석 중이에요...</Text>
          </View>
        )}

        {/* AI 설명 */}
        {aiDescription !== "" && (
          <View style={styles.descriptionBox}>
            {/* 헤더 */}
            <View style={styles.descriptionHeader}>
              <View style={styles.aiIconBox}>
                <Text style={styles.aiIconText}>✨</Text>
              </View>
              <View>
                <Text style={styles.descriptionTitle}>AI 분석 결과</Text>
                <Text style={styles.descriptionSubtitle}>스타일 사진을 분석했어요</Text>
              </View>
            </View>

            {/* 키워드 배지 */}
            {keywords.length > 0 && (
              <View style={styles.keywordSection}>
                <Text style={styles.keywordSectionLabel}>감지된 스타일</Text>
                <View style={styles.keywordRow}>
                  {keywords.map((k, i) => (
                    <View key={i} style={styles.keywordBadge}>
                      <Text style={styles.keywordText}># {k}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 구분선 */}
            <View style={styles.descDivider} />

            {/* 설명 텍스트 */}
            <Text style={styles.descriptionText}>{aiDescription}</Text>
          </View>
        )}

        {/* 추천 마감재 조합 */}
        {recommendations.length > 0 && (
          <View style={styles.recSection}>
            <Text style={styles.recSectionTitle}>추천 마감재 조합</Text>
            {recommendations.map((rec: AiRec, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.recCard}
                onPress={() => applyRecommendation(rec)}
              >
                <View style={styles.recInfo}>
                  <Text style={styles.recTag}>{rec.tag}</Text>
                  <Text style={styles.recDesc}>{rec.desc}</Text>
                  <View style={styles.recPreview}>
                    {rec.preview.map((c, j) => (
                      <View key={j} style={[styles.recDot, {
                        backgroundColor: c,
                        borderColor: c === "#ffffff" ? "#ddd" : c,
                      }]} />
                    ))}
                  </View>
                </View>
                <Text style={styles.recApply}>적용 →</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  uploadGuide: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 14,
    textAlign: "center",
  },
  uploadButton: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIcon: { fontSize: 36, color: "#bbb", marginBottom: 8 },
  uploadText: { fontSize: 14, color: "#999", fontWeight: "bold" },
  referenceImage: { width: "100%", height: "100%", resizeMode: "cover" },
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
  descriptionBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 14,
  },
  keywordRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  keywordBadge: {
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  keywordText: { color: "white", fontSize: 13, fontWeight: "bold" },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  aiIconText: { fontSize: 22 },
  descriptionSubtitle: { fontSize: 12, color: "#999", marginTop: 2 },
  keywordSection: { marginBottom: 14 },
  keywordSectionLabel: { fontSize: 12, color: "#999", fontWeight: "bold", marginBottom: 8 },
  descDivider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 14 },
  recSection: {},
  recSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  recCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  recInfo: { flex: 1 },
  recTag: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 4 },
  recDesc: { fontSize: 12, color: "#777", marginBottom: 10 },
  recPreview: { flexDirection: "row", gap: 6 },
  recDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  recApply: { fontSize: 13, fontWeight: "bold", color: "#555", marginLeft: 8 },
});
