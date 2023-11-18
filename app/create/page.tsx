import CreateCourseForm from "@/components/CreateCourseForm";
import { getAuthSession } from "@/lib/auth";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const CreatePage = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }

  return (
    <div className="flex flex-col items-start max-w-xl px8 mx-auto m-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Learn Hub
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div>
          Insira o título do curso ou o que você deseja aprender. Em seguida,
          insira uma lista de unidades, que são as especificidades que você
          deseja aprender. E nossa IA irá gerar um curso para você!
        </div>
      </div>
      <CreateCourseForm />
    </div>
  );
};

export default CreatePage;
