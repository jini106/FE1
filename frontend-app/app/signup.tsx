import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const handleSignup = () => {
    if (!email || !password || !passwordCheck) {
      Alert.alert("안내", "모든 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordCheck) {
      Alert.alert("안내", "비밀번호가 일치하지 않습니다.");
      return;
    }

    Alert.alert("회원가입 성공", "메인 화면으로 이동합니다.");
    router.push("/main" as any);
  };

  const handleGoogleSignup = () => {
    // TODO: 구글 OAuth 연동 (현재는 더미)
    Alert.alert("안내", "구글 간편 회원가입은 준비 중입니다.");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>간단한 정보로 서비스를 시작해보세요.</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={passwordCheck}
          onChangeText={setPasswordCheck}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>

        <View style={styles.dividerBox}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>SNS 간편 회원가입</Text>
          <View style={styles.line} />
        </View>

        {/* 구글 간편 회원가입 */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup}>
          <Image
            source={require("../assets/images/google.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.link}>이미 계정이 있나요? 로그인</Text>
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
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  dividerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#777",
    fontSize: 13,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginBottom: 4,
  },
  googleIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  link: {
    textAlign: "center",
    marginTop: 24,
    fontWeight: "bold",
  },
});
