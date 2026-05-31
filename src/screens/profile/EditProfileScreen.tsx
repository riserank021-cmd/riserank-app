/**
 * EditProfileScreen — update name, phone, state, preferred language, preferred exams.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { userService } from '../../api/user.service';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components';
import { pickImage, uploadAvatar } from '../../services/upload.service';
import {
  validateName,
  validatePhone,
  collectErrors,
} from '../../utils/validators';
import { EXAM_CATEGORIES } from '../../utils/constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Other',
];

export function EditProfileScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [state, setState] = useState(user?.state ?? '');
  const [preferredExams, setPreferredExams] = useState<string[]>(user?.preferredExams ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handlePickAvatar = async () => {
    const image = await pickImage();
    if (!image) return;
    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(image);
      setAvatarUri(url);
      // Immediately update the user object so the avatar shows everywhere
      if (user) setUser({ ...user, avatar: url });
      Toast.show({ type: 'success', text1: 'Photo updated!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Please try again.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const toggleExam = (exam: string) => {
    setPreferredExams((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  const handleSave = async () => {
    const errs = collectErrors([
      ['name', validateName(name)],
      ['phone', validatePhone(phone)],
    ]);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSaving(true);

    try {
      const { data } = await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        state: state.trim() || undefined,
        preferredExams,
      });
      if (data.data) setUser(data.data);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: err?.response?.data?.message ?? 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-primary-600 font-medium text-base">← Cancel</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-base font-bold">Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text className={`font-semibold text-base ${isSaving ? 'text-text-muted' : 'text-primary-600'}`}>
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-5">
            {/* Avatar picker */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
                className="relative"
              >
                <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center overflow-hidden">
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} className="w-24 h-24" />
                  ) : (
                    <Text className="text-primary-700 text-3xl font-bold">
                      {user?.name.charAt(0).toUpperCase() ?? '?'}
                    </Text>
                  )}
                  {/* Overlay */}
                  <View className="absolute bottom-0 left-0 right-0 bg-black/40 items-center py-1.5">
                    {isUploadingAvatar ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-[10px] font-semibold">📷 Change</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <Text className="text-text-muted text-xs mt-2">Tap to change photo</Text>
            </View>

            {/* Basic fields */}
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />
            <Input
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              keyboardType="phone-pad"
              hint="10-digit Indian mobile number"
            />

            {/* State picker (simple list) */}
            <Text className="text-text-secondary text-sm font-medium mb-2">State</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {INDIAN_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setState(s)}
                  className={`mr-2 px-3 py-2 rounded-full border ${
                    state === s
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-border bg-surface-card'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      state === s ? 'text-white' : 'text-text-secondary'
                    }`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Preferred exams multi-select */}
            <Text className="text-text-secondary text-sm font-medium mb-2">
              Preferred Exams
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {EXAM_CATEGORIES.map((exam) => {
                const selected = preferredExams.includes(exam);
                return (
                  <TouchableOpacity
                    key={exam}
                    onPress={() => toggleExam(exam)}
                    className={`px-3 py-1.5 rounded-full border ${
                      selected
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-border bg-surface-card'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      {exam}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button label="Save Changes" onPress={handleSave} loading={isSaving} fullWidth size="lg" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
