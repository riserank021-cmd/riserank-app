/**
 * CurrentAffairCard — compact card for the current affairs list.
 */

import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import type { CurrentAffair } from '../../types/api.types';
import { useLanguage } from '../../hooks/useLanguage';
import { t, formatDate } from '../../utils/format';

interface CurrentAffairCardProps {
  item: CurrentAffair;
  onPress: () => void;
}

export const CurrentAffairCard = React.memo(function CurrentAffairCard({ item, onPress }: CurrentAffairCardProps) {
  const { language } = useLanguage();
  const title = t(item.title, language);
  const summary = t(item.summary, language);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-surface-card rounded-2xl mx-4 mb-3 border border-border overflow-hidden"
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : null}

      <View className="p-4">
        <Text className="text-text-primary text-base font-bold leading-5" numberOfLines={2}>
          {title}
        </Text>
        {summary ? (
          <Text className="text-text-secondary text-sm mt-1.5 leading-5" numberOfLines={3}>
            {summary}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-1 mr-2">
            {item.publishedAt && (
              <Text className="text-text-muted text-xs">
                🕐 {formatDate(item.publishedAt, 'dd MMM yyyy, hh:mm a')}
              </Text>
            )}
            {item.createdBy?.name && (
              <Text className="text-primary-600 text-[11px] font-medium mt-0.5">
                ✍️ {item.createdBy.name}
              </Text>
            )}
          </View>
          {(item.tags ?? []).length > 0 && (
            <View className="flex-row">
              {(item.tags ?? []).slice(0, 2).map((tag) => (
                <View key={tag} className="bg-primary-50 rounded-full px-2 py-0.5 ml-1">
                  <Text className="text-primary-700 text-[10px] font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});
