// pages/api/stripe.ts

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const settingsUrl = process.env.NEXTAUTH_URL + "/settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getAuthSession(req);

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
    }

    return res.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE ERROR]", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
