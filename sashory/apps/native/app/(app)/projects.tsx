import { useProjects } from "@/hooks/use-projects";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function ProjectsScreen() {
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useProjects();

  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted-foreground mt-3 text-sm">Loading projects...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6 bg-background">
        <Text className="text-danger font-medium text-center">Unable to load projects.</Text>
        <Button onPress={() => refetch()} className="bg-accent">
          <Button.Label className="text-accent-foreground">Try again</Button.Label>
        </Button>
      </View>
    );
  }

  const projects = data?.projects ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Projects",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(app)/project/create")}
              className="flex-row items-center gap-1 bg-accent/15 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="add" size={16} color={accentColor} />
              <Text className="font-bold text-xs text-accent">New</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={
          <View className="items-center gap-3 p-8 my-6">
            <View className="w-14 h-14 rounded-full bg-accent/10 items-center justify-center">
              <Ionicons name="folder-outline" size={28} color={accentColor} />
            </View>
            <Text className="text-lg font-bold text-foreground text-center">
              No projects yet
            </Text>
            <Text className="text-center text-xs text-muted-foreground max-w-xs">
              Create your first project to track savings, expenses, or milestones.
            </Text>
            <Button
              className="mt-3 bg-accent"
              onPress={() => router.push("/(app)/project/create")}
            >
              <Button.Label className="text-accent-foreground font-semibold">
                + New Project
              </Button.Label>
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <View className="py-1.5">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(app)/project/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Surface
                variant="secondary"
                className="p-4 rounded-2xl border border-border flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View className="w-11 h-11 rounded-xl bg-blue-500/10 items-center justify-center">
                    <Ionicons name="folder-outline" size={22} color="#3B82F6" />
                  </View>

                  <View className="gap-0.5 flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text
                        className="text-xs text-muted-foreground mt-0.5"
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    ) : (
                      <Text className="text-xs text-muted-foreground/60">
                        No description
                      </Text>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={mutedColor} />
              </Surface>
            </Pressable>
          </View>
        )}
      />
    </>
  );
}
