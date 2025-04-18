import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ClerkProvider
            signInUrl="/dashboard"
            signUpUrl="/dashboard"
        >
            <Component {...pageProps} />
        </ClerkProvider>
    );
}

export default MyApp;