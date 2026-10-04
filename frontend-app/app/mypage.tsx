import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";

// 더미 데이터 — 서버 연동 시 API 호출로 교체
const USER_PROFILE = {
  name: "김지니",
  email: "jini@example.com",
};

const USER_TASTE = {
  tone: "웜톤",
  style: "내추럴",
  savedCount: 4,
  frequentColors: [
    { color: "#eee3ce", name: "오프화이트" },
    { color: "#b98b5b", name: "우드 브라운" },
    { color: "#f7f4ee", name: "퓨어 화이트" },
    { color: "#d6cfc7", name: "그레이지" },
    { color: "#c8b89a", name: "샌드 베이지" },
  ],
};

export default function MyPage() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const handleWithdraw = () => {
    Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제됩니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: () => router.replace("/login" as any),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER_PROFILE.name[0]}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{USER_PROFILE.name}</Text>
            <Text style={styles.profileEmail}>{USER_PROFILE.email}</Text>
          </View>
        </View>

        {/* 취향 분석 결과 */}
        <Text style={styles.sectionTitle}>취향 분석 결과</Text>
        <View style={styles.card}>
          {/* 저장 시안 수 */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>저장한 시안</Text>
            <Text style={styles.statValue}>{USER_TASTE.savedCount}개</Text>
          </View>

          <View style={styles.divider} />

          {/* 선호 톤/스타일 */}
          <View style={styles.badgeSection}>
            <Text style={styles.cardLabel}>선호 톤 · 스타일</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{USER_TASTE.tone}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{USER_TASTE.style}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 자주 쓴 색상 */}
          <View style={styles.colorSection}>
            <Text style={styles.cardLabel}>자주 선택한 색상 TOP 5</Text>
            <View style={styles.colorRow}>
              {USER_TASTE.frequentColors.map((c, i) => (
                <View key={i} style={styles.colorItem}>
                  <View style={[
                    styles.colorDot,
                    { backgroundColor: c.color, borderColor: c.color === "#f7f4ee" || c.color === "#eee3ce" ? "#ddd" : c.color }
                  ]} />
                  <Text style={styles.colorName} numberOfLines={1}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>


      </ScrollView>

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

            {/* 알림 설정 */}
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
              onPress={() => {
                setSettingsVisible(false);
                router.replace("/login" as any);
              }}
            >
              <Text style={styles.settingLabel}>로그아웃</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            {/* 회원 탈퇴 */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                setSettingsVisible(false);
                handleWithdraw();
              }}
            >
              <Text style={[styles.settingLabel, { color: "#e55" }]}>회원 탈퇴</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            {/* 닫기 */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: "#f3f5f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: { width: 36, height: 36, justifyContent: "center" },
  backArrow: { fontSize: 26, fontWeight: "bold" },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  settingsIcon: { fontSize: 22, color: "#222" },
  content: { padding: 20, paddingBottom: 48 },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontSize: 22, fontWeight: "bold" },
  profileName: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 4 },
  profileEmail: { fontSize: 13, color: "#999" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14, color: "#222" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 14,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  statLabel: { fontSize: 14, color: "#555" },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#222" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 14 },
  badgeSection: {},
  cardLabel: { fontSize: 13, color: "#222", marginBottom: 10, fontWeight: "bold" },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#222",
  },
  badgeText: { color: "#222", fontSize: 13, fontWeight: "bold" },
  colorSection: {},
  colorRow: { flexDirection: "row", gap: 10 },
  colorItem: { alignItems: "center", gap: 6, flex: 1 },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  colorName: { fontSize: 10, color: "#222", textAlign: "center" },
  linkButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  linkButtonText: { fontSize: 14, fontWeight: "bold", color: "#222" },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
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
