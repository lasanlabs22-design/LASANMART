import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ChangePasswordScreen({ navigation }: any) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = () => {
    if (!current || !newPass || !confirm) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (newPass !== confirm) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    // POC stub — replace with real API call later:
    // await api.post('/change-password', { current, newPass });
    Alert.alert('Success', 'Your password has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput style={styles.input} secureTextEntry value={current} onChangeText={setCurrent} placeholderTextColor={colors.textLight} />

        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} secureTextEntry value={newPass} onChangeText={setNewPass} placeholderTextColor={colors.textLight} />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholderTextColor={colors.textLight} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  content: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textDark },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 28 },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});