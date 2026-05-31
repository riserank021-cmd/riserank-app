/**
 * CategoryFilterBar — horizontal scrollable chip row for filtering by category/tag.
 *
 * Usage:
 *   <CategoryFilterBar
 *     options={['All', 'SSC', 'Railway', 'Banking']}
 *     selected={selected}
 *     onChange={setSelected}
 *   />
 *
 * 'All' is always prepended if not already in options.
 * Selected chip is filled primary-600; others are outlined.
 */

import React, { useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Animated,
} from 'react-native';

interface Props {
  options: readonly string[];
  selected: string;
  onChange: (value: string) => void;
  /** Prefix label, e.g. "Filter:" — shown before the chips */
  label?: string;
}

const ALL = 'All';

export function CategoryFilterBar({ options, selected, onChange, label }: Props) {
  // Ensure 'All' is always first
  const chips = options[0] === ALL ? options : [ALL, ...options];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
        keyboardShouldPersistTaps="handled"
      >
        {label && (
          <View className="justify-center mr-1">
            <Text className="text-text-muted text-sm font-medium">{label}</Text>
          </View>
        )}

        {chips.map((chip) => {
          const isActive = chip === selected || (chip === ALL && !selected);
          return (
            <TouchableOpacity
              key={chip}
              onPress={() => onChange(chip === ALL ? '' : chip)}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: isActive ? '#2563EB' : '#E2E8F0',
                backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : '#64748B',
                }}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
