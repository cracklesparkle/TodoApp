import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, Modal, SafeAreaView, StyleSheet, StatusBar, Pressable, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FontAwesome } from '@expo/vector-icons'

const STORAGE_KEY = '@tasks';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(null);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // New state to store the index of the task being edited

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks: ', error);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks: ', error);
    }
  };

  const addTask = () => {
    if (taskName === '') {
      Alert.alert('Set the task name');
      return;
    }

    if (editIndex !== null) {
      // Editing existing task
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = { name: taskName, description: taskDescription, deadline: taskDeadline, completed: tasks[editIndex].completed };
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setEditIndex(null);
    } else {
      // Adding new task
      const newTask = { name: taskName, description: taskDescription, deadline: taskDeadline, completed: false };
      setTasks([...tasks, newTask]);
      saveTasks([...tasks, newTask]);
    }

    setTaskName('');
    setTaskDescription('');
    setTaskDeadline(null);
    setIsModalVisible(false);
  };

  const removeTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (index) => {
    setEditIndex(index); // Set the index of the task being edited
    const taskToEdit = tasks[index];
    setTaskName(taskToEdit.name);
    setTaskDescription(taskToEdit.description);
    setTaskDeadline(taskToEdit.deadline);
    setIsModalVisible(true);
  }

  const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <FontAwesome name={checked ? 'check-square' : 'square-o'} size={24} color={checked ? 'green' : 'black'} />
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => editTask(index)}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: 32}}>
            <Checkbox checked={item.completed} onPress={() => toggleTaskCompletion(index)} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', textDecorationLine: item.completed ? 'line-through' : 'none', marginLeft: 10 }}>{item.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <Pressable title="Remove" onPress={() => removeTask(index)}>
            <FontAwesome name="remove" size={24} color="black" />
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );


  const showDateTimePicker = () => {
    setIsDateTimePickerVisible(true);
  };

  const hideDateTimePicker = () => {
    setIsDateTimePickerVisible(false);
  };

  const handleConfirmDateTime = (date) => {
    setTaskDeadline(date);
    hideDateTimePicker();
  };

  return (
    <SafeAreaView style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
      <View style={styles.container}>
        <Button title="Добавить задачу" onPress={() => setIsModalVisible(true)} />

        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,.8)',
            gap: 20
          }}>
            <TextInput
              style={{ padding: 10, borderWidth: 1, borderColor: '#ccc', width: '80%', borderRadius: 8 }}
              placeholder="Название"
              value={taskName}
              onChangeText={text => setTaskName(text)}
            />
            <TextInput
              style={{ padding: 10, borderWidth: 1, borderColor: '#ccc', width: '80%', borderRadius: 8 }}
              placeholder="Описание"
              value={taskDescription}
              onChangeText={text => setTaskDescription(text)}
            />
            <Button title="Срок выполнения" onPress={showDateTimePicker} />
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible}
              mode="datetime"
              onConfirm={handleConfirmDateTime}
              onCancel={hideDateTimePicker}
            />
            <Button title={editIndex !== null ? "Сохранить" : "Добавить"} onPress={addTask} />
            <Button title="Отмена" onPress={() => { setIsModalVisible(false); setEditIndex(null); }} />
          </View>
        </Modal>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Задачи:</Text>
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%'
  }
});

export default App;
