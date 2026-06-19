import { ChatInput } from "@/components/chat-input";
import { ChatMessage, Message } from "@/components/chat-message";
import { ModelLoader } from "@/components/model-loader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { completion, loadModel, unloadModel } from "@qvac/sdk";
import { useClipboard } from "@react-native-clipboard/clipboard";
// Replace YOUR_MODEL_CONSTANT with your actual model, e.g. QWEN3_600M_INST_Q4
import { QWEN3_600M_INST_Q4 } from "@qvac/sdk";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUGGESTIONS = [
  {
    title: "Write a React Native hook",
    subtitle: "for dark/light theme switching",
    prompt: "Write a React Native typescript hook for theme toggling",
  },
  {
    title: "Explain consensus protocols",
    subtitle: "differences between PoW and PoS",
    prompt:
      "Explain the main differences between proof of work and proof of stake",
  },
  {
    title: "Draft a client email",
    subtitle: "asking for feedback on a project",
    prompt:
      "Draft a polite email to a client requesting feedback on a completed project",
  },
  {
    title: "Optimize LCP performance",
    subtitle: "how to improve Largest Contentful Paint",
    prompt:
      "Analyze why performance optimization is critical for Largest Contentful Paint (LCP) and how to improve it",
  },
];

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Model loading state
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [modelId, setModelId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const startDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const id = await loadModel({
        modelSrc: QWEN3_600M_INST_Q4, // swap this constant for your model
        modelConfig: { ctx_size: 4096 },
        onProgress: (p) => setDownloadProgress(p.percentage / 100),
      });
      setModelId(id);
      setDownloadProgress(1);
      setIsModelLoaded(true);
    } catch (err) {
      console.error("Failed to load QVAC model:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Unload model on unmount
  useEffect(() => {
    return () => {
      if (modelId) {
        unloadModel({ modelId, clearStorage: false }).catch(() => { });
      }
    };
  }, [modelId]);

  // Automatically scroll to bottom when messages list updates
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isGenerating]);

  const copyToClipboard = (text: string) => {
    if (Platform.OS === "web") {
      navigator.clipboard.writeText(text);
    } else {
      useClipboard.apply(text);
    }
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || isGenerating || !modelId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsGenerating(true);

    // Add a placeholder assistant message to stream tokens into
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const result = completion({
        modelId,
        history: updatedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        stream: true,
      });

      for await (const event of result.events) {
        if (event.type === "contentDelta") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + event.text }
                : m
            )
          );
        }
      }
    } catch (err) {
      console.error("QVAC completion error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
              ...m,
              content: "⚠️ Something went wrong. Please try again.",
            }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setIsGenerating(false);
  };

  if (!isModelLoaded) {
    return (
      <ModelLoader
        onDownload={startDownload}
        isDownloading={isDownloading}
        progress={downloadProgress}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 44 : 0}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center bg-background px-4 py-3 border-border/20 border-b">
          <View className="flex-row items-center gap-1.5">
            <SymbolView
              name={{
                ios: "sparkles",
                android: "auto_awesome",
                web: "auto_awesome",
              }}
              tintColor="#009393"
              size={18}
            />
            <Text className="font-mono font-bold text-[#009393] text-sm tracking-wider">
              QVAC AI Assistant
            </Text>
          </View>

          <Button
            variant="ghost"
            size="icon"
            className="active:bg-secondary rounded-md w-8 h-8"
            onPress={startNewChat}
          >
            <SymbolView
              name={{ ios: "square.and.pencil", android: "edit", web: "edit" }}
              tintColor="#ffffff"
              size={18}
            />
          </Button>
        </View>

        {/* Chat History / Welcome Grid */}
        <View className="flex-1">
          {messages.length === 0 ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              className="px-6"
            >
              <View className="items-center gap-3 mb-8">
                <View className="justify-center items-center bg-secondary shadow-black/50 shadow-lg border border-border/40 rounded-full w-14 h-14">
                  <SymbolView
                    name={{
                      ios: "sparkles",
                      android: "auto_awesome",
                      web: "auto_awesome",
                    }}
                    tintColor="#009393"
                    size={28}
                  />
                </View>
                <Text className="font-bold text-2xl text-center tracking-tight">
                  How can I help you today?
                </Text>
              </View>

              <View className="gap-3">
                {SUGGESTIONS.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => void handleSend(item.prompt)}
                    className="bg-card active:bg-secondary/40 shadow-sm p-4 border border-border/40 rounded-xl transition-colors"
                  >
                    <Text className="font-semibold text-foreground text-sm">
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-muted-foreground text-xs">
                      {item.subtitle}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {messages.map((item) => (
                <ChatMessage
                  key={item.id}
                  message={item}
                  onCopy={copyToClipboard}
                />
              ))}

              {isGenerating && messages[messages.length - 1]?.content === "" && (
                <View className="flex-row self-start gap-4 bg-black/20 px-3 py-6 w-full">
                  <View className="justify-center items-center bg-primary shadow-sm border border-border/20 rounded-full w-8 h-8">
                    <SymbolView
                      name={{
                        ios: "sparkles",
                        android: "auto_awesome",
                        web: "auto_awesome",
                      }}
                      tintColor="#ffffff"
                      size={16}
                    />
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="font-mono text-muted-foreground text-sm animate-pulse">
                      QVAC is thinking...
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Input Bar */}
        <View className="bg-background px-4 py-4 border-border/10 border-t">
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSubmit={() => void handleSend()}
            isGenerating={isGenerating}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}