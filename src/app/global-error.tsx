"use client";

// Replaces the root layout when it fails, so no global CSS or fonts: plain inline styles on milk.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#fffdf8",
          color: "#2a170e",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <title>Something went wrong | TeddyPups U.A.E.</title>
        <main>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>This page tripped on its way to you.</h1>
          <p style={{ margin: "1rem auto 1.5rem", maxWidth: "36ch", lineHeight: 1.5 }}>
            Something on our side did not load. Give it a moment and try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              font: "inherit",
              fontWeight: 700,
              padding: "0.8rem 1.6rem",
              borderRadius: "999px",
              border: "3px solid #2a170e",
              background: "#f2be6b",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
