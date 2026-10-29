import { Redirect } from 'expo-router';

import { useApp } from '@/lib/store';

export default function Index() {
  const { hydrated, onboarded, ringPaired } = useApp();
  if (!hydrated) return null;
  if (onboarded) return <Redirect href="/home" />;
  return <Redirect href={ringPaired ? '/onboarding/apps' : '/onboarding'} />;
}
