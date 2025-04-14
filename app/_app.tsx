import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
    return (
        <ClerkProvider
            signInUrl="/investmentplan"
            signUpUrl="/investmentplan"
            signInForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL}
            signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL}
            signUpForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
            signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL}
        >
            <Component {...pageProps} />
        </ClerkProvider>
    );
}

export default MyApp;