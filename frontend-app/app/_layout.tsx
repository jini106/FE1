import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="create-design" options={{ headerShown: false }} />
      <Stack.Screen name="image-preview" options={{ headerShown: false }} />
      <Stack.Screen name="analyzing" options={{ headerShown: false }} />
      <Stack.Screen name="analysis-result" options={{ headerShown: false }} />
      <Stack.Screen name="material-select" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
    </Stack>
  );
}