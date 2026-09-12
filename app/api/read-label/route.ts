import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { NextResponse } from "next/server"
import { z } from "zod/v4"
import { LabelReadSchema } from "@/lib/label-schema"

export const runtime = "nodejs"
export const maxDuration = 60

const BodySchema = z.object({
  image: z.string().min(100),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
})

const SYSTEM = `You read photos of medication and supplement packaging for a personal medication organiser used in Hong Kong. Labels may be in English, Traditional Chinese, or both, and may be a pharmacy dispensing sticker, a hospital label, a retail box, or a supplement bottle.

Extract only what is actually printed. Never invent a strength, dose or frequency: leave a field empty (or 0 / unknown) when it is not readable. Common abbreviations: od/qd = once daily, bd/bid = twice, tds/tid = three times, qid = four times, prn = as needed, nocte = at night, ac = before food, pc = after food. Chinese: 每日一次/兩次/三次 = 1/2/3 times daily, 飯前 = before food, 飯後 = after food, 空腹 = empty stomach, 需要時 = as needed, 睡前 = at bedtime.

If the photo is not a medication or supplement label, set confidence to low and explain in notes.`

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  const client = new Anthropic()
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: "low", format: zodOutputFormat(LabelReadSchema) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: body.mediaType, data: body.image } },
            { type: "text", text: "Read this label and fill in every field." },
          ],
        },
      ],
    })
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "refused" }, { status: 422 })
    }
    if (!response.parsed_output) {
      return NextResponse.json({ error: "unreadable" }, { status: 422 })
    }
    return NextResponse.json({ fields: response.parsed_output })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "busy" }, { status: 429 })
    }
    if (err instanceof Anthropic.APIError) {
      console.error("read-label API error", err.status, err.message)
      return NextResponse.json({ error: "upstream" }, { status: 502 })
    }
    console.error("read-label failed", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
