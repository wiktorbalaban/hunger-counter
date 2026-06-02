import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHunger } from '../context/HungerContext';
import { generateMockEntries } from '../utils/seedMockData';

export function DevTools() {
  const { addEntries, clearEntries } = useHunger();

  if (!__DEV__) return null;

  function handleSeed() {
    addEntries(generateMockEntries());
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#d97706',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: '#fde68a',
        }}
      >
        <Ionicons name="construct-outline" size={14} color="#92400e" />
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400e', letterSpacing: 1 }}>
          DEV TOOLS
        </Text>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        <TouchableOpacity
          onPress={handleSeed}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: '#fef3c7',
          }}
        >
          <Ionicons name="sparkles-outline" size={18} color="#92400e" />
          <Text style={{ color: '#92400e', fontWeight: '600' }}>Seed mock data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={clearEntries}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: '#fef3c7',
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#92400e" />
          <Text style={{ color: '#92400e', fontWeight: '600' }}>Clear all entries</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
