/** URL paths used in more than one place. */
export const paths = {
  login: '/login',
  items: '/items',
} as const;

/** Where users land after logging in and when they open "/". */
export const homePath = paths.items;
