import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt";

export async function searchYoutube(searchQuery: string) {
  //
  searchQuery = encodeURIComponent(searchQuery);
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  );
  if (!data) {
    console.log("Youtube falhou");
    return null;
  }
  if (data.items[0] == undefined) {
    console.log("Youtube falhou");
    return null;
  }
  return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "pt-br",
      country: "BR",
    });
    let transcript = "";
    for (let t of transcript_arr) {
      transcript += t.text + " ";
    }
    return transcript.replaceAll("\n", "");
  } catch (error) {
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };
  const questions: Question[] = await strict_output(
    "Você é um IA útil que é capaz de gerar perguntas e respostas MCQ, o comprimento de cada resposta não deve ser superior a 15 palavras",
    new Array(5).fill(
      `Você deve gerar uma pergunta MCQ difícil aleatória sobre ${course_title} com o contexto da seguinte transcrição: ${transcript}`
    ),
    {
      question: "question",
      answer: "resposta com comprimento máximo de 15 palavras",
      option1: "option1 com comprimento maximo de 15 palavras",
      option2: "option2 com comprimento maximo de 15 palavras",
      option3: "option3 com comprimento maximo de 15 palavras",
    }
  );
  return questions;
}
