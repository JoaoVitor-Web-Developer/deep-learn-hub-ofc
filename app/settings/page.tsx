import SubscriptionButton from "@/components/SubscriptionButton";
import { checkSubscription } from "@/lib/subscription";
import React from "react";

type Props = {};

const SettingsPage = async (props: Props) => {
  const isPro = await checkSubscription();
  return (
    <div className="py-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">Configurações</h1>
      {isPro ? (
        <p className="text-xl text-secondary-foreground/60">
          Você é um usúario Pro!
        </p>
      ) : (
        <p className="text-xl text-secondary-foreground/60">
          Você é um usúario free
        </p>
      )}

      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default SettingsPage;
