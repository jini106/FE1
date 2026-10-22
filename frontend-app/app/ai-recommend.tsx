import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { roomImages } from "./roomImages";
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

const SCREEN_W = Dimensions.get("window").width;

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

// ─── 마감재 풀 ───────────────────────────────────────────
const MATERIAL_POOL: Record<string, { tag: string; desc: string; colors: Record<string, string>; preview: string[] }[]> = {
  미니멀: [
    { tag: "미니멀 화이트", desc: "깔끔하고 단순한 화이트 베이스 조합", colors: { allWalls: "#ffffff", wall1: "#ffffff", wall2: "#ffffff", wall3: "#ffffff", wall4: "#ffffff", floor: "#e0d8cc", moldingTop: "#ffffff", moldingBottom: "#ffffff" }, preview: ["#ffffff", "#e0d8cc", "#ffffff"] },
    { tag: "미니멀 그레이", desc: "세련된 그레이톤 미니멀 조합", colors: { allWalls: "#f0f0f0", wall1: "#f0f0f0", wall2: "#f0f0f0", wall3: "#f0f0f0", wall4: "#f0f0f0", floor: "#b0a898", moldingTop: "#f8f8f8", moldingBottom: "#f8f8f8" }, preview: ["#f0f0f0", "#b0a898", "#f8f8f8"] },
  ],
  우드: [
    { tag: "내추럴 우드", desc: "따뜻한 우드톤 중심의 자연스러운 조합", colors: { allWalls: "#eee3ce", wall1: "#eee3ce", wall2: "#eee3ce", wall3: "#eee3ce", wall4: "#eee3ce", floor: "#b98b5b", moldingTop: "#f7f4ee", moldingBottom: "#f7f4ee" }, preview: ["#eee3ce", "#b98b5b", "#f7f4ee"] },
    { tag: "다크 우드", desc: "진한 우드 바닥과 밝은 벽의 대비 조합", colors: { allWalls: "#f5f0e8", wall1: "#f5f0e8", wall2: "#f5f0e8", wall3: "#f5f0e8", wall4: "#f5f0e8", floor: "#7a5637", moldingTop: "#faf7f2", moldingBottom: "#faf7f2" }, preview: ["#f5f0e8", "#7a5637", "#faf7f2"] },
  ],
  모던: [
    { tag: "모던 블랙&화이트", desc: "대비감 있는 모던 스타일 조합", colors: { allWalls: "#cfcfc9", wall1: "#cfcfc9", wall2: "#cfcfc9", wall3: "#cfcfc9", wall4: "#cfcfc9", floor: "#4a4a4a", moldingTop: "#ffffff", moldingBottom: "#ffffff" }, preview: ["#cfcfc9", "#4a4a4a", "#ffffff"] },
    { tag: "모던 그레이쉬", desc: "차분한 그레이 계열의 모던 조합", colors: { allWalls: "#e2e2e0", wall1: "#e2e2e0", wall2: "#e2e2e0", wall3: "#e2e2e0", wall4: "#e2e2e0", floor: "#888885", moldingTop: "#f4f4f3", moldingBottom: "#f4f4f3" }, preview: ["#e2e2e0", "#888885", "#f4f4f3"] },
  ],
  내추럴: [
    { tag: "내추럴 베이지", desc: "편안하고 따뜻한 베이지톤 조합", colors: { allWalls: "#f0ebe0", wall1: "#f0ebe0", wall2: "#f0ebe0", wall3: "#f0ebe0", wall4: "#f0ebe0", floor: "#c4a882", moldingTop: "#faf7f2", moldingBottom: "#faf7f2" }, preview: ["#f0ebe0", "#c4a882", "#faf7f2"] },
    { tag: "내추럴 그린", desc: "자연 친화적인 그린 포인트 조합", colors: { allWalls: "#e8ede4", wall1: "#e8ede4", wall2: "#e8ede4", wall3: "#e8ede4", wall4: "#e8ede4", floor: "#b5a07a", moldingTop: "#f5f7f3", moldingBottom: "#f5f7f3" }, preview: ["#e8ede4", "#b5a07a", "#f5f7f3"] },
  ],
  빈티지: [
    { tag: "빈티지 웜톤", desc: "레트로한 느낌의 따뜻한 빈티지 조합", colors: { allWalls: "#ddd5c4", wall1: "#ddd5c4", wall2: "#ddd5c4", wall3: "#ddd5c4", wall4: "#ddd5c4", floor: "#8b6f4e", moldingTop: "#eeebe4", moldingBottom: "#eeebe4" }, preview: ["#ddd5c4", "#8b6f4e", "#eeebe4"] },
  ],
  파스텔: [
    { tag: "소프트 파스텔", desc: "부드럽고 사랑스러운 파스텔톤 조합", colors: { allWalls: "#f5eef8", wall1: "#f5eef8", wall2: "#f5eef8", wall3: "#f5eef8", wall4: "#f5eef8", floor: "#d4bfdb", moldingTop: "#fdf8ff", moldingBottom: "#fdf8ff" }, preview: ["#f5eef8", "#d4bfdb", "#fdf8ff"] },
    { tag: "민트 파스텔", desc: "상큼하고 청량한 민트 파스텔 조합", colors: { allWalls: "#eaf4f2", wall1: "#eaf4f2", wall2: "#eaf4f2", wall3: "#eaf4f2", wall4: "#eaf4f2", floor: "#a8cdc7", moldingTop: "#f4faf9", moldingBottom: "#f4faf9" }, preview: ["#eaf4f2", "#a8cdc7", "#f4faf9"] },
    { tag: "피치 파스텔", desc: "따뜻하고 포근한 피치 파스텔 조합", colors: { allWalls: "#fdf0eb", wall1: "#fdf0eb", wall2: "#fdf0eb", wall3: "#fdf0eb", wall4: "#fdf0eb", floor: "#d4a090", moldingTop: "#fff8f5", moldingBottom: "#fff8f5" }, preview: ["#fdf0eb", "#d4a090", "#fff8f5"] },
  ],
  어스톤: [
    { tag: "클레이 어스", desc: "흙빛 느낌의 따뜻한 어스톤 조합", colors: { allWalls: "#e8ddd0", wall1: "#e8ddd0", wall2: "#e8ddd0", wall3: "#e8ddd0", wall4: "#e8ddd0", floor: "#9e7a5a", moldingTop: "#f2ede6", moldingBottom: "#f2ede6" }, preview: ["#e8ddd0", "#9e7a5a", "#f2ede6"] },
    { tag: "머스터드 어스", desc: "생동감 있는 머스터드 포인트 어스톤", colors: { allWalls: "#ede5d4", wall1: "#ede5d4", wall2: "#ede5d4", wall3: "#ede5d4", wall4: "#ede5d4", floor: "#b08a4a", moldingTop: "#f7f2e8", moldingBottom: "#f7f2e8" }, preview: ["#ede5d4", "#b08a4a", "#f7f2e8"] },
  ],
  모노톤: [
    { tag: "퓨어 화이트", desc: "순수하고 깨끗한 올 화이트 조합", colors: { allWalls: "#fafafa", wall1: "#fafafa", wall2: "#fafafa", wall3: "#fafafa", wall4: "#fafafa", floor: "#d8d8d8", moldingTop: "#ffffff", moldingBottom: "#ffffff" }, preview: ["#fafafa", "#d8d8d8", "#ffffff"] },
    { tag: "딥 모노", desc: "차분하고 세련된 다크 모노톤 조합", colors: { allWalls: "#d0d0d0", wall1: "#d0d0d0", wall2: "#d0d0d0", wall3: "#d0d0d0", wall4: "#d0d0d0", floor: "#4a4a4a", moldingTop: "#e8e8e8", moldingBottom: "#e8e8e8" }, preview: ["#d0d0d0", "#4a4a4a", "#e8e8e8"] },
  ],
  비비드: [
    { tag: "딥 블루 포인트", desc: "세련된 딥 블루 포인트 조합", colors: { allWalls: "#eef0f5", wall1: "#eef0f5", wall2: "#eef0f5", wall3: "#eef0f5", wall4: "#eef0f5", floor: "#7a8fae", moldingTop: "#f8f9fc", moldingBottom: "#f8f9fc" }, preview: ["#eef0f5", "#7a8fae", "#f8f9fc"] },
    { tag: "테라코타 포인트", desc: "활기찬 테라코타 포인트 조합", colors: { allWalls: "#f5ede8", wall1: "#f5ede8", wall2: "#f5ede8", wall3: "#f5ede8", wall4: "#f5ede8", floor: "#c4704a", moldingTop: "#faf5f2", moldingBottom: "#faf5f2" }, preview: ["#f5ede8", "#c4704a", "#faf5f2"] },
  ],
};

// ─── 단계별 선택 옵션 정의 ───────────────────────────────
// imageUri: 질감/분위기는 Unsplash 무료 이미지 사용 (swatches는 색상톤 전용)
const STEPS = [
  {
    key: "색상톤",
    question: "어떤 색상 톤이 좋으세요?",
    subtitle: "마음에 드는 색감을 선택해 주세요.",
    type: "swatch" as const,
    options: [
      { label: "파스텔", swatches: ["#f5eef8", "#eaf4f2", "#fdf0eb", "#fef9e8"] },
      { label: "어스톤", swatches: ["#e8ddd0", "#c4a882", "#b08a4a", "#8b6040"] },
      { label: "모노톤", swatches: ["#ffffff", "#d0d0d0", "#888888", "#3a3a3a"] },
      { label: "비비드", swatches: ["#a8c8e8", "#e8a8b8", "#a8d8a8", "#e8d08a"] },
    ],
  },
  {
    key: "질감",
    question: "어떤 질감이 좋으세요?",
    subtitle: "마음에 드는 질감을 선택해 주세요.",
    type: "image" as const,
    options: [
      { label: "매트", imageUri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
      { label: "광택", imageUri: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80" },
      { label: "패브릭", imageUri: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80" },
      { label: "우드", imageUri: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&q=80" },
    ],
  },
  {
    key: "분위기",
    question: "어떤 분위기의 공간을 원하세요?",
    subtitle: "마음에 드는 공간 스타일을 선택해 주세요.",
    type: "image" as const,
    options: [
      { label: "미니멀", imageUri: roomImages.minimal },
      { label: "내추럴", imageUri: roomImages.natural },
      { label: "모던", imageUri: roomImages.modern },
      { label: "빈티지", imageUri: roomImages.vintage },
    ],
  },
] as const;

type StepKey = "색상톤" | "질감" | "분위기";

function mapSelectionsToKeywords(selections: Partial<Record<StepKey, string>>): string[] {
  const keywords: string[] = [];
  if (selections["색상톤"] === "파스텔") keywords.push("파스텔");
  else if (selections["색상톤"] === "어스톤") keywords.push("어스톤");
  else if (selections["색상톤"] === "모노톤") keywords.push("모노톤");
  else if (selections["색상톤"] === "비비드") keywords.push("비비드");
  if (selections["질감"] === "우드") keywords.push("우드");
  if (selections["분위기"]) keywords.push(selections["분위기"]);
  return [...new Set(keywords)];
}

// ─── 메인 컴포넌트 ───────────────────────────────────────
export default function AiRecommend() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{ imageUri: string; detectedWalls?: string }>();
  const wallCount = detectedWalls ?? "3";

  // 탭
  const [activeTab, setActiveTab] = useState<"photo" | "select">("photo");

  // 사진 탭
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<typeof MATERIAL_POOL["미니멀"]>([]);

  // 직접 선택 탭 — 단계 흐름
  const [stepIndex, setStepIndex] = useState(0); // 0~2: 질문, 3: 결과
  const [selections, setSelections] = useState<Partial<Record<StepKey, string>>>({});
  const [selectRecs, setSelectRecs] = useState<typeof MATERIAL_POOL["미니멀"]>([]);

  // ── 사진 분석 ──
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.8, base64: true });
    if (!result.canceled && result.assets[0]) {
      setReferenceImage(result.assets[0].uri);
      setAiDescription(""); setKeywords([]); setRecommendations([]);
      analyzeWithGemini(result.assets[0].base64 ?? "");
    }
  };

  const analyzeWithGemini = async (base64: string) => {
    setIsAnalyzing(true);
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      setTimeout(() => {
        setAiDescription("따뜻한 우드 소재와 내추럴한 색감이 잘 어우러진 북유럽 스타일이에요. 밝은 베이지 계열의 벽과 원목 바닥이 공간에 자연스러운 온기를 더해주고 있어요.");
        const kws = ["우드", "내추럴"];
        setKeywords(kws);
        setRecommendations(kws.flatMap((k) => MATERIAL_POOL[k] ?? []));
        setIsAnalyzing(false);
      }, 2000);
      return;
    }
    try {
      const descRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: "이 인테리어 사진을 분석해서 스타일과 분위기를 3~4문장으로 설명해줘. 마감재 추천은 하지 말고 스타일 특징만 한국어로 설명해줘." }] }] }),
      });
      const descData = await descRes.json();
      setAiDescription(descData.candidates?.[0]?.content?.parts?.[0]?.text ?? "");

      const kwRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: "이 인테리어 사진의 스타일 키워드를 다음 목록에서만 골라서 JSON 배열로만 답해줘. 다른 말 하지 마.\n키워드: 미니멀, 우드, 모던, 내추럴, 빈티지, 파스텔, 어스톤, 모노톤, 비비드\n예시: [\"미니멀\", \"우드\"]" }] }] }),
      });
      const kwData = await kwRes.json();
      const cleaned = (kwData.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]").replace(/```json|```/g, "").trim();
      const parsed: string[] = JSON.parse(cleaned);
      setKeywords(parsed);
      const recs = parsed.flatMap((k) => MATERIAL_POOL[k] ?? []);
      setRecommendations(recs.length > 0 ? recs : MATERIAL_POOL["내추럴"]);
    } catch {
      Alert.alert("안내", "AI 분석 중 오류가 발생했어요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── 직접 선택 ──
  const handleStepSelect = (option: string) => {
    const key = STEPS[stepIndex].key as StepKey;
    const next = { ...selections, [key]: option };
    setSelections(next);

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // 마지막 단계 → 추천 계산
      const kws = mapSelectionsToKeywords(next);
      let recs = kws.flatMap((k) => MATERIAL_POOL[k] ?? []);
      const seen = new Set<string>();
      recs = recs.filter((r) => { if (seen.has(r.tag)) return false; seen.add(r.tag); return true; });
      setSelectRecs(recs.length > 0 ? recs : MATERIAL_POOL["내추럴"]);
      setStepIndex(STEPS.length); // 결과 단계
    }
  };

  const resetSelect = () => { setStepIndex(0); setSelections({}); setSelectRecs([]); };

  const applyRecommendation = (rec: typeof MATERIAL_POOL["미니멀"][0]) => {
    Alert.alert("조합 적용", `'${rec.tag}' 조합을 적용할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "적용하기", onPress: () => router.push({ pathname: "/result", params: { detectedWalls: wallCount, selectedColors: JSON.stringify(rec.colors) } } as any) },
    ]);
  };

  const currentStep = STEPS[stepIndex];
  const isResultStep = stepIndex >= STEPS.length;

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (activeTab === "select" && stepIndex > 0 && !isResultStep) {
            setStepIndex(stepIndex - 1);
          } else if (activeTab === "select" && isResultStep) {
            setStepIndex(STEPS.length - 1);
          } else {
            router.back();
          }
        }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 추천 마감재</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* 탭 */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === "photo" && styles.tabActive]} onPress={() => setActiveTab("photo")}>
          <Text style={[styles.tabText, activeTab === "photo" && styles.tabTextActive]}>📷 사진으로 분석</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "select" && styles.tabActive]} onPress={() => { setActiveTab("select"); }}>
          <Text style={[styles.tabText, activeTab === "select" && styles.tabTextActive]}>🎛 직접 선택</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 사진 탭 ─── */}
      {activeTab === "photo" && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.guideText}>원하는 마감재 스타일 사진을 올려주세요.</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            {referenceImage
              ? <Image source={{ uri: referenceImage }} style={styles.referenceImage} />
              : <View style={styles.uploadPlaceholder}><Text style={styles.uploadIcon}>+</Text><Text style={styles.uploadText}>사진 선택하기</Text></View>}
          </TouchableOpacity>

          {isAnalyzing && (
            <View style={styles.analyzingBox}>
              <ActivityIndicator size="small" color="#222" />
              <Text style={styles.analyzingText}>AI가 스타일을 분석 중이에요...</Text>
            </View>
          )}

          {aiDescription !== "" && (
            <View style={styles.descriptionBox}>
              <View style={styles.descriptionHeader}>
                <View style={styles.aiIconBox}><Text style={styles.aiIconText}>✨</Text></View>
                <View><Text style={styles.descriptionTitle}>AI 분석 결과</Text><Text style={styles.descriptionSubtitle}>스타일 사진을 분석했어요</Text></View>
              </View>
              {keywords.length > 0 && (
                <View style={styles.keywordSection}>
                  <Text style={styles.keywordSectionLabel}>감지된 스타일</Text>
                  <View style={styles.keywordRow}>
                    {keywords.map((k, i) => <View key={i} style={styles.keywordBadge}><Text style={styles.keywordText}># {k}</Text></View>)}
                  </View>
                </View>
              )}
              <View style={styles.descDivider} />
              <Text style={styles.descriptionText}>{aiDescription}</Text>
            </View>
          )}

          {recommendations.length > 0 && (
            <View>
              <Text style={styles.recSectionTitle}>추천 마감재 조합</Text>
              {recommendations.map((rec, i) => (
                <TouchableOpacity key={i} style={styles.recCard} onPress={() => applyRecommendation(rec)}>
                  <View style={styles.recInfo}>
                    <Text style={styles.recTag}>{rec.tag}</Text>
                    <Text style={styles.recDesc}>{rec.desc}</Text>
                    <View style={styles.recPreview}>
                      {rec.preview.map((c, j) => <View key={j} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" || c === "#fafafa" ? "#ddd" : c }]} />)}
                    </View>
                  </View>
                  <Text style={styles.recApply}>적용 →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── 직접 선택 탭 ─── */}
      {activeTab === "select" && (
        <View style={styles.selectRoot}>
          {/* 진행 바 */}
          {!isResultStep && (
            <View style={styles.progressBar}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
              ))}
            </View>
          )}

          {/* 질문 단계 */}
          {!isResultStep && (
            <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.stepQuestion}>{currentStep.question}</Text>
              <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

              <View style={styles.optionGrid}>
                {currentStep.options.map((opt) => {
                  const isSelected = selections[currentStep.key as StepKey] === opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => handleStepSelect(opt.label)}
                      activeOpacity={0.85}
                    >
                      {/* 색상톤: 스와치 그리드 */}
                      {currentStep.type === "swatch" && "swatches" in opt && (
                        <View style={styles.swatchGrid}>
                          {(opt as { label: string; swatches: readonly string[] }).swatches.map((color, ci) => (
                            <View
                              key={ci}
                              style={[styles.swatchCell, { backgroundColor: color, borderColor: color === "#ffffff" ? "#ddd" : color }]}
                            />
                          ))}
                        </View>
                      )}
                      {/* 질감/분위기: 이미지 */}
                      {currentStep.type === "image" && "imageUri" in opt && (
                        <Image
                          source={{ uri: (opt as { label: string; imageUri: string }).imageUri }}
                          style={styles.optionImage}
                          resizeMode="cover"
                        />
                      )}
                      {isSelected && (
                        <View style={styles.optionCheck}>
                          <Text style={styles.optionCheckText}>✓</Text>
                        </View>
                      )}
                      {isSelected && <View style={styles.optionSelectedOverlay} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* 결과 단계 */}
          {isResultStep && (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* 선택 요약 */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>선택하신 취향</Text>
                <View style={styles.summaryRow}>
                  {Object.entries(selections).map(([k, v]) => (
                    <View key={k} style={styles.summaryChip}>
                      <Text style={styles.summaryChipKey}>{k}</Text>
                      <Text style={styles.summaryChipValue}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.recSectionTitle}>추천 마감재 조합</Text>
              {selectRecs.map((rec, i) => (
                <TouchableOpacity key={i} style={styles.recCard} onPress={() => applyRecommendation(rec)}>
                  <View style={styles.recInfo}>
                    <Text style={styles.recTag}>{rec.tag}</Text>
                    <Text style={styles.recDesc}>{rec.desc}</Text>
                    <View style={styles.recPreview}>
                      {rec.preview.map((c, j) => <View key={j} style={[styles.recDot, { backgroundColor: c, borderColor: c === "#ffffff" || c === "#fafafa" ? "#ddd" : c }]} />)}
                    </View>
                  </View>
                  <Text style={styles.recApply}>적용 →</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={resetSelect}>
                <Text style={styles.resetButtonText}>다시 선택하기</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

// ─── 스타일 ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f5f7" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: "#f3f5f7", borderBottomWidth: 1, borderBottomColor: "#e5e5e5",
  },
  backButton: { width: 36, height: 36, justifyContent: "center" },
  backArrow: { fontSize: 26, fontWeight: "bold" },
  headerTitle: { fontSize: 17, fontWeight: "bold" },

  tabRow: { flexDirection: "row", backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  tab: { flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#4F6653" },
  tabText: { fontSize: 14, color: "#aaa", fontWeight: "bold" },
  tabTextActive: { color: "#4F6653" },

  content: { padding: 20, paddingBottom: 48 },
  guideText: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 14 },

  uploadButton: { width: "100%", height: 200, borderRadius: 16, overflow: "hidden", marginBottom: 20, backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5e5", borderStyle: "dashed" },
  uploadPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  uploadIcon: { fontSize: 36, color: "#bbb", marginBottom: 8 },
  uploadText: { fontSize: 14, color: "#999", fontWeight: "bold" },
  referenceImage: { width: "100%", height: "100%", resizeMode: "cover" },

  analyzingBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, backgroundColor: "white", borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#e5e5e5" },
  analyzingText: { fontSize: 14, color: "#555" },

  descriptionBox: { backgroundColor: "white", borderRadius: 14, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: "#e5e5e5" },
  descriptionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  aiIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#222", justifyContent: "center", alignItems: "center" },
  aiIconText: { fontSize: 22 },
  descriptionTitle: { fontSize: 15, fontWeight: "bold", color: "#222" },
  descriptionSubtitle: { fontSize: 12, color: "#999", marginTop: 2 },
  keywordSection: { marginBottom: 14 },
  keywordSectionLabel: { fontSize: 12, color: "#999", fontWeight: "bold", marginBottom: 8 },
  keywordRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  keywordBadge: { backgroundColor: "#222", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  keywordText: { color: "white", fontSize: 13, fontWeight: "bold" },
  descDivider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 14 },
  descriptionText: { fontSize: 14, color: "#444", lineHeight: 22 },

  // 직접 선택
  selectRoot: { flex: 1 },
  progressBar: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, paddingVertical: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ddd" },
  progressDotActive: { backgroundColor: "#4F6653", width: 24, borderRadius: 4 },

  stepContent: { padding: 24, paddingBottom: 48 },
  stepQuestion: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 8, lineHeight: 30 },
  stepSubtitle: { fontSize: 14, color: "#999", marginBottom: 28 },

  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  optionCard: {
    width: (SCREEN_W - 48 - 12) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  optionCardSelected: { borderColor: "#4F6653" },

  // 색상톤용 스와치
  swatchGrid: { flexDirection: "row", flexWrap: "wrap", width: "100%", height: 120 },
  swatchCell: { width: "50%", height: "50%", borderWidth: 0 },

  // 질감/분위기용 이미지
  optionImage: { width: "100%", height: 120 },

  // 선택 오버레이 (이미지 위 반투명 녹색 틴트)
  optionSelectedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(79, 102, 83, 0.15)",
  },

  optionLabel: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 2 },
  optionLabelSelected: { color: "#4F6653" },
  optionDesc: { fontSize: 11, color: "#999" },
  optionCheck: {
    position: "absolute", top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#4F6653",
    justifyContent: "center", alignItems: "center",
    zIndex: 10,
  },
  optionCheckText: { color: "white", fontSize: 13, fontWeight: "bold" },

  // 결과
  summaryBox: { backgroundColor: "white", borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#e5e5e5" },
  summaryTitle: { fontSize: 13, color: "#999", fontWeight: "bold", marginBottom: 12 },
  summaryRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  summaryChip: { backgroundColor: "#f3f5f7", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  summaryChipKey: { fontSize: 10, color: "#999", marginBottom: 2 },
  summaryChipValue: { fontSize: 13, fontWeight: "bold", color: "#222" },

  recSectionTitle: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 12 },
  recCard: { backgroundColor: "white", borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e5e5" },
  recInfo: { flex: 1 },
  recTag: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 4 },
  recDesc: { fontSize: 12, color: "#777", marginBottom: 10 },
  recPreview: { flexDirection: "row", gap: 6 },
  recDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  recApply: { fontSize: 13, fontWeight: "bold", color: "#555", marginLeft: 8 },

  resetButton: { marginTop: 8, padding: 14, alignItems: "center" },
  resetButtonText: { fontSize: 14, color: "#999", fontWeight: "bold" },
});
