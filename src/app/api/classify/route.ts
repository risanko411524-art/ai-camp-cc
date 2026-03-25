import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const OPENCHAT_LINK = "https://line.me/ti/g2/XXXXXX"; // TODO: 総合オプチャのリンクに差し替え

function formatStudentNumber(num: number): string {
  return `TSU-${String(num).padStart(4, "0")}`;
}

async function sendStudentNumberEmail(
  email: string,
  name: string,
  studentNumberFormatted: string,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-camp-cc.vercel.app";

  await resend.emails.send({
    from: "The Start Up <onboarding@resend.dev>",
    to: email,
    subject: `【The Start Up】受講生番号のお知らせ（${studentNumberFormatted}）`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">The Start Up</h1>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">${name} さん、ご登録ありがとうございます！</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">あなたの受講生番号</p>
          <p style="margin: 0 0 24px 0; font-size: 32px; font-weight: bold; color: #059669; text-align: center; letter-spacing: 2px;">
            ${studentNumberFormatted}
          </p>
        </div>

        <div style="margin: 24px 0;">
          <p style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">📌 次のステップ</p>

          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 12px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">① 総合オープンチャットに参加</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">受講生全員が参加するコミュニティです。</p>
            <a href="${OPENCHAT_LINK}" style="display: inline-block; background: #059669; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold;">オープンチャットに参加する</a>
          </div>

          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">② マイページにログイン</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">受講生番号でログインして、プロフィールを確認できます。</p>
            <a href="${siteUrl}/login" style="display: inline-block; background: #059669; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold;">マイページにログイン</a>
          </div>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center;">
          受講生番号は講座で使用しますので、大切に保管してください。
        </p>
      </div>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const gender = formData.get("gender") as string;
    const location = formData.get("location") as string;
    const career = formData.get("career") as string;
    const concern = formData.get("concern") as string;
    const idealFuture = formData.get("idealFuture") as string;
    const availableHours = formData.get("availableHours") as string;
    const aiLevel = formData.get("aiLevel") as string;
    const photo = formData.get("photo") as File | null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "お名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    let photoUrl: string | null = null;

    if (photo && photo.size > 0) {
      const ext = photo.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(fileName, buffer, {
          contentType: photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from("photos")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from("submissions")
      .insert({
        name,
        email,
        gender,
        location,
        career,
        concern,
        ideal_future: idealFuture,
        available_hours: availableHours,
        ai_level: aiLevel,
        group_key: "ALL",
        photo_url: photoUrl,
      })
      .select("student_number")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    const studentNumber = insertedData?.student_number ?? 0;
    const studentNumberFormatted = formatStudentNumber(studentNumber);

    // メール送信（エラーが出ても処理は続行）
    try {
      await sendStudentNumberEmail(email, name, studentNumberFormatted);
      console.log(`Email sent to ${email} with student number ${studentNumberFormatted}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({
      success: true,
      studentNumber: studentNumberFormatted,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
