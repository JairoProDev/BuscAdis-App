# BuscAdis Frontend Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [State Management](#state-management)
4. [Components](#components)
5. [Routing](#routing)
6. [API Integration](#api-integration)
7. [Development Guide](#development-guide)

## Architecture Overview

The BuscAdis frontend is built with Next.js 14 using the App Router architecture. It follows a component-based architecture with a focus on reusability and performance.

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/ui**: Reusable component system
- **Zustand**: State management
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Axios**: HTTP client

## Project Structure

```
src/
├── app/              # App Router pages
│   ├── (auth)/      # Authentication routes
│   ├── (main)/      # Main application routes
│   └── api/         # API routes
├── components/       # React components
│   ├── ui/          # UI components
│   ├── forms/       # Form components
│   ├── layout/      # Layout components
│   └── shared/      # Shared components
├── lib/             # Utilities and configurations
│   ├── api/         # API client
│   ├── hooks/       # Custom hooks
│   ├── store/       # Zustand stores
│   └── utils/       # Helper functions
├── styles/          # Global styles
└── types/           # TypeScript types
```

## State Management

### Zustand Stores

```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    const response = await api.auth.login(credentials);
    set({ user: response.user, token: response.token });
  },
  logout: () => set({ user: null, token: null }),
}));
```

### React Query Usage

```typescript
// API Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getTree(),
  });
};

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search.query(query),
    enabled: !!query,
  });
};
```

## Components

### Component Architecture

```typescript
// Base Component Pattern
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

### Form Handling

```typescript
// Form Component Pattern
interface LoginFormProps {
  onSubmit: (data: LoginDto) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
      </form>
    </Form>
  );
};
```

## Routing

### App Router Structure

```typescript
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

// app/(main)/categories/[slug]/page.tsx
export default function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return (
    <MainLayout>
      <CategoryView slug={slug} />
    </MainLayout>
  );
}
```

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
export const api = {
  auth: {
    login: (credentials: LoginDto) =>
      axios.post('/api/auth/login', credentials),
    register: (data: RegisterDto) =>
      axios.post('/api/auth/register', data),
  },
  categories: {
    getTree: () => axios.get('/api/categories/tree'),
    search: (query: string) =>
      axios.get(`/api/categories/search?query=${query}`),
  },
  // More endpoints
};
```

## Development Guide

### Prerequisites
- Node.js v20+
- npm v10+

### Environment Setup
1. Copy environment file:
```bash
cp .env.example .env.local
```

2. Configure variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
```

### Development Workflow

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm run start
```

### Testing
```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Performance Optimization

1. **Image Optimization**
```typescript
import { Image } from 'next/image';

export const ProductImage = ({ src, alt }: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={300}
    height={300}
    loading="lazy"
    placeholder="blur"
  />
);
```

2. **Code Splitting**
```typescript
const DynamicComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

3. **Memoization**
```typescript
const MemoizedComponent = memo(({ data }: Props) => (
  <div>{/* Complex rendering */}</div>
));
```

### Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

3. Or deploy to Vercel:
```bash
vercel deploy
``` 