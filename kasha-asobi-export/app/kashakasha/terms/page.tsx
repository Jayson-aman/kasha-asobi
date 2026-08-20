import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Crinkle Play',
  description: 'Terms of Service for Crinkle Play, including subscription auto-renewal, cancellation, and refund information.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8FB] to-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/kashakasha" className="text-sm font-bold text-[#FF6B9D] hover:underline">
          ← Back to Crinkle Play
        </Link>

        <h1 className="mt-5 text-2xl font-black text-[#1B2A5C]">Terms of Service</h1>
        <p className="mt-1 text-xs text-gray-400">Last updated: August 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Using the app</h2>
            <p className="mt-1">Crinkle Play is a sensory play app intended for babies aged 0–2, to be used with a parent or guardian present. No account is required to use the free features.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Subscription (Standard Monthly)</h2>
            <p className="mt-1">The Standard plan is an auto-renewing subscription billed monthly through your Apple ID. It automatically renews unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID account at confirmation of purchase.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Managing or cancelling</h2>
            <p className="mt-1">You can manage or cancel your subscription at any time in your device&apos;s Settings → [your name] → Subscriptions. Cancelling stops future renewals; you keep access until the end of the current billing period.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Refunds</h2>
            <p className="mt-1">Refund requests for purchases made through the App Store are handled by Apple in accordance with Apple&apos;s own refund policies.</p>
          </section>
          <section>
            <h2 className="text-sm font-black text-[#1B2A5C]">Content</h2>
            <p className="mt-1">All sounds, themes, and visuals are provided for entertainment and sensory play purposes. The app does not provide medical, developmental, or educational advice.</p>
          </section>
        </div>

        <div className="mt-6 rounded-2xl bg-white/70 p-4">
          <p className="text-sm font-bold text-[#1B2A5C]">Contact</p>
          <a href="mailto:info@zaibase.group" className="mt-1 inline-block text-sm text-[#FF6B9D] hover:underline">
            info@zaibase.group
          </a>
        </div>

        <div className="mt-8 flex gap-4 text-xs font-bold text-gray-500">
          <Link href="/kashakasha/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/kashakasha/tokusho" className="hover:underline">特定商取引法に基づく表記</Link>
        </div>
      </div>
    </main>
  );
}
