/**
 * ReportQuestionModal — bottom sheet for reporting a question.
 *
 * Props:
 *   visible      — controls modal visibility
 *   questionId   — the question being reported
 *   onClose      — callback to hide the modal
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { reportService, type ReportReason } from '../../api/report.service';

interface ReportQuestionModalProps {
  visible: boolean;
  questionId: string;
  onClose: () => void;
}

const REASONS: { key: ReportReason; label: string; description: string }[] = [
  { key: 'wrong_answer',       label: 'Wrong answer',        description: 'The marked correct answer is incorrect' },
  { key: 'incorrect_question', label: 'Incorrect question',  description: 'The question itself has an error' },
  { key: 'typo_or_language',   label: 'Typo / language',     description: 'Spelling mistake or translation error' },
  { key: 'outdated_content',   label: 'Outdated content',    description: 'Information is no longer current' },
  { key: 'other',              label: 'Other',               description: 'Something else is wrong' },
];

export function ReportQuestionModal({ visible, questionId, onClose }: ReportQuestionModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setSelectedReason(null);
    setNote('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);
    try {
      await reportService.reportQuestion({
        questionId,
        reason: selectedReason,
        note: note.trim() || undefined,
      });
      Toast.show({ type: 'success', text1: 'Report submitted', text2: 'Thank you for your feedback!' });
      handleClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to submit',
        text2: err?.response?.data?.message ?? 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Dim overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1 bg-black/40 justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Sheet — stop propagation so tapping inside doesn't close */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View className="bg-surface-card rounded-t-3xl px-4 pb-8 pt-5">
              {/* Handle */}
              <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

              {/* Title */}
              <Text className="text-text-primary text-lg font-bold mb-1">Report Question</Text>
              <Text className="text-text-secondary text-sm mb-4">
                Help us improve by telling us what's wrong.
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-72">
                {REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    onPress={() => setSelectedReason(r.key)}
                    className={`flex-row items-start p-3 rounded-xl mb-2 border ${
                      selectedReason === r.key
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border bg-surface'
                    }`}
                  >
                    {/* Radio circle */}
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 items-center justify-center flex-shrink-0 ${
                        selectedReason === r.key ? 'border-primary-600' : 'border-border'
                      }`}
                    >
                      {selectedReason === r.key && (
                        <View className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          selectedReason === r.key ? 'text-primary-700' : 'text-text-primary'
                        }`}
                      >
                        {r.label}
                      </Text>
                      <Text className="text-text-muted text-xs mt-0.5">{r.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Optional note */}
              <View className="mt-3">
                <TextInput
                  placeholder="Add a note (optional)"
                  placeholderTextColor="#94A3B8"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  className="bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm"
                  style={{ textAlignVertical: 'top', minHeight: 72 }}
                />
                <Text className="text-text-muted text-xs text-right mt-1">{note.length}/300</Text>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 border border-border rounded-xl py-3 items-center"
                >
                  <Text className="text-text-secondary font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!selectedReason || isSubmitting}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    selectedReason && !isSubmitting ? 'bg-primary-600' : 'bg-primary-200'
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-semibold">Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
