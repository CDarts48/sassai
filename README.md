# Sassai

Sassai is a subscription-based Next.js application that generates personalized 7-day investment strategy plans. It integrates with Stripe for handling payments, Clerk for user authentication, and Neon (PostgreSQL) as its database. Investment plans are generated via an AI API, making it easy for users to receive tailored investment strategies.

## Features

- **Personalized Investment Plans:** Generate a 7-day plan with recommendations for Morning, Afternoon, and Evening sessions (plus alternative strategies when applicable).
- **Subscription Management:** Seamless subscription handling via Stripe and webhook integration.
- **Authentication:** Secure user management and authentication powered by Clerk.
- **AI-Powered Plans:** Uses proprietary AI to generate investment strategies.
- **Neon PostgreSQL:** Managed database hosted on Neon and integrated with Prisma.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- A Neon PostgreSQL database (set your connection string as `DATABASE_URL`)
- [Stripe Account](https://stripe.com) with your API keys
- [Clerk](https://clerk.dev) configured for authentication
- An OpenRouter API key for generating investment plans

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/sassai.git
   cd sassai
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Setup Environment Variables:**

   Create a `.env` file in the root directory and add the required variables:

   ```env
   DATABASE_URL=your_neon_database_url
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   OPEN_ROUTER_API_KEY=your_open_router_api_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Configure Prisma:**

   Run the following commands to apply migrations and generate the Prisma client:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Running the Application

1. **Start the Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

2. **Run the Stripe Listener:**

   In a separate terminal, run:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

   This command ensures that Stripe events are forwarded to your application's webhook endpoint.

## Deployment

Deploy your Next.js app on platforms like [Vercel](https://vercel.com). Ensure that you set up your environment variables on the deployment platform, and follow guidelines from the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Sassai.

## License

This project is licensed under the MIT License.