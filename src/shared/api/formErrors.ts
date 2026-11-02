import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './client';

/**
 * Puts the API's 422 field errors under the matching form fields with `setError`.
 * Returns `false` when nothing was mapped: the caller then shows `error.message` for the whole form.
 */
export function applyApiErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  fields: readonly Path<TValues>[],
): boolean {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return false;
  }

  let hasMappedError = false;
  for (const [key, messages] of Object.entries(error.errors)) {
    const field = fields.find((name) => name === key);
    const message = messages[0];
    if (field !== undefined && message !== undefined) {
      // Focus the first field with an error, like client-side validation does.
      setError(field, { type: 'server', message }, { shouldFocus: !hasMappedError });
      hasMappedError = true;
    }
  }
  return hasMappedError;
}
