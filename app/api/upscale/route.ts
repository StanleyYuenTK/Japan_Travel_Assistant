// app/api/upscale/route.ts
import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

// 建構絕對路徑
const getExecutablePath = () => {
  if (process.env.REAL_ESRGAN_PATH) {
    return join(process.cwd(), process.env.REAL_ESRGAN_PATH);
  }
  return join(process.cwd(), "public", "tools", "realesrgan_folder", "realesrgan-ncnn-vulkan.exe");
};

const REAL_ESRGAN_PATH = getExecutablePath();
const MODEL_PATH = process.env.REAL_ESRGAN_MODEL || "realesrgan-x4plus";
const UPLOAD_TEMP_DIR = join(tmpdir(), "travel-ai-upscale");

export async function POST(req: Request) {
  try {
    await mkdir(UPLOAD_TEMP_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 檔案大小限制
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (>15MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const inputId = uuidv4();
    const inputPath = join(UPLOAD_TEMP_DIR, `${inputId}.input.abc`);
    const outputPath = join(UPLOAD_TEMP_DIR, `${inputId}.output.png`);

    await writeFile(inputPath, buffer);

    console.log("Executing:", REAL_ESRGAN_PATH);
    console.log("Input:", inputPath);
    console.log("Output:", outputPath);

    // 執行 Real-ESRGAN
    await new Promise<void>((resolve, reject) => {
      const args = [
        "-i", inputPath,
        "-o", outputPath,
        "-n", MODEL_PATH,
        "-s", "4",
        "-f", "png",
      ];

      execFile(REAL_ESRGAN_PATH, args, { timeout: 60000 }, (err, stdout, stderr) => {
        if (err) {
          console.error("Real-ESRGAN stderr:", stderr);
          reject(err);
          return;
        }
        console.log("Real-ESRGAN success");
        resolve();
      });
    });

    const resultBuffer = await readFile(outputPath);
    const base64 = resultBuffer.toString("base64");

    // 清理
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    return NextResponse.json({ image: base64 });
  } catch (err: any) {
    console.error("Upscale error:", err);
    return NextResponse.json(
      { error: "Processing failed", details: err.message },
      { status: 500 }
    );
  }
}