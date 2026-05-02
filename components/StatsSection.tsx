import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

type StatsData = {
  reviews: number;
  students: number;
  universities: number;
  rating: number; // EXPECTED: percentage 0-100
};

function formatStat(n: number) {
  const v = Math.max(0, Math.floor(n));
  if (v < 1000) return { end: v, suffix: "+" }; // 0..999 => "123+"
  const k = v / 1000;
  const end = k >= 10 ? Math.round(k) : Number(k.toFixed(1));
  return { end, suffix: "K+" }; // 1000+ => "1.2K+"
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function StatsSection({ stats }: { stats: StatsData }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const reviews = formatStat(stats.reviews);
  const students = formatStat(stats.students);
  const unis = { end: Math.max(0, Math.floor(stats.universities)), suffix: "+" };
  const recommend = { end: Math.round(clamp(stats.rating, 0, 100)), suffix: "%" };

  return (
    <section className="py-12 text-[#6155F5] sm:py-16" ref={ref}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 text-center sm:grid-cols-2 sm:px-8 md:grid-cols-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {inView ? (
              <CountUp end={reviews.end} duration={2} suffix={reviews.suffix} />
            ) : (
              "0+"
            )}
          </h2>
          <p className="mt-2 text-sm sm:text-base">Course Reviews</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {inView ? (
              <CountUp end={students.end} duration={2} suffix={students.suffix} />
            ) : (
              "0+"
            )}
          </h2>
          <p className="mt-2 text-sm sm:text-base">Active Students</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {inView ? (
              <CountUp end={unis.end} duration={2} suffix={unis.suffix} />
            ) : (
              "0+"
            )}
          </h2>
          <p className="mt-2 text-sm sm:text-base">Universities</p>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {inView ? (
              <CountUp end={recommend.end} duration={2} suffix={recommend.suffix} />
            ) : (
              "0%"
            )}
          </h2>
          <p className="mt-2 text-sm sm:text-base">Would Recommend</p>
        </div>
      </div>
    </section>
  );
}
