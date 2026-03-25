import { cookies } from "next/headers";

const COOKIE_NAME = "student_auth";

export async function getStudentId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value ?? null;
}

export function setStudentCookie(response: Response, studentId: string): void {
  const cookieHeader = `${COOKIE_NAME}=${studentId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", cookieHeader);
}
