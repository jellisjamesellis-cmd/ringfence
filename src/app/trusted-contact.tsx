import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
import { log, store, useApp } from '@/lib/store';
import { type as T, useTheme } from '@/lib/theme';

export default function TrustedContact() {
  const c = useTheme();
  const s = useApp();
  const [name, setName] = useState(s.trustedContact?.name ?? '');
  const [phone, setPhone] = useState(s.trustedContact?.phone ?? '');

  const input = {
    backgroundColor: c.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    color: c.ink,
  };

  const save = () => {
    store.set({ trustedContact: { name: name.trim(), phone: phone.trim() } });
    log(`Trusted contact set: ${name.trim()}`, 'ok');
    router.back();
  };

  const remove = () => {
    store.set({ trustedContact: null });
    log('Trusted contact removed', 'info');
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={[T.callout, { color: c.muted, lineHeight: 22 }]}>
          If your phone is taken, Ringfence alerts this person. Their name and number also show on the locked screen, so anyone who finds the phone can return it.
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={[T.caption, { color: c.muted }]}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Alex Morgan" placeholderTextColor={c.muted} style={input} />
        </View>
        <View style={{ gap: 8 }}>
          <Text style={[T.caption, { color: c.muted }]}>Mobile number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="07700 900123"
            placeholderTextColor={c.muted}
            keyboardType="phone-pad"
            style={input}
          />
        </View>
        <Button title="Save" onPress={save} disabled={!name.trim() || phone.trim().length < 6} />
        {s.trustedContact ? <Button title="Remove contact" variant="ghost" onPress={remove} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
