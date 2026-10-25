import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HungerEntry } from '../models/hunger-entry.model';
import { AnimatedDot } from './AnimatedDot';

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface Props {
  entry: HungerEntry;
  color: string;
  armed: boolean;
  onArm: () => void;
  onDisarm: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryCard({ entry, color, armed, onArm, onDisarm, onEdit, onDelete }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const reveal = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const didMount = useRef(false);

  useEffect(() => {
    Animated.timing(reveal, {
      toValue: armed ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

    // Shake only when arming (not on first mount, not on disarm).
    if (!didMount.current) { didMount.current = true; return; }
    if (!armed) return;
    shake.setValue(0);
    Animated.sequence(
      [1, -1, 1, -0.5, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 45, useNativeDriver: true }),
      ),
    ).start();
  }, [armed, reveal, shake]);

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  const confirmDelete = () => {
    Alert.alert(
      t('today.deleteTitle'),
      t('today.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel', onPress: onDisarm },
        { text: t('common.delete'), style: 'destructive', onPress: onDelete },
      ],
      { onDismiss: onDisarm },
    );
  };

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
    <Pressable
      onPress={() => { if (armed) { onDisarm(); } else { onEdit(); } }}
      onLongPress={onArm}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
      style={{ elevation: 2 }}
    >
      <View style={{ height: 4, backgroundColor: color }} />
      <View style={{ padding: 16, gap: 12 }}>
        <View className="flex-row items-center justify-between">
          <Text style={{ color }} className="font-bold text-base">{t(`intensity.${entry.intensity}`)}</Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            {new Date(entry.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View className="flex-row gap-2 flex-wrap">
          <Chip icon="time-outline" label={formatDuration(entry.durationMinutes)} primaryColor={theme.primary} />
          {entry.concentrationProblems && (
            <View style={{ backgroundColor: theme.conc }} className="flex-row items-center gap-1 px-3 py-1 rounded-full">
              <AnimatedDot size={6} color={theme.white} />
              <Text className="text-white text-xs font-medium">{t('today.focusIssues')}</Text>
            </View>
          )}
        </View>
      </View>

      <Animated.View
        pointerEvents={armed ? 'auto' : 'none'}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, 72] }),
        }}
      >
        <Pressable
          onPress={confirmDelete}
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: theme.highHunger }}
        >
          <Ionicons name="trash" size={24} color={theme.white} />
        </Pressable>
      </Animated.View>
    </Pressable>
    </Animated.View>
  );
}

function Chip({ icon, label, primaryColor }: { icon: keyof typeof Ionicons.glyphMap; label: string; primaryColor: string }) {
  return (
    <View style={{ backgroundColor: primaryColor + '1a' }} className="flex-row items-center gap-1 px-3 py-1 rounded-full">
      <Ionicons name={icon} size={13} color={primaryColor} />
      <Text style={{ color: primaryColor }} className="text-xs font-medium">{label}</Text>
    </View>
  );
}
