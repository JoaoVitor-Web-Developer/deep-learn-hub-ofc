import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const settingsUrl = process.env.NEXTAUTH_URL + "/settings";

export async function getServerSideProps() {
  try {
    const session = await getAuthSession({
      strategy: "jwt",
    });

    if (!session?.user) {
      return {
        props: {},
        redirect: {
          destination: "/gallery",
          permanent: false,
        },
      };
    }

    let stripeSession;

    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
    } else {
      stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: session.user.email ?? "",
        line_items: [
          {
            price_data: {
              currency: "BRL",
              product_data: {
                name: "Deep learn hub",
                description: "Geração de cursos ilimitados!",
              },
              unit_amount: 990,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: session.user.id,
        },
      });
    }

    return {
      props: {
        stripeSessionUrl: stripeSession.url,
      },
    };
  } catch (error) {
    console.log("[STRIPE ERROR]", error);
    
    return {
      props: {},
      redirect: {
        destination: "/error",
        permanent: false,
      },
    }; 
  }
}