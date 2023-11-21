import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const settingsUrl = process.env.NEXTAUTH_URL + "/settings";

<<<<<<< HEAD
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
                name: "Learning Journey Pro",
                description: "unlimited course generation!",
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
=======
export async function GET() {
 try {
  const session = await getAuthSession();
  if (!session?.user) {
    return new NextResponse("Sem autorização", { status: 401 });
  }

  const userSubscription = await prisma.userSubscription.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  let stripeSession;
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
              name: "Deep Learn Hub",
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
>>>>>>> a406c21662981c256651f045f250d50c3d8466f9
  }

  return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
 } catch (error) {
  console.log("[STRIPE ERROR]", error);
  return new NextResponse("internal server error", { status: 500 });
 }
}
