import { createHomeStyles } from "@/assets/styles/home.styles";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">
export default function Index() {
  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null)
  const [editText, setEditText] = useState<string>("")
  const { toggleDarkMode, colors } = useTheme()
  const HomeStyles = createHomeStyles(colors)
  const todos = useQuery(api.todos.getTodos)
  const toggleTodo = useMutation(api.todos.toggleTodo)
  const deleteTodo = useMutation(api.todos.deleteTodo)
  const updateTodo = useMutation(api.todos.updateTodo)
  const isLoading = todos === undefined

  if (isLoading) return <LoadingSpinner />
  const handleToggleTodo = async (id: Id<"todos">) => {
    try {
      await toggleTodo({ id })
    } catch (error) {
      console.error("Failed to update todo", error)
      Alert.alert("Error", "Failed to update todo")

    }

  }
  const handleDeleteTodo = async (id: Id<"todos">) => {
    try {
      Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTodo({ id }) },
      ])
    } catch (error) {

    }
  }
  const handleEditTodo = (todo: Todo) => {
    setEditText(todo.text)
    setEditingId(todo._id)
  }
  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await updateTodo({ id: editingId, text: editText.trim() })
        setEditingId(null)
        setEditText("")
      } catch (error) {
        console.error("Failed to update todo", error)
        Alert.alert("Error", "Failed to update todo")
      }
    }
  }
  const handleCancelTodo = () => {
    setEditingId(null)
    setEditText("")

  }
  const renderTodoItem = ({ item }: { item: Todo }) => {
    const isEditing = editingId === item._id
    return (

      < View style={HomeStyles.todoItemWrapper} >
        <LinearGradient
          colors={colors.gradients.surface}
          style={HomeStyles.todoItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={HomeStyles.checkbox}
            activeOpacity={0.7}
            onPressOut={() => { handleToggleTodo(item._id) }}
          >
            <LinearGradient
              colors={item.isCompleted ? colors.gradients.success : colors.gradients.muted}
              style={[HomeStyles.checkboxInner, { borderColor: item.isCompleted ? "transparent" : colors.border }]}
            ></LinearGradient>
          </TouchableOpacity>
          {isEditing ? (
            <View style={HomeStyles.editContainer} >
              <TextInput
                style={HomeStyles.editInput}
                value={editText}
                onChangeText={setEditText}
                autoFocus
                multiline
                placeholder="Edit todo..."
                placeholderTextColor={colors.textMuted}
              />
              <View style={HomeStyles.editButton}>
                <TouchableOpacity onPressOut={handleSaveEdit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.success}
                    style={HomeStyles.editButton}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={HomeStyles.editButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPressOut={handleCancelTodo} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.muted}
                    style={HomeStyles.editButton}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={HomeStyles.editButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={HomeStyles.todoTextContainer}>
              <Text
                style={[
                  HomeStyles.todoText,
                  item.isCompleted && {
                    textDecorationLine: "line-through",
                    color: colors.textMuted,
                    opacity: 0.5
                  }
                ]}
              >{item.text}</Text>
              <View style={HomeStyles.todoActions}>
                <TouchableOpacity onPress={() => handleEditTodo(item)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.warning}
                    style={HomeStyles.actionButton}
                  >
                    <Ionicons name="pencil" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTodo(item._id)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.danger}
                    style={HomeStyles.actionButton}
                  >
                    <Ionicons name="trash" size={14} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )
          }
        </LinearGradient >

      </View >
    )
  }


  return (
    <LinearGradient colors={colors.gradients.background} style={HomeStyles.container}>
      {/* <StatusBar backgroundColor={colors.statusBarStyle} /> */}
      <SafeAreaView
        style={HomeStyles.safeArea}
      >
        <Header />
        <TodoInput />

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={HomeStyles.todoList}
          contentContainerStyle={HomeStyles.todoListContent}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView >
    </LinearGradient>
  );
}


