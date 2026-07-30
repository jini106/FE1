import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";

type Design = {
  id: string;
  name: string;
  date: string;
  thumbnail: string;
  colors: {
    label: string;
    value: string;
  }[];
};

// 더미 데이터 — 서버 연동 시 API 호출로 교체
const DUMMY_DESIGNS: Design[] = [
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

export default function SavedDesigns() {
  const [designs, setDesigns] = useState<Design[]>(DUMMY_DESIGNS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const handleDelete = (id: string) => {
    Alert.alert("삭제 확인", "이 시안을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setDesigns((prev) => prev.filter((d) => d.id !== id));
          setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        },
      },
    ]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((sid) => sid !== id);
      if (prev.length >= 3) {
        Alert.alert("안내", "최대 3개까지 비교할 수 있습니다.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      Alert.alert("안내", "비교할 시안을 2개 이상 선택해 주세요.");
      return;
    }
    router.push({
      pathname: "/compare-designs",
      params: { ids: selectedIds.join(",") },
    } as any);
  };

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>저장된 시안</Text>
        <TouchableOpacity
          onPress={() => {
            setCompareMode((prev) => !prev);
            setSelectedIds([]);
          }}
        >
          <Text style={styles.compareToggle}>
            {compareMode ? "취소" : "비교"}
          </Text>
        </TouchableOpacity>
      </View>

      {designs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>저장된 시안이 없습니다.</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-design" as any)}
          >
            <Text style={styles.createButtonText}>시안 생성하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {compareMode && (
              <Text style={styles.compareGuide}>
                비교할 시안을 선택하세요. (최대 3개)
              </Text>
            )}

            {designs.map((design) => {
              const isSelected = selectedIds.includes(design.id);
              return (
                <TouchableOpacity
                  key={design.id}
                  style={[styles.card, compareMode && isSelected && styles.cardSelected]}
                  activeOpacity={compareMode ? 0.7 : 1}
                  onPress={() => compareMode && toggleSelect(design.id)}
                >
                  {/* 선택 체크 */}
                  {compareMode && (
                    <View style={[styles.selectCircle, isSelected && styles.selectCircleOn]}>
                      {isSelected && <Text style={styles.selectCheck}>✓</Text>}
                    </View>
                  )}

                  {/* 썸네일 */}
                  <Image
                    source={{ uri: design.thumbnail }}
                    style={styles.thumbnail}
                  />

                  {/* 정보 */}
                  <View style={styles.info}>
                    <View style={styles.infoTop}>
                      <Text style={styles.name}>{design.name}</Text>
                      <Text style={styles.date}>{design.date}</Text>
                    </View>

                    {/* 색상 요약 */}
                    <View style={styles.colorRow}>
                      {design.colors.map((c) => (
                        <View key={c.label} style={styles.colorItem}>
                          <View style={[styles.colorDot, { backgroundColor: c.value }]} />
                          <Text style={styles.colorLabel}>{c.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 삭제 버튼 */}
                  {!compareMode && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(design.id)}
                    >
                      <Text style={styles.deleteText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 비교 모드 하단 버튼 */}
          {compareMode && (
            <View style={styles.compareBar}>
              <Text style={styles.compareCount}>
                {selectedIds.length}개 선택됨
              </Text>
              <TouchableOpacity
                style={[styles.compareButton, selectedIds.length < 2 && styles.compareButtonDisabled]}
                onPress={handleCompare}
              >
                <Text style={styles.compareButtonText}>비교하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  compareToggle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    width: 36,
    textAlign: "right",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  compareGuide: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: "#222",
    borderWidth: 2,
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#bbb",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  selectCircleOn: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  selectCheck: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  infoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorLabel: {
    fontSize: 11,
    color: "#777",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 12,
    color: "#e55",
    fontWeight: "bold",
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#222",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  compareBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  compareCount: {
    fontSize: 15,
    color: "#555",
    fontWeight: "bold",
  },
  compareButton: {
    backgroundColor: "#222",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  compareButtonDisabled: {
    backgroundColor: "#bbb",
  },
  compareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});
