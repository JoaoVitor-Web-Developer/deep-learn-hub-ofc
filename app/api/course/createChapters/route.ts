// /api/course/createChapters

import { NextResponse } from "next/server";
import { createChaptersSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Sem autorização", { status: 401 });
    }
    const isPro = await checkSubscription();
    if (session.user.credits <= 0 && !isPro) {
      return new NextResponse("Sem creditos", { status: 402 });
    }
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);

    const userCourses = await prisma.course.findMany({
      where: {
        createdBy: session.user.id,
      },
    });

    type outputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];

    let output_units: outputUnits = await strict_output(
      "Você é uma IA capaz de fazer a curadoria do conteúdo do curso, criar títulos de capítulos relevantes e encontrar vídeos relevantes do YouTube para cada capítulo",
      new Array(units.length).fill(
        `É sua função criar um curso sobre ${title}. O usuário solicitou a criação de capítulos para cada uma das unidades. Em seguida, para cada capítulo, forneça uma consulta de pesquisa detalhada no YouTube que pode ser usada para encontrar um vídeo educacional informativo para cada capítulo. Cada consulta deve fornecer um curso educativo informativo no youtube.`
      ),
      {
        title: "Título do subtópico",
        chapters:
          "Uma série de capítulos, cada capítulo deve ter uma chave youtube_search_query e uma chave chapter_title no objeto JSON",
      }
    );

    const imageSearchTerm = await strict_output(
      "Você é uma IA capaz de encontrar a imagem mais relevante para um curso",
      `Forneça um bom termo de pesquisa de imagens para o título de um curso sobre ${title}. Este termo de pesquisa será inserido na API unsplash, portanto, certifique-se de que seja um bom termo de pesquisa que retornará bons resultados`,
      {
        image_search_term: "Um bom termo de pesquisa para o título do curso",
      }
    );

    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );
    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
        createdBy: session.user.id,
      },
    });

    for (const unit of output_units) {
      const title = unit.title;
      const prismaUnit = await prisma.unit.create({
        data: {
          name: title,
          courseId: course.id,
        },
      });
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ course_id: course.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("invalid body", { status: 400 });
    } else {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
}
