import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";

export default function Main() {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(260)).current;

  const showReadyMessage = (title: string) => {
    Alert.alert("안내", `${title} 기능은 추후 구현 예정입니다.`);
  };

  const toggleMenu = () => {
    const nextOpen = !menuOpen;
    setMenuOpen(nextOpen);

    Animated.timing(slideAnim, {
      toValue: nextOpen ? 0 : 260,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuIcon}>{menuOpen ? "×" : "☰"}</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>Matelier</Text>

        <Text style={styles.subtitle}>
          마감재 하나로 달라지는 공간
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/create-design" as any)}
        >
          <Text style={styles.primaryButtonText}>시안 생성하기</Text>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.drawerTitle}>MENU</Text>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => showReadyMessage("저장된 시안 목록")}
        >
          <Text style={styles.drawerText}>저장된 시안 목록</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => showReadyMessage("마이페이지")}
        >
          <Text style={styles.drawerText}>마이페이지</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => showReadyMessage("환경설정")}
        >
          <Text style={styles.drawerText}>환경설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={() => router.push("/login" as any)}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  menuButton: {
    position: "absolute",
    top: 55,
    right: 24,
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  menuIcon: {
    fontSize: 26,
    fontWeight: "bold",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: -45,
    marginBottom: 12,
},
subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 54,
    lineHeight: 24,
    fontSize: 16,
},
  primaryButton: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
    zIndex: 5,
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 260,
    backgroundColor: "white",
    paddingTop: 95,
    paddingHorizontal: 22,
    zIndex: 10,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  drawerItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutItem: {
    marginTop: "auto",
    paddingVertical: 24,
  },
  logoutText: {
    fontSize: 13,
    color: "#777",
  },
});