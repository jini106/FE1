import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      // 저장된 자동 로그인 정보 확인
      const savedEmail = await SecureStore.getItemAsync("userEmail");
      const savedToken = await SecureStore.getItemAsync("userToken");

      if (savedEmail && savedToken) {
        // 저장된 정보 있으면 메인으로 바로 이동
        router.replace("/main" as any);
      } else {
        // 없으면 로그인 화면으로 이동
        router.replace("/login" as any);
      }
    } catch {
      // 오류 발생 시 로그인 화면으로 이동
      router.replace("/login" as any);
    } finally {
      setChecking(false);
    }
  };

  // 확인하는 동안 로딩 스피너 표시
  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f5f7" }}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  return null;
}
