# بنية المشروع

قالب React SPA مبني على **Vite + TypeScript**، مع **TanStack Query** لبيانات السيرفر و **React Router**
(data router) للتنقل، ومقسوم حسب الميزات (feature-based).
للتشغيل راجع [README.md](README.md)، والمعيار الكامل بـ `ngp-react`.

## الطبقات

| الطبقة      | المسؤولية                                                                             | تعتمد على                         |
| ----------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| `shared/`   | البنية التحتية المشتركة: عميل الـ API، الإعدادات، الترجمة، الستايل، UI kit، helpers   | —                                 |
| `features/` | الميزات: لكل ميزة hooks البيانات، الأنواع، schemas، المكوّنات والصفحات                | `shared` + `index.ts` لميزة تانية |
| `app/`      | تجميع التطبيق: الراوتر، الـ providers، الـ QueryClient، الحرّاس (guards) والـ layouts | `features` + `shared`             |

> الاعتماد باتجاه واحد: `app → features → shared`. `shared` ما بيستورد من `features` أبداً.
> الاستثناء الوحيد `app/router.tsx`: بيحمّل صفحات الميزات مباشرة بـ `import()` (lazy) لأنه نقطة تجميع
> التطبيق (composition root)، ولهيك الصفحات مش مُصدّرة من `index.ts` تبع الميزة.

## مسار الإقلاع

```text
main.tsx
 ├─ shared/styles/index.css        # Tailwind + التوكنز + خط Cairo
 ├─ shared/i18n                    # i18next: ar افتراضي، بيضبط <html lang dir>
 └─ <App />                        # app/App.tsx
     ├─ createQueryClient()        # retry، وأي 401 → clearSession
     ├─ createBrowserRouter(routes)
     └─ AppProviders → RouterProvider → RequireAuth / RequireGuest → الصفحة (lazy)
```

## تدفق البيانات

```text
Page ──▶ useXxx() (features/*/api.ts) ──▶ TanStack Query ──▶ api.get/post (shared/api/client.ts) ──▶ Laravel /api/v1
  ▲                                              │
  └──── data / isPending / error (ApiError) ◀────┘
```

- **Page:** بتقرأ الفلاتر من الـ URL، بتستدعي hook، وبتعرض حالات loading / error / empty / data.
- **`api.ts` تبع الميزة:** query keys (factory) + hooks `useQuery` / `useMutation`. المكوّنات ما بتستدعي `fetch` أبداً.
- **`client.ts`:** الوحيد اللي بيعرف الـ base URL والـ cookies (`credentials: 'include'`) و `X-XSRF-TOKEN`
  و `Accept-Language`. أي فشل بيتحوّل لـ `ApiError { status, message, code, errors }`.
- **الأخطاء:** `error.message` جاية مترجمة من الباك إند، بتنعرض متل ما هي. أخطاء 422 بتنحط تحت الحقول
  بـ `applyApiErrors` (عبر `setError`)، والباقي بينعرض فوق الفورم.
- **الجلسة (Sanctum SPA cookie):** `useLogin` بيجيب `/sanctum/csrf-cookie` وبعدين `POST /auth/login`.
  أي 401 بأي طلب → `clearSession` → الحارس بيرجّع المستخدم لـ `/login`، وبعد الدخول بيرجع للصفحة اللي كان فيها.
- **حالة الـ URL:** رقم الصفحة والبحث بالـ search params (`/items?page=2&search=tea`)، مش بـ `useState`.

## تقسيم المجلدات

```text
src/
├── main.tsx                  # نقطة الدخول
├── app/
│   ├── App.tsx               # QueryClient + Router + Providers
│   ├── router.tsx            # كل المسارات؛ كل صفحة lazy
│   ├── paths.ts              # المسارات المستخدمة بأكتر من مكان
│   ├── providers.tsx         # QueryClientProvider
│   ├── queryClient.ts        # سياسة الـ retry + معالجة 401
│   ├── guards/               # RequireAuth، RequireGuest
│   ├── layouts/              # AppLayout: الهيدر، اللغة، تسجيل الخروج
│   └── pages/                # NotFoundPage، RouteErrorPage
├── features/
│   ├── auth/
│   │   ├── api.ts            # authKeys، useMe، useLogin، useLogout، clearSession
│   │   ├── types.ts          # User (مكتوب يدوياً لحد ما يتولّد)
│   │   ├── schemas.ts        # schema فورم الدخول (zod)
│   │   ├── components/       # LoginForm
│   │   ├── pages/            # LoginPage + تيستاتها
│   │   └── index.ts          # الواجهة العامة للميزة
│   └── items/                # نفس الشكل: api، types، schemas (فلاتر الـ URL)، components، pages
├── shared/
│   ├── api/                  # client.ts (fetch + ApiError)، formErrors.ts، types.ts، schema.d.ts (مولّد)
│   ├── config.ts             # متغيّرات VITE_ متحقَّق منها بـ zod عند الإقلاع
│   ├── ui/                   # Button، TextField، Checkbox، Alert، Loading/Empty/ErrorState، Pagination...
│   ├── lib/                  # cn()، format (تواريخ بتوقيت دمشق، أرقام)
│   ├── hooks/                # useDocumentTitle
│   ├── i18n/                 # إعداد i18next + locales/ar.json، en.json
│   └── styles/               # index.css: Tailwind + التوكنز (@theme)
└── test/                     # إعداد Vitest + MSW، fixtures، handlers، renderApp
e2e/                          # Playwright (موبايل، ar)؛ الـ API ممثّل بـ page.route
scripts/lint-rtl.ts           # بيفشل على كلاسات الاتجاه الفيزيائية
```

## قواعد الكتابة

- **ملف لكل مكوّن:** `PascalCase.tsx` للمكوّنات، `useCamelCase.ts` للـ hooks، `camelCase.ts` للباقي. Named exports بس.
- **الاستيراد:** بالـ alias `@/` (`@/shared/ui`)، ومن ميزة تانية عبر `index.ts` تبعها بس.
- **البيانات:** كل طلب عبر hook بـ `api.ts` الميزة. بيانات السيرفر ما بتنتسخ لـ `useState`.
- **الفورمات:** react-hook-form + zod؛ النوع من الـ schema (`z.infer`)، والرسائل من `t` حتى تتبع اللغة.
- **الحالات:** كل شاشة بيانات بتعرض loading / error مع retry / empty من `shared/ui`.
- **RTL:** كلاسات منطقية بس (`ms-`، `pe-`، `start-`، `text-start`...). الأيقونات اللي إلها اتجاه بتاخد
  `rtl:rotate-180`. `npm run lint:rtl` بيمسك الغلط.
- **النصوص:** بـ `ar.json` و `en.json`؛ المفاتيح typed، والـ typecheck بيفشل إذا `en.json` ناقصه مفتاح.
- **الألوان:** من التوكنز (`bg-primary`، `text-muted`، `border-line`...)، ما في hex بالمكوّنات.
- **التواريخ:** بتوصل UTC من الـ API، وبتتحوّل لتوقيت دمشق بس للعرض (`formatDate`).
- **أنواع الـ API:** `schema.d.ts` مولّد بـ `npm run api:types`، لا تعدّله يدوياً.

## إضافة ميزة جديدة

1. أنشئ `src/features/<name>/` وفيه `types.ts` (re-export من `schema.d.ts`) و `api.ts` (keys + hooks).
2. لو في فورم: schema بـ `schemas.ts`، والمكوّن بـ `components/`، وأخطاء 422 بـ `applyApiErrors`.
3. الصفحة بـ `pages/<Name>Page.tsx`: بتجيب البيانات وبتعرض loading / error / empty / data.
4. أضف المسار بـ `app/router.tsx` بـ `lazy: async () => ({ Component: (await import(...)).<Name>Page })`،
   تحت `RequireAuth` لو بدها تسجيل دخول، وضيف الرابط لـ `paths.ts` لو انستخدم بأكتر من مكان.
5. النصوص بـ `ar.json` و `en.json`، والتيستات جنب الصفحة (`*.test.tsx`) مع handlers الـ MSW.
6. صدّر من `index.ts` بس اللي بتحتاجه ميزات تانية.
