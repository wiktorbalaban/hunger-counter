import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface ListItem<T extends string> {
  key: T;
  label: string;
  description?: string;
}

interface Props<T extends string> {
  visible: boolean;
  title: string;
  items: ListItem<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
  onClose: () => void;
}

export function ListItemPicker<T extends string>({
  visible,
  title,
  items,
  selectedKey,
  onSelect,
  onClose,
}: Props<T>) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: theme.modalOverlay, padding: 24 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.surface, maxHeight: 400 }}
        >
          <Text
            className="text-base font-semibold text-gray-900 dark:text-gray-100"
            style={{ padding: 16, paddingBottom: 8 }}
          >
            {title}
          </Text>
          <ScrollView bounces={false}>
            {items.map(({ key, label, description }, index) => {
              const isLast = index === items.length - 1;
              const isSelected = selectedKey === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => onSelect(key)}
                  activeOpacity={0.6}
                  className={`flex-row items-center${isLast ? '' : ' border-b border-gray-100 dark:border-gray-700'}`}
                  style={{ padding: 16, gap: 12 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text className="text-base text-gray-900 dark:text-gray-100">{label}</Text>
                    {description && (
                      <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                      </Text>
                    )}
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
