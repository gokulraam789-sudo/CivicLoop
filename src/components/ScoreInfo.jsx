import { SCORE_WEIGHTS as W } from '../lib/constants'

export default function ScoreInfo() {
  return (
    <details className="mt-3 text-sm text-slate-600">
      <summary className="cursor-pointer font-semibold text-brand-700">How the score is calculated</summary>
      <p className="mt-2">Score out of 100 = {W.onTime * 100}% on-time resolution + {W.resolution * 100}% resolution rate + {W.lowReopen * 100}% low reopen rate (100 minus reopened %) + {W.satisfaction * 100}% citizen satisfaction (share of verifications that confirmed the fix). A metric with no data yet counts as 75.</p>
    </details>
  )
}
