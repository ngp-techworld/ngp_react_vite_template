import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, SearchInput } from '@/shared/ui';

type ItemsSearchFormProps = {
  search: string;
  onSearch: (search: string) => void;
};

export function ItemsSearchForm({ search, onSearch }: ItemsSearchFormProps) {
  const { t } = useTranslation();
  // `values` keeps the input in sync with the URL (back button, "clear search").
  const { register, handleSubmit } = useForm({ values: { search } });

  return (
    <form
      role="search"
      onSubmit={handleSubmit((values) => onSearch(values.search.trim()))}
      className="flex gap-2"
    >
      <SearchInput
        label={t('items.search.label')}
        placeholder={t('items.search.placeholder')}
        maxLength={100}
        {...register('search')}
      />
      <Button type="submit" variant="secondary">
        {t('items.search.submit')}
      </Button>
    </form>
  );
}
