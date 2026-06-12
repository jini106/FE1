import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function Analyzing() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push({
        pathname: "/analysis-result",
        params: { imageUri },
      } as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, [imageUri]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#222" />

      <Text style={styles.title}>공간을 분석 중입니다</Text>
      <Text style={styles.subtitle}>
        벽, 바닥, 천장, 몰딩 영역을 분석하고 있어요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f3f5f7",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 10,
  },
  subtitle: {
    color: "#777",
    textAlign: "center",
  },
});