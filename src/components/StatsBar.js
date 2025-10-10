export default function StatsBar() {
  const items = [
    { k: "Rooms Painted", v: "1,200+" },
    { k: "Projects Completed", v: "650+" },
    { k: "Avg. Rating", v: "4.9/5" },
    { k: "Warranty", v: "2 Years" },
  ];

  return (
    <section className="w-full bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4 md:px-10">
        {items.map((i) => (
          <div
            key={i.k}
            className="rounded-xl bg-[#F1F4E8] px-5 py-4 text-center"
          >
            <div className="text-2xl font-semibold text-[#171717]">{i.v}</div>
            <div className="text-sm text-[#525252]">{i.k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
