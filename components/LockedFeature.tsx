import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Crown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import React from "react";

interface LockedFeatureProps {
  title: string;
  description: string;
  compact?: boolean;
}

export function LockedFeature({ title, description, compact = false }: LockedFeatureProps) {
  const router = useRouter();

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer}
        onPress={() => router.push('/subscription')}
      >
        <View style={styles.compactIcon}>
          <Lock size={14} color={colors.primary} />
        </View>
        <Text style={styles.compactText}>{title}</Text>
        <Crown size={14} color={colors.accent} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Lock size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={() => router.push('/subscription')}
      >
        <Crown size={16} color={colors.textLight} />
        <Text style={styles.upgradeText}>Fazer Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

export function LockedOverlay({ children, isLocked, title, description }: { 
  children: React.ReactNode; 
  isLocked: boolean;
  title: string;
  description: string;
}) {
  const router = useRouter();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.blurredContent}>
        {children}
      </View>
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <View style={styles.overlayIcon}>
            <Lock size={24} color={colors.primary} />
          </View>
          <Text style={styles.overlayTitle}>{title}</Text>
          <Text style={styles.overlayDescription}>{description}</Text>
          <TouchableOpacity 
            style={styles.overlayButton}
            onPress={() => router.push('/subscription')}
          >
            <Crown size={16} color={colors.textLight} />
            <Text style={styles.overlayButtonText}>Ver Planos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  compactIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  overlayContainer: {
    position: 'relative',
  },
  blurredContent: {
    opacity: 0.3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background + 'E6',
  },
  overlayContent: {
    alignItems: 'center',
    padding: 24,
  },
  overlayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  overlayDescription: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  overlayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
});
