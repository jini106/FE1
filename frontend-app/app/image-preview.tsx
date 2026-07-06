import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ImagePreview() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [currentImage, setCurrentImage] = useState(imageUri ?? "");

  const editImage = () => {
    router.push({
      pathname: "/image-editor",
      params: { imageUri: currentImage },
    } as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>이미지 확인</Text>
      <Text style={styles.subtitle}>선택한 공간 사진을 확인해 주세요.</Text>

      {currentImage ? (
        <Image source={{ uri: currentImage }} style={styles.previewImage} />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>선택된 이미지가 없습니다.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={editImage}>
        <Text style={styles.editButtonText}>사진 편집</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/analyzing",
            params: { imageUri: currentImage },
          } as any)
        }
      >
        <Text style={styles.buttonText}>공간 분석 시작</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryText}>다시 선택하기</Text>
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
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 28,
  },
  previewImage: {
    width: "100%",
    height: 360,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#ddd",
    marginBottom: 12,
  },
  emptyBox: {
    width: "100%",
    height: 360,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  emptyText: {
    color: "#777",
  },
  editButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  editButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#444",
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
  secondaryButton: {
    marginTop: 12,
    padding: 14,
  },
  secondaryText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#555",
  },
});