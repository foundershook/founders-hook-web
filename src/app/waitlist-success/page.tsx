import { redirect } from "next/navigation";
import { Check, Rocket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/Startup";

export default async function WaitlistSuccessPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/onboarding");
  }

  const email = user.email;
  const vipCode = user.vipCode;

  if (!email || !vipCode) {
    redirect("/onboarding");
  }

  // Check if the user submitted a startup during onboarding
  await connectToDatabase();
  const startup = await Startup.findOne({ founder: user._id }).lean();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-radial px-6 py-16">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[110px]" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-ink-900/80 p-8 shadow-card backdrop-blur-xl sm:p-12 text-center">
        
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
          <Check size={32} className="text-gold-300" />
        </div>

        <h1 className="font-display text-3xl font-semibold text-white mb-4">
          You&apos;re on the list!
        </h1>
        
        <p className="text-base text-mist-400 mb-8 leading-relaxed">
          You&apos;ve successfully enrolled in our early access. We will contact you via{" "}
          <span className="font-medium text-white">{email}</span>.
        </p>

        {/* VIP Code Box */}
        <div className="bg-ink-950/50 rounded-2xl p-6 border border-white/5 shadow-inner mb-6">
          <h3 className="text-xs font-semibold text-mist-500 uppercase tracking-widest mb-3">
            Your Exclusive VIP Code
          </h3>
          <div className="flex items-center justify-center gap-3">
            <div className="text-2xl sm:text-3xl font-bold text-gold-300 tracking-widest font-mono">
              {vipCode}
            </div>
          </div>
          <p className="text-sm text-mist-400 mt-4">
            Save this code! Use it when we launch to claim your early-adopter benefits.
          </p>
        </div>

        {/* Startup acknowledgment */}
        {startup ? (
          <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-5 py-4 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
              <Rocket size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {/* @ts-expect-error lean type */}
                {startup.name} is queued for launch 🚀
              </p>
              <p className="text-xs text-mist-500 mt-0.5">
                Your startup will be live on Founders Hook from day one.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-mist-600">
            Don&apos;t have a startup yet? No worries — you can add one after launch.
          </p>
        )}

      </div>
    </main>
  );
}