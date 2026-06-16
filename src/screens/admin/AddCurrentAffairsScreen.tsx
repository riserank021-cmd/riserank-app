/**
 * AddCurrentAffairsScreen
 * Admin-only: create a new current affairs article with bilingual (EN/HI) content.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '../../api/admin.service';
import type { CurrentAffairsPayload, Bilingual } from '../../api/admin.service';

const CA_CATEGORIES = [
  'politics', 'economy', 'science', 'sports',
  'international', 'environment', 'defence', 'awards', 'other',
];

const todayDate = () => new Date().toISOString().slice(0, 10);
const currentTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const INITIAL_FORM: CurrentAffairsPayload = {
  title: { en: '', hi: '' },
  summary: { en: '', hi: '' },
  content: { en: '', hi: '' },
  category: 'other',
  tags: [],
  source: '',
  sourceUrl: '',
  publishDate: todayDate(),
  publishTime: currentTime(),
  isPublished: false,
};

function BilingualInput({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
}: {
  label: string;
  value: Bilingual;
  onChange: (lang: 'en' | 'hi', val: string) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const base = 'border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary bg-white';
  return (
    <View className="mb-4">
      <Text className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        className={base}
        value={value.en}
        onChangeText={(v) => onChange('en', v)}
        placeholder={`${label} (English)`}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={multiline ? { minHeight: 90 } : undefined}
      />
      <View className="h-2" />
      <TextInput
        className={base}
        value={value.hi}
        onChangeText={(v) => onChange('hi', v)}
        placeholder={`${label} (हिंदी)`}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={multiline ? { minHeight: 90 } : undefined}
      />
    </View>
  );
}

export function AddCurrentAffairsScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState<CurrentAffairsPayload>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const setBilingual = (field: 'title' | 'summary' | 'content', lang: 'en' | 'hi', val: string) => {
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: val } }));
  };

  const setField = (key: keyof CurrentAffairsPayload, val: any) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const validate = (): string | null => {
    if (!form.title.en.trim()) return 'Title (English) is required';
    if (!form.content.en.trim()) return 'Content (English) is required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { Alert.alert('Missing field', err); return; }

    setSaving(true);
    try {
      // Combine date + time into ISO datetime for backend
      const publishedAt = form.publishDate && form.publishTime
        ? new Date(`${form.publishDate}T${form.publishTime}:00`).toISOString()
        : new Date().toISOString();
      await adminService.createCurrentAffairs({ ...form, publishedAt } as any);
      Alert.alert('Success', form.isPublished ? 'Article published!' : 'Article saved as draft.', [
        { text: 'Add Another', onPress: () => setForm({ ...INITIAL_FORM, publishDate: todayDate(), publishTime: currentTime() }) },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const inputBase = 'border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-text-primary bg-white';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <Text className="text-2xl text-text-muted">‹</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary flex-1">Add Current Affairs</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          className="bg-primary rounded-xl px-4 py-2"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-sm">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1 px-5 pt-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Title */}
          <BilingualInput label="Title" value={form.title} onChange={(lang, val) => setBilingual('title', lang, val)} required />

          {/* Summary */}
          <BilingualInput label="Summary" value={form.summary} onChange={(lang, val) => setBilingual('summary', lang, val)} multiline />

          {/* Full Content */}
          <BilingualInput label="Full Content" value={form.content} onChange={(lang, val) => setBilingual('content', lang, val)} multiline required />

          {/* Category */}
          <Text className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {CA_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setField('category', cat)}
                  className={`px-3 py-2 rounded-xl border ${
                    form.category === cat ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-medium capitalize ${form.category === cat ? 'text-white' : 'text-text-secondary'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Source */}
          <Text className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Source</Text>
          <TextInput
            className={`${inputBase} mb-2`}
            value={form.source}
            onChangeText={(v) => setField('source', v)}
            placeholder="e.g. The Hindu"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            className={`${inputBase} mb-4`}
            value={form.sourceUrl}
            onChangeText={(v) => setField('sourceUrl', v)}
            placeholder="Source URL (optional)"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="url"
          />

          {/* Publish Date & Time */}
          <Text className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Publish Date & Time</Text>
          <View className="flex-row gap-2 mb-4">
            <TextInput
              className={`${inputBase} flex-1`}
              value={form.publishDate}
              onChangeText={(v) => setField('publishDate', v)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
            <TextInput
              className={`${inputBase}`}
              style={{ width: 90 }}
              value={form.publishTime}
              onChangeText={(v) => setField('publishTime', v)}
              placeholder="HH:MM"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* Tags */}
          <Text className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Tags</Text>
          <View className="flex-row gap-2 mb-2">
            <TextInput
              className={`${inputBase} flex-1`}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              placeholder="Add tag and press +"
              placeholderTextColor="#94a3b8"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addTag} className="bg-primary rounded-xl px-4 justify-center">
              <Text className="text-white font-bold text-lg">+</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {form.tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => removeTag(tag)}
                className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 flex-row items-center gap-1"
              >
                <Text className="text-xs text-text-secondary">{tag}</Text>
                <Text className="text-xs text-text-muted">✕</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Publish toggle */}
          <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-6">
            <View>
              <Text className="text-sm font-semibold text-text-primary">Publish Now</Text>
              <Text className="text-xs text-text-muted mt-0.5">Off = save as draft</Text>
            </View>
            <Switch
              value={form.isPublished}
              onValueChange={(v) => setField('isPublished', v)}
              trackColor={{ false: '#e2e8f0', true: '#2563EB' }}
              thumbColor="#fff"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="bg-primary rounded-2xl py-4 items-center mb-8"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {form.isPublished ? 'Publish Article' : 'Save as Draft'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
