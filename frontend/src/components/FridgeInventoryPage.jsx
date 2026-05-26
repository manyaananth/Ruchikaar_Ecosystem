import TopNav from "./TopNav"
import FridgeInventory from "./FridgeInventory"

export default function FridgeInventoryPage({ ctx }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <TopNav ctx={ctx} />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <FridgeInventory ctx={ctx} />
      </div>
    </div>
  )
}
