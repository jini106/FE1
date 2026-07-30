import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";

const SCREEN_W = Dimensions.get("window").width;

// 더미 데이터 — saved-designs.tsx와 동일하게 유지
const DUMMY_DESIGNS = [
  {
    id: "1",
    name: "거실 시안 1",
    date: "2026.07.10",
    thumbnail: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400",
    colors: [
      { label: "전체 벽", value: "#eee3ce" },
      { label: "바닥", value: "#b98b5b" },
      { label: "몰딩", value: "#f7f4ee" },
    ],
  },
  {
    id: "2",
    name: "침실 시안 1",
    date: "2026.07.12",
    thumbnail: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400",
    colors: [
      { label: "전체 벽", value: "#d6cfc7" },
      { label: "바닥", value: "#7a5637" },
      { label: "몰딩", value: "#ffffff" },
    ],
  },
  {
    id: "3",
    name: "주방 시안 1",
    date: "2026.07.15",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    colors: [
      { label: "전체 벽", value: "#ffffff" },
      { label: "바닥", value: "#c8b89a" },
      { label: "몰딩", value: "#f4efe4" },
    ],
  },
  {
    id: "4",
    name: "거실 시안 2",
    date: "2026.07.18",
    thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    colors: [
      { label: "전체 벽", value: "#e8e0d5" },
      { label: "바닥", value: "#8b6f47" },
      { label: "몰딩", value: "#faf8f5" },
    ],
  },
];

export default function CompareDesigns() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const selectedIds = ids?.split(",") ?? [];
  const designs = DUMMY_DESIGNS.filter((d) => selectedIds.includes(d.id));

  // 시안 개수에 따라 카드 너비 계산
  const cardW = (SCREEN_W - 24 * 2 - 12 * (designs.length - 1)) / designs.length;

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시안 비교</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 썸네일 나란히 */}
        <View style={styles.thumbnailRow}>
          {designs.map((design) => (
            <View key={design.id} style={[styles.thumbnailCard, { width: cardW }]}>
              <Image
                source={{ uri: design.thumbnail }}
                style={[styles.thumbnail, { width: cardW, height: cardW * 1.1 }]}
              />
              <Text style={styles.designName} numberOfLines={1}>
                {design.name}
              </Text>
              <Text style={styles.designDate}>{design.date}</Text>
            </View>
          ))}
        </View>

        {/* 색상 비교 테이블 */}
        <View style={styles.table}>
          <Text style={styles.tableTitle}>마감재 비교</Text>

          {["전체 벽", "바닥", "몰딩"].map((label) => (
            <View key={label} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <View style={styles.tableColors}>
                {designs.map((design) => {
                  const color = design.colors.find((c) => c.label === label);
                  return (
                    <View key={design.id} style={[styles.tableCell, { width: cardW }]}>
                      <View
                        style={[
                          styles.tableColorBox,
                          { backgroundColor: color?.value ?? "#eee" },
                        ]}
                      />
                      <Text style={styles.tableColorValue}>
                        {color?.value ?? "-"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f5f7",
  },
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
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 26,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  thumbnailRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  thumbnailCard: {
    alignItems: "center",
  },
  thumbnail: {
    borderRadius: 12,
    backgroundColor: "#ddd",
    marginBottom: 8,
    resizeMode: "cover",
  },
  designName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  designDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    textAlign: "center",
  },
  table: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  tableRow: {
    marginBottom: 16,
  },
  tableLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
    fontWeight: "bold",
  },
  tableColors: {
    flexDirection: "row",
    gap: 12,
  },
  tableCell: {
    alignItems: "center",
    gap: 6,
  },
  tableColorBox: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableColorValue: {
    fontSize: 11,
    color: "#999",
  },
});
