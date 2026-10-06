"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, Form, Input } from "antd";
import { ArrowRight, BedDouble, Eye, Fingerprint, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type Credentials = { username: string; password: string; oldPassword: string; newPassword: string };

export default function LoginPage() {
  const { token, user, ready, login, changePassword } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm<Credentials>();
  const [busy, setBusy] = useState(false);
  const [returnTo, setReturnTo] = useState("/");
  const forceChange = !!token && !!user?.mustChangePassword;

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("next") || "/";
    setReturnTo(requested.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/login") ? requested : "/");
  }, []);

  useEffect(() => {
    if (ready && token && user && !user.mustChangePassword) router.replace(returnTo);
  }, [ready, token, user, returnTo, router]);

  async function submit(values: Credentials) {
    setBusy(true);
    try {
      if (forceChange) {
        await changePassword(values.oldPassword, values.newPassword);
        form.resetFields();
        message.success("Password changed. Sign in with your new password.");
      } else {
        const requiresChange = await login(values.username, values.password);
        if (!requiresChange) router.replace(returnTo);
      }
    } catch (error: any) {
      message.error(error.message || "Could not sign in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || (token && user && !user.mustChangePassword)) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" /></main>;
  }

  return <main className="flex min-h-dvh items-center justify-center bg-[#f6f7f9] p-3 sm:p-5">
    <div className="mx-auto grid h-[min(720px,calc(100dvh-2.5rem))] w-full max-w-6xl overflow-hidden rounded-[24px] bg-white shadow-[0_28px_100px_rgba(17,24,39,0.12)] sm:rounded-[28px] lg:grid-cols-[1fr_0.94fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#111a2d] p-12 text-white lg:flex">
        <div className="absolute -right-36 -top-32 h-[440px] w-[440px] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-12 h-[280px] w-[280px] rounded-full border border-white/10" />
        <div className="absolute -bottom-56 -left-48 h-[540px] w-[540px] rounded-full bg-blue-500/15 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500"><BedDouble size={23} /></div><span className="text-xl font-semibold tracking-tight">HotelHex</span></div>
        <div className="relative z-10 max-w-lg py-12"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">Hotel operations, in one place</p><h1 className="text-5xl font-semibold leading-[1.12] tracking-tight">A calmer way to run your hotel.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-300">Rooms, teams and property operations come together in a workspace built for hospitality.</p></div>
        <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-300"><ShieldCheck size={17} className="text-blue-300" />Secure sign-in for your hotel workspace</div>
      </section>

      <section className="flex min-h-0 items-center justify-center overflow-hidden px-5 py-4 sm:px-10 sm:py-6 lg:px-12 lg:py-5">
        <div className="w-full max-w-[390px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white"><BedDouble size={21} /></div><span className="text-xl font-semibold tracking-tight text-slate-900">HotelHex</span></div>
          <div className="mb-6"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{forceChange ? <KeyRound size={22} /> : <Fingerprint size={22} />}</div><p className="mb-2 text-sm font-medium text-blue-700">{forceChange ? "One quick security step" : "Welcome to HotelHex"}</p><h2 className="text-3xl font-semibold tracking-tight text-slate-950">{forceChange ? "Set a new password" : "Sign in to continue"}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{forceChange ? "Choose a new password before entering your hotel workspace." : "Enter your account details to open your workspace."}</p></div>

          <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} size="large">
            {forceChange ? <>
              <Form.Item name="oldPassword" label="Temporary password" rules={[{ required: true, message: "Enter your current password" }]}><Input.Password prefix={<KeyRound size={16} className="text-slate-400" />} autoComplete="current-password" placeholder="Enter temporary password" /></Form.Item>
              <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 12, max: 200, message: "Use 12 to 200 characters" }]}><Input.Password prefix={<ShieldCheck size={16} className="text-slate-400" />} autoComplete="new-password" placeholder="At least 12 characters" /></Form.Item>
            </> : <>
              <Form.Item name="username" label="Username" rules={[{ required: true, message: "Enter your username" }]}><Input autoComplete="username" placeholder="Your username" /></Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}><Input.Password autoComplete="current-password" placeholder="Your password" /></Form.Item>
            </>}
            <Button htmlType="submit" type="primary" block loading={busy} className="mt-2 h-12 rounded-xl font-medium">{forceChange ? <>Update password <ArrowRight size={16} className="ml-2 inline" /></> : <>Sign in <ArrowRight size={16} className="ml-2 inline" /></>}</Button>
          </Form>

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><Eye size={14} /> Your access follows your assigned hotel role and property.</div>
          <p className="mt-6 text-center text-xs text-slate-400">HotelHex ? Hotel operations platform</p>
        </div>
      </section>
    </div>
  </main>;
}
