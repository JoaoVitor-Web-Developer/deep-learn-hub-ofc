import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import React from "react";
import Link from "next/link";

type Props = {};

const GalleryPage: React.FC<Props> = async ({...authOptions}: Props) => {
  const session = await getAuthSession(authOptions);
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-6">
          Realize o login para verificar a galeria
        </h1>
      </div>
    );
  }

  const userCourses = await prisma.course.findMany({
    where: {
      createdBy: session.user.id,
    },
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });

  if (userCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-6">
          Comece a gerar cursos agora mesmo!
        </h1>
        <Link href="/create" className="m-6 h-10 w-40 flex items-center justify-center bg-slate-100 font-bold text-black rounded-md">
          Comece já!
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center">
        {userCourses.map((course) => (
          <GalleryCourseCard course={course} key={course.id} />
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;