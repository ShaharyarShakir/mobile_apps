import { useProjects } from "@/hooks/use-projects";
import { Text, View } from "react-native";

export default function ProjectsScreen() {
  const { data, isPending, isError } = useProjects();

  if (isPending) {
    return (
      <View>
        <Text>Loading projects...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View>
        <Text>Unable to load projects.</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Projects</Text>

      {data.projects.map((project) => (
        <Text key={project.id}>
          {project.name}
        </Text>
      ))}
    </View>
  );
}

