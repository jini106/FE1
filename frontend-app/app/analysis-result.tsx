import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function AnalysisResult() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{
    imageUri: string;
    detectedWalls?: string;
  }>();

  const wallCount = detectedWalls ?? "3";

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
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
          <Text style={styles.resultText}>✓ 벽지</Text>
          <Text style={styles.resultText}>✓ 바닥</Text>
          <Text style={styles.resultText}>✓ 천장</Text>
          <Text style={styles.resultText}>✓ 몰딩</Text>
          <Text style={styles.resultSummary}>총 4개 영역 인식 완료</Text>
        </View>

        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>공간이 잘 분석되었나요?</Text>
          <Text style={styles.confirmDesc}>
            영역이 어색하게 나뉘었다면 직접 수정할 수 있어요.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/design-option",
                params: { imageUri, detectedWalls: wallCount },
              } as any)
            }
          >
            <Text style={styles.buttonText}>네, 좋아요</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/area-edit",
                params: { imageUri, detectedWalls: wallCount },
              } as any)
            }
          >
            <Text style={styles.editButtonText}>직접 수정할게요</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    height: 260,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  emptyBox: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 14,
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
  confirmBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 30,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },
  confirmDesc: {
    color: "#777",
    fontSize: 13,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editButtonText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
});