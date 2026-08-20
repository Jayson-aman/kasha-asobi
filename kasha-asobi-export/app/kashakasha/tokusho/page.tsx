import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | カシャカシャ あそび',
  description: '特定商取引法に基づく表記。カシャカシャ あそびのサブスクリプションに関する事業者情報・支払い条件です。',
};

const ROWS: [string, string][] = 
  ['販売業者', 'Zaibase.group（南條雅哉）'],
  ['運営統括責任者', 'ご請求があり次第、遅滞なく開示します'],
  ['所在地', 'ご請求があり次第、遅滞なく開示します'],
  ['電話番号', 'ご請求があり次第、遅滞なく開示します。それまではメールにてご対応いたします'],
  ['メールアドレス', 'info@zaibase.group'],
  ['役務の内容', 'ベビー向け多感覚あそびアプリ「カシャカシャ あそび」における追加音パック・きせかえテーマ等のデジタルコンテンツ利用権'],
  ['販売価格', 'スタンダードプラン：¥380（税込）/ 月・自動更新（App内課金の場合は表示価格に準じます）'],
  ['支払方法', 'App Store（Apple ID）のお支払い方法'],
  ['支払時期', 'お申し込み時（初回）、以降は毎月同日に自動更新・自動引き落とし'],
  ['契約期間', '1ヶ月。申し込み日から1ヶ月ごとに自動更新'],
  ['更新の停止・解約', 'Apple IDの「サブスクリプション」設定から、次回更新日の24時間前までに解約手続きを行ってください'],
  ['中途解約', '月の途中で解約された場合も、当月末までご利用いただけます。日割り返金は行いません'],
  ['サービス提供時期', '決済完了後、即時にご利用いただけます'],
  ['動作環境', 'iOS 15以降。安定したインターネット接続'],
  ['返品・キャンセル', 'デジタルコンテンツの性質上、提供開始後の返金はできません'],
];

export default function TokushoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8FB] to-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/kashakasha" className="text-sm font-bold text-[#FF6B9D] hover:underline">
          ← カシャカシャ あそびに戻る
        </Link>

        <h1 className="mt-5 text-2xl font-black text-[#1B2A5C]">特定商取引法に基づく表記</h1>
        <p className="mt-1 text-xs text-gray-400">特定商取引に関する法律 第11条に基づき、以下を表示します。</p>

        <table className="mt-6 w-full border-collapse text-sm">
          <tbody>
            {ROWS.map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <th className="w-36 py-3 pr-4 text-left align-top text-xs font-bold text-gray-500">{label}</th>
                <td className="py-3 text-sm leading-relaxed text-gray-700">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-xs leading-relaxed text-gray-400">
          ※ 内容は予告なく更新する場合があります。最新情報はこのページをご確認ください。
        </p>

        <div className="mt-8 flex gap-4 text-xs font-bold text-gray-500">
          <Link href="/kashakasha/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/kashakasha/terms" className="hover:underline">利用規約</Link>
        </div>
      </div>
    </main>
  );
}
