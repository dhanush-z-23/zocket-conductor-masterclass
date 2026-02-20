import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, backgroundPrompt } = body;

    if (!image || !backgroundPrompt) {
      return NextResponse.json(
        { error: 'Image and background prompt are required' },
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

    // Step 1: Remove background
    const bgRemoveResponse = await fetch(
      'https://api.replicate.com/v1/models/lucataco/remove-bg/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: { image } }),
      }
    );

    if (!bgRemoveResponse.ok) {
      return NextResponse.json(
        { error: 'Background removal step failed' },
        { status: 500 }
      );
    }

    let bgRemoveResult = await bgRemoveResponse.json();
    let attempts = 0;

    while (bgRemoveResult.status !== 'succeeded' && bgRemoveResult.status !== 'failed' && attempts < 60) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${bgRemoveResult.id}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      bgRemoveResult = await pollResponse.json();
      attempts++;
    }

    if (bgRemoveResult.status !== 'succeeded') {
      return NextResponse.json({ error: 'Background removal timed out' }, { status: 500 });
    }

    const foregroundUrl = typeof bgRemoveResult.output === 'string'
      ? bgRemoveResult.output
      : bgRemoveResult.output[0];

    // Step 2: Generate new background
    const bgGenResponse = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: backgroundPrompt,
            width: 512,
            height: 512,
            num_outputs: 1,
          },
        }),
      }
    );

    if (!bgGenResponse.ok) {
      return NextResponse.json(
        { error: 'Background generation step failed' },
        { status: 500 }
      );
    }

    let bgGenResult = await bgGenResponse.json();
    attempts = 0;

    while (bgGenResult.status !== 'succeeded' && bgGenResult.status !== 'failed' && attempts < 60) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${bgGenResult.id}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      bgGenResult = await pollResponse.json();
      attempts++;
    }

    if (bgGenResult.status !== 'succeeded') {
      return NextResponse.json({ error: 'Background generation timed out' }, { status: 500 });
    }

    const backgroundUrl = Array.isArray(bgGenResult.output)
      ? bgGenResult.output[0]
      : bgGenResult.output;

    // Return both URLs for client-side compositing
    return NextResponse.json({
      foregroundUrl,
      backgroundUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
