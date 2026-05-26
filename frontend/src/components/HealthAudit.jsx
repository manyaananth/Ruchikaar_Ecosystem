import TopNav from "./TopNav"
import HealthAuditTab from "./HealthAuditTab"

export default function HealthAudit({ ctx }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <TopNav ctx={ctx} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <HealthAuditTab ctx={ctx} />
      </div>
    </div>
  )
}
