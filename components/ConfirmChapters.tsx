"use client";
import { Chapter, Course, Unit } from "@prisma/client";
import React from "react";
import ChapterCard, { ChapterCardHandler } from "./ChapterCard";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
  course.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      chapterRefs[chapter.id] = React.useRef(null);
    });
  });
  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(
    new Set()
  );

  const totalChapterCount = React.useMemo(() => {
    return course.units.reduce((acc, unit) => {
      return acc + unit.chapters.length;
    }, 0);
  }, [course.units]);

  return (
    <div className="w-full mt-4">
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-5">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Subtópico {unitIndex + 1}
            </h2>
            <h3 className="text-2xl font-bold">{unit.name}</h3>
            <div className="mt-3">
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    completedChapters={completedChapters}
                    setCompletedChapters={setCompletedChapters}
                    ref={chapterRefs[chapter.id]}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center mt-4">
        <Separator className="flex-[1]" />
        <div className="flex items-center mx-4">
          <Link
            href="/create"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={4} />
            Voltar
          </Link>
          {totalChapterCount === completedChapters.size ? (
            <Link
              href={`/course/${course.id}/0/0`}
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
            >
              Salvar & Continuar
              <ChevronRight className="ml-4 font-semibold" />
            </Link>
          ) : (
            <Button
              type="button"
              className="ml-4 font-semibold"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                Object.values(chapterRefs).forEach((ref) => {
                  ref.current?.triggerLoad();
                });
              }}
            >
              Gerar
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={5} />
            </Button>
          )}
        </div>
        <Separator className="flex-[1]" />
      </div>
    </div>
  );
};

export default ConfirmChapters;
