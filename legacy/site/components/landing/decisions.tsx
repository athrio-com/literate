import Link from 'next/link'
import { listAdrs } from '@/lib/decisions'

export async function Decisions() {
  const adrs = (await listAdrs()).slice(0, 5)
  return (
    <section className="lx-section">
      <div className="lx-section-head">
        <div className="lx-section-label">Recent decisions</div>
        <Link className="lx-section-more" href="/docs/decisions">All ADRs →</Link>
      </div>
      <ul className="lx-adr-list">
        {adrs.map((adr) => (
          <li key={adr.id} className="lx-adr-row">
            <span className="lx-adr-id">{adr.id}</span>
            <Link className="lx-adr-title" href="/docs/decisions">{adr.title}</Link>
            <span className={`lx-adr-status is-${adr.status.toLowerCase()}`}>
              {adr.status}
            </span>
            <span className="lx-adr-date">{adr.date}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
