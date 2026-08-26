import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import {
  buildQuotationHtml,
  computeTotals,
  QuoteLine,
  QuoteMeta,
} from '../utils/quotationHtml';

const newLine = (): QuoteLine => ({
  id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  service: '',
  description: '',
  qty: '1',
  rate: '',
});

const money = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function QuotationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [meta, setMeta] = useState<QuoteMeta>({
    quoteNo: `QT-${Date.now().toString().slice(-6)}`,
    clientName: '',
    clientPhone: '',
    notes: '',
    taxPercent: '18',
    validityDays: '15',
  });

  const [lines, setLines] = useState<QuoteLine[]>([newLine()]);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const { subtotal, tax, total } = computeTotals(lines, meta.taxPercent);

  const setMetaField = (k: keyof QuoteMeta, v: string) =>
    setMeta((p) => ({ ...p, [k]: v }));

  const setLineField = (id: string, k: keyof QuoteLine, v: string) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, [k]: v } : l)));

  const addLine = () => setLines((p) => [...p, newLine()]);

  const removeLine = (id: string) =>
    setLines((p) => (p.length === 1 ? p : p.filter((l) => l.id !== id)));

  const isReady =
    meta.clientName.trim().length > 1 &&
    lines.some((l) => l.service.trim() && parseFloat(l.rate) > 0);

  /* Read the company logo as base64 so it embeds in the PDF */
  const getLogoBase64 = async (): Promise<string | null> => {
    if (!profile.companyLogoUri) return null;
    try {
      return await FileSystem.readAsStringAsync(profile.companyLogoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch {
      return null;
    }
  };

  /* expo-print writes the PDF to cache and returns its uri — we share that
     directly. No file move needed, which keeps us off the deprecated API. */
    const generatePdf = async () => {
    const logo = await getLogoBase64();
    const html = buildQuotationHtml(profile, meta, lines, logo);

    const { base64 } = await Print.printToFileAsync({ html, base64: true });

    const dest = `${FileSystem.cacheDirectory}${meta.quoteNo}.pdf`;
    await FileSystem.writeAsStringAsync(dest, base64 as string, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return dest;
  };

  const handleShare = async () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Add a client name and at least one service with a rate.'
      );
      return;
    }

    setBusy(true);
    try {
      const uri = await generatePdf();
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Not available', 'Sharing is not supported on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Quotation ${meta.quoteNo}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      console.log('Quotation share failed:', e);
      Alert.alert('Something went wrong', 'Could not generate the quotation.');
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Add a client name and at least one service with a rate.'
      );
      return;
    }

    // WhatsApp can't attach a file via deep link — send the summary,
    // then use Generate & Share for the PDF itself
    const text =
      `*Quotation ${meta.quoteNo}*\n` +
      `From: ${profile.companyName || profile.name || 'Lasan Mart'}\n\n` +
      lines
        .filter((l) => l.service.trim())
        .map(
          (l) =>
            `• ${l.service} — ${l.qty || 1} × ${money(parseFloat(l.rate) || 0)}`
        )
        .join('\n') +
      `\n\nTotal: *${money(total)}*` +
      (meta.notes ? `\n\n${meta.notes}` : '');

    const phone = meta.clientPhone.replace(/[^0-9]/g, '');
    const url = phone
      ? `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(text)}`
      : `whatsapp://send?text=${encodeURIComponent(text)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('WhatsApp not found', 'Install WhatsApp to send directly.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open WhatsApp', 'Try the share button instead.');
    }
  };

  const handlePreview = async () => {
    if (!isReady) {
      Alert.alert(
        'Almost there',
        'Add a client name and at least one service with a rate.'
      );
      return;
    }
    setBusy(true);
    try {
      const logo = await getLogoBase64();
      const html = buildQuotationHtml(profile, meta, lines, logo);
      await Print.printAsync({ html });
    } catch (e) {
      console.log('Quotation preview failed:', e);
      Alert.alert('Preview failed', 'Could not open the preview.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.textDark}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Quotation</Text>

          <TouchableOpacity style={styles.backButton} onPress={handlePreview}>
            <MaterialCommunityIcons
              name="file-eye-outline"
              size={20}
              color={colors.textDark}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Company strip */}
          <View style={styles.coStrip}>
            <MaterialCommunityIcons
              name={
                profile.companyLogoUri
                  ? 'image-check-outline'
                  : 'alert-circle-outline'
              }
              size={17}
              color={profile.companyLogoUri ? '#12B3A0' : '#E8AE00'}
            />
            <Text style={styles.coText}>
              {profile.companyLogoUri
                ? `${profile.companyName || 'Your company'} · logo will appear as watermark`
                : 'Add a company logo in My Account for a branded watermark'}
            </Text>
          </View>

          {/* Quote number */}
          <View style={styles.quoteNoRow}>
            <MaterialCommunityIcons
              name="pound"
              size={15}
              color={colors.textLight}
            />
            <Text style={styles.quoteNoText}>{meta.quoteNo}</Text>
          </View>

          {/* Client */}
          <Text style={styles.groupTitle}>Client Details</Text>

          <Field
            id="clientName"
            label="Client Name"
            icon="account-outline"
            value={meta.clientName}
            onChangeText={(v: string) => setMetaField('clientName', v)}
            placeholder="e.g. Sri Lakshmi Traders"
            focused={focused}
            setFocused={setFocused}
          />

          <Field
            id="clientPhone"
            label="Client Phone"
            icon="phone-outline"
            value={meta.clientPhone}
            onChangeText={(v: string) =>
              setMetaField('clientPhone', v.replace(/[^0-9]/g, ''))
            }
            placeholder="9876543210"
            keyboardType="number-pad"
            maxLength={10}
            focused={focused}
            setFocused={setFocused}
          />

          {/* Line items */}
          <View style={styles.groupRow}>
            <Text style={styles.groupTitle}>Services</Text>
            <Text style={styles.groupCount}>
              {lines.length} item{lines.length > 1 ? 's' : ''}
            </Text>
          </View>

          {lines.map((line, i) => {
            const amount =
              (parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0);
            return (
              <View key={line.id} style={styles.lineCard}>
                <View style={styles.lineTop}>
                  <View style={styles.lineNum}>
                    <Text style={styles.lineNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.lineAmount}>{money(amount)}</Text>
                  {lines.length > 1 && (
                    <TouchableOpacity onPress={() => removeLine(line.id)}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={19}
                        color={colors.border}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.lineInput}
                  placeholder="Service name (e.g. Social Media Marketing)"
                  placeholderTextColor={colors.textLight}
                  value={line.service}
                  onChangeText={(v) => setLineField(line.id, 'service', v)}
                />

                <TextInput
                  style={[styles.lineInput, styles.lineDesc]}
                  placeholder="Short description (optional)"
                  placeholderTextColor={colors.textLight}
                  value={line.description}
                  onChangeText={(v) => setLineField(line.id, 'description', v)}
                  multiline
                />

                <View style={styles.lineRow}>
                  <View style={styles.lineHalf}>
                    <Text style={styles.miniLabel}>Qty</Text>
                    <TextInput
                      style={styles.miniInput}
                      keyboardType="number-pad"
                      value={line.qty}
                      onChangeText={(v) =>
                        setLineField(line.id, 'qty', v.replace(/[^0-9]/g, ''))
                      }
                    />
                  </View>
                  <View style={styles.lineHalf}>
                    <Text style={styles.miniLabel}>Rate (₹)</Text>
                    <TextInput
                      style={styles.miniInput}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textLight}
                      value={line.rate}
                      onChangeText={(v) =>
                        setLineField(line.id, 'rate', v.replace(/[^0-9.]/g, ''))
                      }
                    />
                  </View>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.addLine} onPress={addLine}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={17}
              color={colors.primary}
            />
            <Text style={styles.addLineText}>Add another service</Text>
          </TouchableOpacity>

          {/* Tax + validity */}
          <Text style={styles.groupTitle}>Terms</Text>

          <View style={styles.lineRow}>
            <View style={styles.lineHalf}>
              <Text style={styles.miniLabel}>Tax %</Text>
              <TextInput
                style={styles.miniInput}
                keyboardType="number-pad"
                value={meta.taxPercent}
                onChangeText={(v) =>
                  setMetaField('taxPercent', v.replace(/[^0-9.]/g, ''))
                }
              />
            </View>
            <View style={styles.lineHalf}>
              <Text style={styles.miniLabel}>Valid for (days)</Text>
              <TextInput
                style={styles.miniInput}
                keyboardType="number-pad"
                value={meta.validityDays}
                onChangeText={(v) =>
                  setMetaField('validityDays', v.replace(/[^0-9]/g, ''))
                }
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Notes / Terms</Text>
          <View style={[styles.fieldBox, styles.fieldBoxMultiline]}>
            <TextInput
              style={[styles.fieldInput, { height: '100%' }]}
              placeholder="Payment terms, delivery timeline, anything else…"
              placeholderTextColor={colors.textLight}
              multiline
              textAlignVertical="top"
              value={meta.notes}
              onChangeText={(v) => setMetaField('notes', v)}
            />
          </View>

          {/* Totals */}
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Tax ({meta.taxPercent || 0}%)
              </Text>
              <Text style={styles.totalValue}>{money(tax)}</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{money(total)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: 14 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.waButton, !isReady && styles.disabled]}
            activeOpacity={0.9}
            onPress={handleWhatsApp}
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, !isReady && styles.disabled]}
            activeOpacity={0.9}
            onPress={handleShare}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.shareText}>Generate & Share PDF</Text>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={17}
                  color={colors.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ id, label, icon, focused, setFocused, ...inputProps }: any) {
  const active = focused === id;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, active && styles.fieldBoxActive]}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={active ? colors.primary : colors.textLight}
          />
        )}
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={colors.textLight}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.textDark,
    letterSpacing: -0.3,
  },

  content: { padding: 16, paddingBottom: 24 },

  coStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  coText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textLight,
  },

  quoteNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
  quoteNoText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textLight,
  },

  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  groupCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
    marginTop: 24,
  },

  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 7,
    marginTop: 10,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldBoxMultiline: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 13,
  },
  fieldBoxActive: { borderColor: colors.primary, backgroundColor: colors.white },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    padding: 0,
  },

  lineCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  lineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  lineNum: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineNumText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.primary,
  },
  lineAmount: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  lineInput: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  lineDesc: { minHeight: 54, textAlignVertical: 'top' },
  lineRow: { flexDirection: 'row', gap: 10 },
  lineHalf: { flex: 1 },
  miniLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    color: colors.textLight,
    marginBottom: 5,
  },
  miniInput: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  addLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 2,
  },
  addLineText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },

  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textLight,
  },
  totalValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: colors.textDark,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.textDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 10,
  },
  grandLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
  },
  grandValue: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.white,
    letterSpacing: -0.6,
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  waButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 54,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  shareText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
  disabled: { opacity: 0.45 },
});