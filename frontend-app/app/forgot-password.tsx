import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("안내", "이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      // Firebase가 제공하는 비밀번호 재설정 함수 호출
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "전송 완료",
        "비밀번호 재설정 링크를 이메일로 보냈어요.\n메일함을 확인해 주세요.",
        [{ text: "확인", onPress: () => router.push("/login" as any) }]
      );
    } catch (error: any) {
      // Firebase 에러 코드별 안내
      if (error.code === "auth/user-not-found") {
        Alert.alert("안내", "등록되지 않은 이메일이에요.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("안내", "올바른 이메일 형식이 아니에요.");
      } else {
        Alert.alert("오류", "잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>비밀번호 찾기</Text>
        <Text style={styles.subtitle}>
          가입한 이메일을 입력하면{"\n"}비밀번호 재설정 링크를 보내드려요.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>재설정 메일 보내기</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.link}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f3f5f7",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    marginTop: 18,
    fontWeight: "bold",
    color: "#555",
  },
});
