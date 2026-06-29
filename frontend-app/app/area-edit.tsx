import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

export default function AreaEdit() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{
    imageUri: string;
    detectedWalls?: string;
  }>();

  const wallCount = detectedWalls ?? "3";

  const handleTempEdit = () => {
    Alert.alert(
      "안내",
      "영역 직접 수정 기능은 추후 AI 영역 좌표와 연결될 예정입니다."
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>영역 직접 수정</Text>
        <Text style={styles.subtitle}>
          분석된 영역이 어색하다면 직접 수정할 수 있어요.
        </Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>이미지를 불러올 수 없습니다.</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>수정 가능한 영역</Text>
          <Text style={styles.infoText}>✓ 벽지</Text>
          <Text style={styles.infoText}>✓ 바닥</Text>
          <Text style={styles.infoText}>✓ 천장</Text>
          <Text style={styles.infoText}>✓ 몰딩</Text>
        </View>

        <View style={styles.toolBox}>
          <TouchableOpacity style={styles.toolButton} onPress={handleTempEdit}>
            <Text style={styles.toolButtonText}>벽지 영역 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton} onPress={handleTempEdit}>
            <Text style={styles.toolButtonText}>바닥 영역 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton} onPress={handleTempEdit}>
            <Text style={styles.toolButtonText}>몰딩 영역 수정</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/material-select",
              params: { detectedWalls: wallCount },
            } as any)
          }
        >
          <Text style={styles.buttonText}>수정 완료</Text>
        </TouchableOpacity>
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 22,
    lineHeight: 21,
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  emptyBox: {
    width: "100%",
    height: 250,
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
  infoBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    color: "#555",
    marginBottom: 6,
  },
  toolBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 18,
  },
  toolButton: {
    backgroundColor: "#f3f5f7",
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
  },
  toolButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});