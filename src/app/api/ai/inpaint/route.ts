import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mask, prompt, strength = 0.75 } = body;

    if (!image || !mask || !prompt) {
      return NextResponse.json(
        { error: 'Image, mask, and prompt are required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'AI service not configured. Set REPLICATE_API_TOKEN in .env.local' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.replicate.com/v1/models/stability-ai/stable-diffusion-inpainting/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt,
            image,
            mask,
            prompt_strength: strength,
            num_outputs: 1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Replicate API error: ${errorData}` },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    let result = prediction;
    const maxAttempts = 120;
    let attempts = 0;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      return NextResponse.json({ imageUrl });
    }

    return NextResponse.json(
      { error: 'Inpainting failed or timed out' },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
