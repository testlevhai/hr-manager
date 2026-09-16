import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/AuthContext';
import { APP_ROUTE } from '@/constants/appRoutes';
import { AUTH_SESSION_RESULT, GOOGLE_ID_TOKEN_PARAM } from '@/constants/authSession';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export const LoginScreen = () => {
  const router = useRouter();
  const { signInWithGoogle, signInAsDeveloper } = useAuth();

  const [email, setEmail] = useState(STRINGS.EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === AUTH_SESSION_RESULT.ERROR) {
      setError(STRINGS.GENERIC_ERROR);
      return;
    }

    if (response.type !== AUTH_SESSION_RESULT.SUCCESS) {
      return;
    }

    const idToken = response.params[GOOGLE_ID_TOKEN_PARAM];
    if (!idToken) {
      setError(STRINGS.GENERIC_ERROR);
      return;
    }

    let isActive = true;

    const completeGoogleSignIn = async () => {
      setIsSubmitting(true);
      setError(null);
      try {
        await signInWithGoogle(idToken);
        if (isActive) {
          router.replace(APP_ROUTE.EMPLOYEES);
        }
      } catch (caught) {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
        }
      } finally {
        if (isActive) {
          setIsSubmitting(false);
        }
      }
    };

    completeGoogleSignIn();

    return () => {
      isActive = false;
    };
  }, [response, signInWithGoogle, router]);

  const handleGooglePress = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError(STRINGS.SIGN_IN_GOOGLE_UNAVAILABLE);
      return;
    }

    setError(null);
    await promptAsync();
  };

  const handleDeveloperPress = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(STRINGS.SIGN_IN_DEV_EMAIL_REQUIRED);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await signInAsDeveloper(trimmedEmail);
      router.replace(APP_ROUTE.EMPLOYEES);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGoogleDisabled = !request || isSubmitting;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: 'padding' })}>
      <View style={styles.content}>
        <Text style={styles.title}>{STRINGS.SIGN_IN_TITLE}</Text>
        <Text style={styles.subtitle}>{STRINGS.SIGN_IN_SUBTITLE}</Text>

        <Pressable
          style={[styles.primaryButton, isGoogleDisabled && styles.buttonDisabled]}
          onPress={handleGooglePress}
          disabled={isGoogleDisabled}
        >
          <Text style={styles.primaryButtonLabel}>{STRINGS.SIGN_IN_WITH_GOOGLE}</Text>
        </Pressable>

        <View style={styles.divider} />

        <Text style={styles.devHeading}>{STRINGS.SIGN_IN_DEV_HEADING}</Text>
        <Text style={styles.devHint}>{STRINGS.SIGN_IN_DEV_HINT}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={STRINGS.SIGN_IN_DEV_EMAIL_PLACEHOLDER}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isSubmitting}
        />

        <Pressable
          style={[styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleDeveloperPress}
          disabled={isSubmitting}
        >
          <Text style={styles.secondaryButtonLabel}>{STRINGS.SIGN_IN_DEV_BUTTON}</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  devHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  devHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
