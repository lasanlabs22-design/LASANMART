import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { businessSectors, BusinessSector } from '../data/businessSectors';

type Props = {
  value: BusinessSector | null;
  onChange: (sector: BusinessSector) => void;
};

/**
 * Every business sector in a field-style dropdown. Picking one closes
 * the list; "Other" is just another option — the screen decides what
 * to do with it (usually a type-your-own box underneath).
 */
export default function SectorDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.field, open && styles.fieldActive]}
        activeOpacity={0.85}
        onPress={() => setOpen(!open)}
      >
        <MaterialCommunityIcons
          name={(value?.icon ?? 'tag-outline') as any}
          size={18}
          color={open || value ? colors.primary : colors.textLight}
        />
        <Text
          style={[styles.value, !value && styles.placeholder]}
          numberOfLines={1}
        >
          {value?.label ?? 'Select your business sector'}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textLight}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          {/* Scrolls inside the page so the whole list fits */}
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {businessSectors.map((s, i) => {
              const active = value?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.option,
                    i > 0 && styles.optionDivider,
                    active && styles.optionActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setOpen(false);
                    onChange(s);
                  }}
                >
                  <MaterialCommunityIcons
                    name={s.icon as any}
                    size={18}
                    color={active ? colors.primary : colors.textLight}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                  {active && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 54,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.white },
  value: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
  },
  placeholder: { color: colors.textLight },
  menu: {
    // About six rows show at once; the rest scroll
    maxHeight: 290,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  optionActive: { backgroundColor: colors.surface },
  optionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
  },
  optionTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
});
