import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, Star, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { subscriptionPlans } from '@/mocks/data';

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Zap size={32} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Potencialize sua Gestão</Text>
          <Text style={styles.heroSubtitle}>
            Escolha o plano ideal para sua fazenda
          </Text>
        </View>

        {subscriptionPlans.map((plan, index) => (
          <View 
            key={plan.id} 
            style={[
              styles.planCard,
              plan.isPopular && styles.planCardPopular,
            ]}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Star size={12} color={colors.textLight} />
                <Text style={styles.popularText}>Mais Popular</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.planPricing}>
                <Text style={styles.planCurrency}>R$</Text>
                <Text style={styles.planPrice}>
                  {plan.price.toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.planPeriod}>/mês</Text>
              </View>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <View style={[
                    styles.checkIcon,
                    plan.isPopular && styles.checkIconPopular
                  ]}>
                    <Check size={14} color={plan.isPopular ? colors.primary : colors.success} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.planButton,
                plan.isPopular && styles.planButtonPopular,
              ]}
            >
              <Text style={[
                styles.planButtonText,
                plan.isPopular && styles.planButtonTextPopular,
              ]}>
                {plan.id === 'starter' ? 'Começar Grátis' : 'Assinar Agora'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Dúvidas frequentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Posso cancelar a qualquer momento?</Text>
            <Text style={styles.faqAnswer}>
              Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Como funciona o período de teste?</Text>
            <Text style={styles.faqAnswer}>
              Oferecemos 14 dias de teste gratuito em todos os planos pagos. Você pode testar todas as funcionalidades antes de decidir.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Posso mudar de plano depois?</Text>
            <Text style={styles.faqAnswer}>
              Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será ajustado proporcionalmente.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  planCardPopular: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  planCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginHorizontal: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIconPopular: {
    backgroundColor: colors.primary + '20',
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  planButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planButtonPopular: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  planButtonTextPopular: {
    color: colors.textLight,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
