import FeatureCard from "./FeatureCard";
import { marketingFeatures } from "../data/marketingFeatures";

function FeaturesSection() {
  return (
    <section
      className="relative bg-[#070a0e] px-5 pb-20 pt-16 sm:px-8 sm:pb-24 lg:px-10"
      id="features"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200">
              Designed for follow-through
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
              Everything you need to see progress before motivation fades.
            </h2>
          </div>
          <p className="max-w-xl leading-8 text-slate-300 lg:justify-self-end">
            HabitFlow keeps the daily loop simple while giving you richer
            context when it matters: what is sticking, what slips, and what to
            adjust next.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketingFeatures.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
