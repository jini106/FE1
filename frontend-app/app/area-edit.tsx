import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  PanResponder,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const SCREEN_W = Dimensions.get("window").width;
const CANVAS_H = 280;

type Tool = "brush" | "eraser";

type Dot = {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
};

const AREA_COLORS: Record<string, string> = {
  wall: "rgba(100, 160, 255, 0.55)",
  floor: "rgba(180, 140, 80, 0.55)",
  molding: "rgba(120, 200, 120, 0.55)",
};

const AREA_LABELS: Record<string, string> = {
  wall: "벽지",
  floor: "바닥",
  molding: "몰딩",
};

export default function AreaEdit() {
  const { imageUri, detectedWalls } = useLocalSearchParams<{
    imageUri: string;
    detectedWalls?: string;
  }>();

  const wallCount = detectedWalls ?? "3";

  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState(18);
  const [selectedArea, setSelectedArea] = useState("wall");
  const [dots, setDots] = useState<Dot[]>([]);
  const [history, setHistory] = useState<Dot[][]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const toolRef = useRef<Tool>("brush");
  const selectedAreaRef = useRef("wall");
  const brushSizeRef = useRef(18);
  const dotsRef = useRef<Dot[]>([]);
  const canvasPageY = useRef(0);
  const sliderW = useRef(SCREEN_W - 40);
  const sliderPageX = useRef(0);
  const isDrawing = useRef(false);

  dotsRef.current = dots;

  // 점 추가 또는 지우기
  const applyAt = (x: number, y: number) => {
    if (toolRef.current === "brush") {
      const newDot: Dot = {
        id: `${Date.now()}-${Math.random()}`,
        x, y,
        color: AREA_COLORS[selectedAreaRef.current],
        size: brushSizeRef.current,
      };
      setDots((prev) => [...prev, newDot]);
    } else {
      const r = brushSizeRef.current / 2 + 4;
      setDots((prev) =>
        prev.filter((d) => Math.sqrt((d.x - x) ** 2 + (d.y - y) ** 2) > r)
      );
    }
  };

  // 슬라이더
  const sliderPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderPageX.current) / sliderW.current));
        const val = Math.round(8 + ratio * 42);
        setBrushSize(val); brushSizeRef.current = val;
        setCursor({ x: SCREEN_W / 2, y: CANVAS_H / 2 });
      },
      onPanResponderMove: (e) => {
        const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderPageX.current) / sliderW.current));
        const val = Math.round(8 + ratio * 42);
        setBrushSize(val); brushSizeRef.current = val;
        setCursor({ x: SCREEN_W / 2, y: CANVAS_H / 2 });
      },
      onPanResponderRelease: () => { setCursor(null); },
    })
  ).current;

  // 드로잉
  const drawPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.pageX;
        const y = e.nativeEvent.pageY - canvasPageY.current;
        if (y < 0 || y > CANVAS_H) return;
        isDrawing.current = true;
        setCursor({ x, y });
        // 히스토리 저장 (획 시작 시점)
        setHistory((h) => [...h, dotsRef.current]);
        applyAt(x, y);
      },
      onPanResponderMove: (e) => {
        if (!isDrawing.current) return;
        const x = e.nativeEvent.pageX;
        const y = e.nativeEvent.pageY - canvasPageY.current;
        if (y < 0 || y > CANVAS_H) return;
        setCursor({ x, y });
        applyAt(x, y);
      },
      onPanResponderRelease: () => {
        isDrawing.current = false;
        setCursor(null);
      },
    })
  ).current;

  const handleUndo = () => {
    if (history.length === 0) return;
    setDots(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const handleReset = () => {
    Alert.alert("초기화", "모든 수정 내용을 초기화하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "초기화", style: "destructive",
        onPress: () => { setHistory([]); setDots([]); },
      },
    ]);
  };

  const brushRatio = (brushSize - 8) / 42;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>영역 수정</Text>
        <TouchableOpacity onPress={handleUndo} disabled={history.length === 0}>
          <Text style={[styles.undoText, history.length === 0 && { color: "#ccc" }]}>↩ 되돌리기</Text>
        </TouchableOpacity>
      </View>

      <View
        style={styles.canvasWrap}
        {...drawPan.panHandlers}
        ref={(ref: any) => {
          if (ref) {
            ref.measure((_x: number, _y: number, _w: number, _h: number, _px: number, pageY: number) => {
              canvasPageY.current = pageY;
            });
          }
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.canvasImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyCanvas}>
            <Text style={styles.emptyCanvasText}>이미지를 불러올 수 없습니다.</Text>
          </View>
        )}

        <Svg style={StyleSheet.absoluteFillObject} width={SCREEN_W} height={CANVAS_H}>
          {dots.map((d) => (
            <Circle key={d.id} cx={d.x} cy={d.y} r={d.size / 2} fill={d.color} />
          ))}
          {cursor && (
            <Circle
              cx={cursor.x} cy={cursor.y} r={brushSize / 2}
              stroke={tool === "eraser" ? "#999" : AREA_COLORS[selectedArea].replace("0.55", "1")}
              strokeWidth={2}
              fill="none"
            />
          )}
        </Svg>
      </View>

      <View style={styles.toolArea}>
        <View style={styles.areaTabs}>
          {Object.keys(AREA_COLORS).map((area) => (
            <TouchableOpacity
              key={area}
              style={[styles.areaTab, selectedArea === area && {
                borderBottomColor: AREA_COLORS[area].replace("0.55", "1"),
                borderBottomWidth: 2.5,
              }]}
              onPress={() => { setSelectedArea(area); selectedAreaRef.current = area; }}
            >
              <View style={[styles.areaTabDot, { backgroundColor: AREA_COLORS[area].replace("0.55", "0.9") }]} />
              <Text style={[styles.areaTabText, selectedArea === area && styles.areaTabTextActive]}>
                {AREA_LABELS[area]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.toolRow}>
          <View style={styles.toolButtons}>
            <TouchableOpacity
              style={[styles.toolBtn, tool === "brush" && styles.toolBtnActive]}
              onPress={() => { setTool("brush"); toolRef.current = "brush"; }}
            >
              <Text style={[styles.toolBtnText, tool === "brush" && styles.toolBtnTextActive]}>브러시</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, tool === "eraser" && styles.toolBtnActive]}
              onPress={() => { setTool("eraser"); toolRef.current = "eraser"; }}
            >
              <Text style={[styles.toolBtnText, tool === "eraser" && styles.toolBtnTextActive]}>지우개</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sizeWrap}>
            <Text style={styles.sizeLabel}>크기  {brushSize}</Text>
            <View
              style={styles.sliderTrack}
              {...sliderPan.panHandlers}
              onLayout={(e) => { sliderW.current = e.nativeEvent.layout.width; }}
              ref={(ref: any) => {
                if (ref) {
                  ref.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
                    sliderPageX.current = pageX;
                  });
                }
              }}
            >
              <View style={[styles.sliderFill, { width: `${brushRatio * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${brushRatio * 100}%`, marginLeft: -10 }]} />
            </View>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.push({ pathname: "/material-select", params: { detectedWalls: wallCount } } as any)}
          >
            <Text style={styles.doneText}>수정 완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f5f7" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: "#f3f5f7", borderBottomWidth: 1, borderBottomColor: "#e5e5e5",
  },
  backButton: { width: 36, height: 36, justifyContent: "center" },
  backArrow: { fontSize: 26, fontWeight: "bold" },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  undoText: { fontSize: 14, fontWeight: "bold", color: "#222" },
  canvasWrap: {
    width: "100%", height: CANVAS_H, backgroundColor: "#ddd",
    position: "relative", overflow: "hidden",
  },
  canvasImage: { width: "100%", height: CANVAS_H },
  emptyCanvas: {
    width: "100%", height: CANVAS_H,
    justifyContent: "center", alignItems: "center", backgroundColor: "#eee",
  },
  emptyCanvasText: { color: "#999" },
  toolArea: {
    flex: 1, backgroundColor: "#f3f5f7",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
  },
  areaTabs: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5",
    marginBottom: 16, backgroundColor: "white", borderRadius: 10, overflow: "hidden",
  },
  areaTab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, gap: 6, borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  areaTabDot: { width: 10, height: 10, borderRadius: 5 },
  areaTabText: { fontSize: 13, color: "#999", fontWeight: "bold" },
  areaTabTextActive: { color: "#222" },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  toolButtons: { flexDirection: "row", gap: 8 },
  toolBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5e5",
  },
  toolBtnActive: { backgroundColor: "#222", borderColor: "#222" },
  toolBtnText: { fontSize: 13, fontWeight: "bold", color: "#555" },
  toolBtnTextActive: { color: "white" },
  sizeWrap: { flex: 1 },
  sizeLabel: { fontSize: 12, color: "#777", marginBottom: 6 },
  sliderTrack: {
    height: 4, backgroundColor: "#ddd", borderRadius: 2,
    position: "relative", justifyContent: "center",
  },
  sliderFill: { height: 4, backgroundColor: "#222", borderRadius: 2 },
  sliderThumb: {
    position: "absolute", width: 20, height: 20, borderRadius: 10,
    backgroundColor: "white", borderWidth: 2, borderColor: "#222", top: -8,
  },
  bottomButtons: { flexDirection: "row", gap: 12, marginTop: "auto" },
  resetButton: {
    flex: 1, padding: 15, borderRadius: 12,
    backgroundColor: "white", borderWidth: 1, borderColor: "#e5e5e5", alignItems: "center",
  },
  resetText: { fontWeight: "bold", color: "#555" },
  doneButton: { flex: 2, padding: 15, borderRadius: 12, backgroundColor: "#222", alignItems: "center" },
  doneText: { fontWeight: "bold", color: "white", fontSize: 15 },
});
