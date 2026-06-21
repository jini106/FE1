import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function AnalysisResult() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  // 나중에는 AI 분석 결과에서 받아올 값
  const detectedWalls = 3;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>분석 결과</Text>
      <Text style={styles.subtitle}>
        AI가 인식한 공간 영역을 확인해 주세요.
      </Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>이미지를 불러올 수 없습니다.</Text>
        </View>
      )}

      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>공간 분석 결과</Text>

        <Text style={styles.resultText}>✓ 벽지 1</Text>
        <Text style={styles.resultText}>✓ 벽지 2</Text>

        {detectedWalls >= 3 && (
          <Text style={styles.resultText}>✓ 벽지 3</Text>
        )}

        <Text style={styles.resultText}>✓ 바닥</Text>
        <Text style={styles.resultText}>✓ 천장</Text>
        <Text style={styles.resultText}>✓ 몰딩 1</Text>
        <Text style={styles.resultText}>✓ 몰딩 2</Text>

        <Text style={styles.resultSummary}>
          벽지 {detectedWalls}개 · 바닥 1개 · 천장 1개 · 몰딩 2개 인식 완료
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/material-select",
            params: {
              detectedWalls: String(detectedWalls),
            },
          } as any)
        }
      >
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f3f5f7",
  },
  backButton: {
    marginTop: 38,
    width: 42,
    height: 42,
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 24,
  },
  previewImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#ddd",
    marginBottom: 18,
  },
  emptyBox: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  emptyText: {
    color: "#777",
  },
  resultBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 18,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    color: "#555",
    marginBottom: 6,
  },
  resultSummary: {
    marginTop: 12,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});