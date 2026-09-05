import { useProjects } from "@/hooks/use-projects";
import { router, Stack } from "expo-router";
import {
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

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading projects...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text>Unable to load projects.</Text>

        <Pressable
          className="rounded-xl bg-black px-4 py-3"
          onPress={() => refetch()}
        >
          <Text className="font-semibold text-white">
            Try again
          </Text>
        </Pressable>
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
            >
              <Text className="font-semibold">New</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={
          <View className="items-center gap-2 p-8">
            <Text className="text-lg font-semibold">
              No projects yet
            </Text>
            <Text className="text-center text-gray-500">
              Create your first project to get started.
            </Text>
            <Pressable
              className="mt-4 rounded-xl bg-black px-4 py-3"
              onPress={() => router.push("/(app)/project/create")}
            >
              <Text className="font-semibold text-white">
                New project
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="border-b border-gray-200 px-4 py-4"
            onPress={() =>
              router.push({
                pathname: "/(app)/project/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text className="text-base font-semibold">
              {item.name}
            </Text>

            {item.description ? (
              <Text
                className="mt-1 text-gray-500"
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </>
  );
}
