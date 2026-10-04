import { router } from "expo-router";
import { useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Switch,
} from "react-native";

export default function Main() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const slideAnim = useRef(new Animated.Value(260)).current;

  const toggleMenu = () => {
    const nextOpen = !menuOpen;
    setMenuOpen(nextOpen);
    Animated.timing(slideAnim, {
      toValue: nextOpen ? 0 : 260,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const openSettings = () => {
    toggleMenu();
    setTimeout(() => setSettingsVisible(true), 280);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("userEmail");
    await SecureStore.deleteItemAsync("userToken");
    router.replace("/login" as any);
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuIcon}>{menuOpen ? "×" : "☰"}</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>Matelier</Text>
        <Text style={styles.subtitle}>마감재 하나로 달라지는 공간</Text>

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
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        <Text style={styles.drawerTitle}>MENU</Text>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => { toggleMenu(); router.push("/saved-designs" as any); }}
        >
          <Text style={styles.drawerText}>저장된 시안 목록</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => { toggleMenu(); router.push("/mypage" as any); }}
        >
          <Text style={styles.drawerText}>마이페이지</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={openSettings}
        >
          <Text style={styles.drawerText}>환경설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 환경설정 모달 */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>환경설정</Text>

            {/* 알림 */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>알림</Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: "#ddd", true: "#222" }}
                thumbColor="white"
              />
            </View>

            <View style={styles.modalDivider} />

            {/* 로그아웃 */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => { setSettingsVisible(false); handleLogout(); }}
            >
              <Text style={styles.settingLabel}>로그아웃</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            {/* 회원 탈퇴 */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={[styles.settingLabel, { color: "#e55" }]}>회원 탈퇴</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f5f7" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
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
  menuIcon: { fontSize: 26, fontWeight: "bold" },
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
  primaryButton: { backgroundColor: "#222", padding: 18, borderRadius: 14 },
  primaryButtonText: { color: "white", fontSize: 17, fontWeight: "bold", textAlign: "center" },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
    zIndex: 5,
  },
  drawer: {
    position: "absolute",
    top: 0, right: 0, bottom: 0,
    width: 260,
    backgroundColor: "white",
    paddingTop: 95,
    paddingHorizontal: 22,
    paddingBottom: 54,
    zIndex: 10,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  drawerTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  drawerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  drawerText: { fontSize: 16, fontWeight: "600" },
  logoutItem: { marginTop: "auto", paddingVertical: 18 },
  logoutText: { fontSize: 13, color: "#777" },
  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20, color: "#222" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  settingLabel: { fontSize: 16, color: "#222" },
  settingArrow: { fontSize: 22, color: "#bbb" },
  modalDivider: { height: 1, backgroundColor: "#f0f0f0" },
  modalClose: {
    marginTop: 20,
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  modalCloseText: { fontSize: 15, fontWeight: "bold", color: "#555" },
});
