export default function DevBanner() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        width: "100%",
        background: "#c0392b",
        color: "#fff",
        textAlign: "center",
        fontFamily: "var(--raleway), sans-serif",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 0",
      }}
    >
      Development Site
    </div>
  );
}
