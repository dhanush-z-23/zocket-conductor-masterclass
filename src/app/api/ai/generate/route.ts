import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, width = 512, height = 512 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'AI service not configured. Set REPLICATE_API_TOKEN in .env.local' },
        { status: 500 }
      );
    }

    // Use the model-based predictions endpoint (no version hash needed)
    const createResponse = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt,
            width,
            height,
            num_outputs: 1,
            go_fast: true,
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Replicate API error:', createResponse.status, errorText);
      return NextResponse.json(
        { error: `Replicate API error (${createResponse.status}): ${errorText}` },
        { status: createResponse.status }
      );
    }

    const prediction = await createResponse.json();

    // If the Prefer: wait header worked, the prediction may already be complete
    if (prediction.status === 'succeeded' && prediction.output) {
      const imageUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      // Proxy the image to avoid CORS issues on the canvas
      const base64 = await fetchImageAsBase64(imageUrl);
      if (base64) {
        return NextResponse.json({ imageBase64: base64 });
      }
      return NextResponse.json({ imageUrl });
    }

    // Otherwise, poll for completion
    return await pollPrediction(prediction, apiToken);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function pollPrediction(
  prediction: { id: string; status: string; output?: string[] | string },
  apiToken: string
) {
  let result = prediction;
  const maxAttempts = 60;
  let attempts = 0;

  while (
    result.status !== 'succeeded' &&
    result.status !== 'failed' &&
    result.status !== 'canceled' &&
    attempts < maxAttempts
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${result.id}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );

    if (!pollResponse.ok) {
      console.error('Poll error:', pollResponse.status);
      return NextResponse.json(
        { error: `Failed to poll prediction status (${pollResponse.status})` },
        { status: 500 }
      );
    }

    result = await pollResponse.json();
    attempts++;
  }

  if (result.status === 'succeeded' && result.output) {
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    // Proxy the image to avoid CORS issues on the canvas
    const base64 = await fetchImageAsBase64(imageUrl);
    if (base64) {
      return NextResponse.json({ imageBase64: base64 });
    }
    return NextResponse.json({ imageUrl });
  }

  return NextResponse.json(
    { error: `Generation ${result.status === 'failed' ? 'failed' : 'timed out'}` },
    { status: 500 }
  );
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}
