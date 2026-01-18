import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useState } from 'react';
import { 
  Leaf, 
  PlusCircle, 
  FolderOpen, 
  FileText, 
  CheckCircle2, 
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: Leaf,
    iconColor: colors.primary,
    title: 'Bem-vindo ao Agrofinance!',
    description: 'Gerencie todos os custos operacionais da sua propriedade rural de forma simples e organizada.',
    tips: [
      'Controle gastos por setor e operação',
      'Acompanhe pagamentos e vencimentos',
      'Gere relatórios detalhados'
    ]
  },
  {
    icon: FolderOpen,
    iconColor: colors.info,
    title: '1. Crie Setores',
    description: 'Setores representam as áreas ou divisões da sua fazenda.',
    tips: [
      'Ex: Talhão Norte, Área de Pastagem, Pomar',
      'Cada setor pode ter múltiplas operações',
      'Vá em Config > Setores > + para criar'
    ]
  },
  {
    icon: Settings,
    iconColor: colors.accent,
    title: '2. Cadastre Operações',
    description: 'Operações são as atividades realizadas nos setores.',
    tips: [
      'Ex: Preparo de Solo, Plantio, Colheita',
      'Vincule operações aos setores',
      'Vá em Config > Operações > + para criar'
    ]
  },
  {
    icon: PlusCircle,
    iconColor: colors.success,
    title: '3. Adicione Lançamentos',
    description: 'Registre cada gasto ou despesa da fazenda.',
    tips: [
      'Informe fornecedor, valor e data',
      'Selecione a operação relacionada',
      'Clique no + na tela inicial'
    ]
  },
  {
    icon: CheckCircle2,
    iconColor: colors.warning,
    title: '4. Verifique Notas',
    description: 'Confira se os valores das notas fiscais batem com o combinado.',
    tips: [
      'Compare valor combinado x valor da nota',
      'Identifique divergências facilmente',
      'Marque como pago quando quitar'
    ]
  },
  {
    icon: BarChart3,
    iconColor: colors.primary,
    title: '5. Acompanhe Relatórios',
    description: 'Visualize gastos por período, setor e operação.',
    tips: [
      'Veja totais mensais e comparativos',
      'Identifique onde está gastando mais',
      'Tome decisões baseadas em dados'
    ]
  }
];

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <X size={20} color={colors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.iconContainer, { backgroundColor: step.iconColor + '15' }]}>
            <IconComponent size={48} color={step.iconColor} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.tipsContainer}>
            {step.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: step.iconColor }]} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {tutorialSteps.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot,
                  index === currentStep && styles.paginationDotActive,
                  index === currentStep && { backgroundColor: step.iconColor }
                ]} 
              />
            ))}
          </View>

          <View style={styles.navigation}>
            {!isFirstStep ? (
              <TouchableOpacity style={styles.navButtonSecondary} onPress={handlePrevious}>
                <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={styles.navButtonSecondaryText}>Voltar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}

            <TouchableOpacity 
              style={[styles.navButtonPrimary, { backgroundColor: step.iconColor }]} 
              onPress={handleNext}
            >
              <Text style={styles.navButtonPrimaryText}>
                {isLastStep ? 'Começar' : 'Próximo'}
              </Text>
              {!isLastStep && <ChevronRight size={18} color={colors.textLight} strokeWidth={1.5} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    maxHeight: height * 0.5,
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    width: 24,
    borderRadius: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButtonPlaceholder: {
    width: 100,
  },
  navButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonSecondaryText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  navButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  navButtonPrimaryText: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
  },
});
