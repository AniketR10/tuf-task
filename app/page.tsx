import WallCalendar from "@/components/Calendar";

export default function Home() {
  return (
    <main
      className="min-h-screen overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #cfd1d5 0%, #c2c4c9 45%, #caccce 100%)',
        padding: '5rem 1rem 3rem',
      }}
    >
      <WallCalendar />
    </main>
  );
}