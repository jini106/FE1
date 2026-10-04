import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const SCREEN_W = Dimensions.get("window").width;

export default function DesignOption() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{
    imageUri: string;
    detectedWalls?: string;
  }>();

  const wallCount = detectedWalls ?? "3";

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ width: 80 }} />
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>어떻게 구성할까요?</Text>
        <Text style={styles.subtitle}>원하는 방식을 선택해 주세요.</Text>

        {/* 직접 마감재 조합 */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push({
            pathname: "/material-select",
            params: { detectedWalls: wallCount },
          } as any)}
        >
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>🎨</Text>
          </View>
          <View style={styles.optionTextBox}>
            <Text style={styles.optionTitle}>직접 마감재 조합</Text>
            <Text style={styles.optionDesc}>
              색상표에서 벽지·바닥·몰딩을{"\n"}직접 골라 조합해요.
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>자유롭게</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>빠르게</Text></View>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* AI 추천 마감재 조합 */}
        <TouchableOpacity
          style={[styles.optionCard, styles.optionCardAI]}
          onPress={() => router.push({
            pathname: "/ai-recommend",
            params: { imageUri, detectedWalls: wallCount },
          } as any)}
        >
          <View style={[styles.iconBox, styles.iconBoxAI]}>
            <Text style={styles.iconText}>✨</Text>
          </View>
          <View style={styles.optionTextBox}>
            <View style={styles.aiBadgeRow}>
              <Text style={styles.optionTitle}>AI 추천 마감재 조합</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.optionDesc}>
              레퍼런스 사진을 올리면 AI가{"\n"}스타일을 분석해 추천해요.
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>스타일 분석</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>맞춤 추천</Text></View>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionCardAI: {
    borderColor: "#222",
    borderWidth: 1.5,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f3f5f7",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxAI: {
    backgroundColor: "#222",
  },
  iconText: { fontSize: 26 },
  optionTextBox: { flex: 1 },
  aiBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  optionTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  aiBadge: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aiBadgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  optionDesc: {
    fontSize: 13,
    color: "#777",
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 4,
  },
  tagRow: { flexDirection: "row", gap: 6 },
  tag: {
    backgroundColor: "#f3f5f7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  tagText: { fontSize: 11, color: "#555", fontWeight: "bold" },
  arrow: { fontSize: 24, color: "#bbb" },
});
