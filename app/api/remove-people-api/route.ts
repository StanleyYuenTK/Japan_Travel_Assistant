// app/api/remove-people-api/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set in .env');
}

const REMBG_MODEL = 'cjwbw/rembg';
const INPAINT_MODEL = 'black-forest-labs/flux-kontext-pro';

export async function POST(request: NextRequest) {
  let tempDir: string | undefined;
  let imagePath: string | undefined;
  let maskPath: string | undefined;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'replicate-'));
    imagePath = path.join(tempDir, 'input.jpg');
    await fs.promises.writeFile(imagePath, buffer);

    // Step 1: 用 rembg 生成 mask（移除背景 → 人物 = 黑色）
    console.log('Running rembg...');
    const rembgVersion = await getModelVersion(REMBG_MODEL);  // 動態取得版本
    const rembgOutput = await replicateRun(REMBG_MODEL, rembgVersion, {
      input: {
        image: `data:${file.type};base64,${buffer.toString('base64')}`,
        return_mask: true,
      },
    });

    const maskBase64 = rembgOutput.mask;
    const maskBuffer = Buffer.from(maskBase64, 'base64');
    maskPath = path.join(tempDir, 'mask.png');
    await fs.promises.writeFile(maskPath, maskBuffer);

    // Step 2: 用 inpainting 填補人物區域
    console.log('Running inpainting...');
    const inpaintVersion = await getModelVersion(INPAINT_MODEL);  // 動態取得版本
    const inpaintOutput = await replicateRun(INPAINT_MODEL, inpaintVersion, {
      input: {
        image: `data:${file.type};base64,${buffer.toString('base64')}`,
        mask: `data:image/png;base64,${maskBase64}`,
        prompt: 'beautiful natural landscape, scenic background, high quality, detailed, realistic',
        negative_prompt: 'people, person, human, crowd, face, blurry, low quality',
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 25,
        guidance_scale: 7.5,
      },
    });

    const resultBase64 = inpaintOutput[0]?.split(',')[1];  // 移除 data:image/png;base64,
    if (!resultBase64) throw new Error('No output from inpainting');

    return NextResponse.json({ image: resultBase64 });

  } catch (error: any) {
    console.error('Remove people error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  } finally {
    // 清理
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  }
}

// 取得模型最新版本哈希
async function getModelVersion(model: string): Promise<string> {
  const response = await fetch(`https://api.replicate.com/v1/models/${model}`, {
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch model ${model}: ${response.status}`);
  }

  const data = await response.json();
  const version = data?.versions?.[0]?.id;  // 取最新版本
  if (!version) {
    throw new Error(`No version found for model ${model}`);
  }

  return version;
}

// 封裝 Replicate API 呼叫（修正：移除 version 屬性）
async function replicateRun(model: string, version: string, options: { input: any }): Promise<any> {
  const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version,  // 現在是特定哈希，不是 "latest"
      input: options.input,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${err}`);
  }

  const prediction = await response.json();
  return await pollPrediction(prediction.id);
}

async function pollPrediction(id: string): Promise<any> {
  const maxAttempts = 120;  // 增加到 2 分鐘，inpainting 可能較慢
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
    });
    const data = await res.json();

    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed') throw new Error(data.error || 'Prediction failed');

    await new Promise(r => setTimeout(r, 1000));  // 每秒檢查一次
  }
  throw new Error('Timeout: Prediction took too long');
}