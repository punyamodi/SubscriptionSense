import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Colors } from '../../theme/colors';
import { useUserStore } from '../../state/client/userStore';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const AVATAR_COLORS = [
  '#FF4B4B', '#FFB84B', '#4BFF8B', '#4B7BFF', '#A34BFF', '#FF4B8B', '#4BFFFF', '#FFFFFF'
];

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { username, avatar, setUsername, setAvatar } = useUserStore();
  
  const [name, setName] = useState(username || '');
  const [selectedColor, setSelectedColor] = useState(avatar || AVATAR_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name cannot be empty' });
      return;
    }
    
    setUsername(name);
    setAvatar(selectedColor);
    Toast.show({ type: 'success', text1: 'Profile updated!' });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <AppText variant="semibold" size="lg">Edit Profile</AppText>
        <TouchableOpacity onPress={handleSave}>
          <AppText variant="semibold" size="md" color={Colors.primary}>Save</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
            <AppText variant="serifBold" size="4xl" color={selectedColor === '#FFFFFF' ? '#000' : '#FFF'}>
              {name.charAt(0).toUpperCase()}
            </AppText>
          </View>
          
          <AppText variant="medium" size="sm" color={Colors.text.secondary} style={{ marginTop: 16 }}>
            Choose Profile Color
          </AppText>
          
          <View style={styles.colorGrid}>
            {AVATAR_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.inputGroup}>
          <AppText variant="semibold" size="sm" color={Colors.text.secondary} uppercase style={styles.label}>
            Display Name
          </AppText>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: Colors.text.primary,
    transform: [{ scale: 1.1 }],
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    color: Colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
