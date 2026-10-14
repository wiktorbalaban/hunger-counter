import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { DailyGoal } from '../services/goal.service';
import { formatGoalDuration, formatGoalRange, goalStatus, GoalStatus } from '../utils/goal';

interface Props {
  totalMinutes: number;
  goal: DailyGoal;
  size?: number;
  caption?: string;
}

// 270° open-bottom arc: from -135° to +135° (0° = top, clockwise).
const SWEEP_START = -135;
const SWEEP_END = 135;
const SWEEP_RANGE = SWEEP_END - SWEEP_START; // 270

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Clockwise arc from startAngle to endAngle (degrees, 0° = top). */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function GoalGauge({ totalMinutes, goal, size = 180, caption }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const status = goalStatus(totalMinutes, goal);
  const statusColor: Record<GoalStatus, string> = {
    under: theme.mediumHunger,
    onTarget: theme.primary,
    over: theme.highHunger,
  };
  const statusKey: Record<GoalStatus, 'goal.under' | 'goal.onTarget' | 'goal.over'> = {
    under: 'goal.under',
    onTarget: 'goal.onTarget',
    over: 'goal.over',
  };

  // Scale so the max marker sits mid-arc with headroom to show "over".
  const scaleMax = Math.max(goal.max > 0 ? goal.max * 1.5 : 60, totalMinutes, 1);
  const frac = (v: number) => Math.min(Math.max(v / scaleMax, 0), 1);
  const angleAt = (v: number) => SWEEP_START + frac(v) * SWEEP_RANGE;

  const strokeWidth = 14;
  const r = size / 2 - strokeWidth / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  const progressEnd = angleAt(totalMinutes);
  const minAngle = angleAt(goal.min);
  const maxAngle = angleAt(goal.max);

  // Tick marks across the ring at the band edges.
  const tick = (angle: number) => {
    const inner = polarToCartesian(cx, cy, r - strokeWidth / 2 - 2, angle);
    const outer = polarToCartesian(cx, cy, r + strokeWidth / 2 + 2, angle);
    return { inner, outer };
  };
  const minTick = tick(goal.min <= scaleMax ? minAngle : SWEEP_END);
  const maxTick = tick(goal.max <= scaleMax ? maxAngle : SWEEP_END);

  return (
    <View className="items-center" style={{ width: size }}>
      {caption ? (
        <Text style={{ color: theme.textLabel }} className="text-xs mb-1">{caption}</Text>
      ) : null}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Path
            d={describeArc(cx, cy, r, SWEEP_START, SWEEP_END)}
            stroke={theme.secondarySurface}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* Goal band */}
          {goal.max > goal.min && (
            <Path
              d={describeArc(cx, cy, r, minAngle, maxAngle)}
              stroke={theme.primary}
              strokeOpacity={0.25}
              strokeWidth={strokeWidth}
              fill="none"
            />
          )}
          {/* Progress */}
          {totalMinutes > 0 && (
            <Path
              d={describeArc(cx, cy, r, SWEEP_START, progressEnd)}
              stroke={statusColor[status]}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          )}
          {/* Band edge ticks */}
          <Line {...lineProps(minTick)} stroke={theme.textMuted} strokeWidth={2} />
          <Line {...lineProps(maxTick)} stroke={theme.textMuted} strokeWidth={2} />
        </Svg>

        {/* Center readout */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} className="items-center justify-center">
          <Text style={{ color: statusColor[status] }} className="text-3xl font-bold">
            {formatGoalDuration(totalMinutes)}
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-xs mt-0.5">
            {t('goal.title')}
          </Text>
          <Text style={{ color: theme.textLabel }} className="text-xs">
            {formatGoalRange(goal)}
          </Text>
          <Text style={{ color: statusColor[status] }} className="text-sm font-semibold mt-1">
            {t(statusKey[status])}
          </Text>
        </View>
      </View>
    </View>
  );
}

function lineProps({ inner, outer }: { inner: { x: number; y: number }; outer: { x: number; y: number } }) {
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
}
