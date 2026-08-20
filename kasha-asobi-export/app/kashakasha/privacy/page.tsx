import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Crinkle Play',
  description: 'Privacy Policy for Crinkle Play. No personal data is collected from your baby.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8FB] to-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/kashakasha" className="text-sm font-bold text-[#FF6B9D] hover:underline">
          ← Back to Crinkle Play
        </Link>

        <h1 className="mt-5 text-2xl font-black text-[#1B2A5C]">Privacy Policy</h1>
        <p className="mt-1 text-xs text-gray-400">Last updated: August 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">No data collected from your child</h2>
            <p className="mt-1">Crinkle Play does not collect any personal information from babies or children. There is no account, no login, and no third-party analytics or advertising SDK of any kind.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">On-device sound</h2>
            <p className="mt-1">All sounds are generated on your device using the Web Audio API. Nothing is recorded or transmitted, except the optional voice-recording feature described below.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Optional voice recording</h2>
            <p className="mt-1">If a parent chooses to record their own voice as a sound option, the recording is held only in temporary in-memory storage for the current session. It is never saved to disk, never uploaded, and never shared with anyone. It is discarded when the app is closed.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Subscriptions (RevenueCat)</h2>
            <p className="mt-1">The only third-party service used by this app is RevenueCat, which processes and validates in-app subscription purchases through Apple&apos;s StoreKit. RevenueCat receives purchase/subscription event data and an anonymous, app-generated device identifier — never your name, email, or any other personal information, since the app has no account system. This data is used solely for subscription management and is never used for advertising or tracking.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Local storage</h2>
            <p className="mt-1">Your settings (such as language and unlocked plan) are stored only on your own device and are never sent to any server.</p>
          </section>
        </div>

        <div className="mt-6 rounded-2xl bg-white/70 p-4">
          <p className="text-sm font-bold text-[#1B2A5C]">Contact</p>
          <a href="mailto:info@zaibase.group" className="mt-1 inline-block text-sm text-[#FF6B9D] hover:underline">
            info@zaibase.group
          </a>
        </div>

        <div className="mt-8 flex gap-4 text-xs font-bold text-gray-500">
          <Link href="/kashakasha/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/kashakasha/tokusho" className="hover:underline">特定商取引法に基づく表記</Link>
        </div>
      </div>
    </main>
  );
}
