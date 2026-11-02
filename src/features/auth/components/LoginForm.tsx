import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { applyApiErrors } from '@/shared/api';
import { Alert, Button, Checkbox, TextField } from '@/shared/ui';
import { useLogin } from '../api';
import { createLoginSchema } from '../schemas';

export function LoginForm() {
  const { t } = useTranslation();
  const login = useLogin();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  // On success the guard on /login sees the user and redirects; nothing to do here.
  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onError: (error) => {
        const isMapped = applyApiErrors(error, setError, ['email', 'password']);
        if (!isMapped) {
          setError('root.server', { message: error.message });
        }
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errors.root?.server?.message && <Alert>{errors.root.server.message}</Alert>}
      <TextField
        label={t('auth.login.email')}
        type="email"
        autoComplete="username"
        dir="ltr"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label={t('auth.login.password')}
        type="password"
        autoComplete="current-password"
        dir="ltr"
        error={errors.password?.message}
        {...register('password')}
      />
      <Checkbox label={t('auth.login.remember')} {...register('remember')} />
      <Button type="submit" isLoading={login.isPending} className="mt-2">
        {t('auth.login.submit')}
      </Button>
    </form>
  );
}
