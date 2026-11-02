import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { currentLanguage, type Language } from '@/shared/i18n';
import { Button } from './Button';

/** Toggles between Arabic and English. With a third language, replace it with a menu. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const otherLanguage: Language = currentLanguage() === 'ar' ? 'en' : 'ar';

  return (
    <Button
      variant="ghost"
      size="sm"
      title={t('language.label')}
      onClick={() => void i18n.changeLanguage(otherLanguage)}
    >
      <Languages aria-hidden className="size-4" />
      <span lang={otherLanguage}>{t(`language.${otherLanguage}`)}</span>
    </Button>
  );
}
