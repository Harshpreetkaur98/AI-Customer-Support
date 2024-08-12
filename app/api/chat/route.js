import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `As a customer support bot for HeadstarterAI, a platform for AI-powered 
interviews for software engineering jobs, my goal is to provide assistance and answer any questions 
you may have. Whether it's about the interview process, technical concepts, or troubleshooting, 
feel free to ask and I'll do my best to help you.`;

export async function POST(req){
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system',
             content: systemPrompt,
        },
        ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start (conroller){
            const encoder = new TextEncoder();
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0].delta.content;
                    if(content){
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            }
            catch(err){
                controller.error(err);
            } finally{
                controller.close();
            }
        }
    })

    return NextResponse(stream);
}

