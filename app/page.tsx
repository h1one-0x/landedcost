import Link from "next/link";
import {
  FileSpreadsheet,
  Container,
  ShieldCheck,
  History,
  FileDown,
  Share2,
  Upload,
  Settings2,
  BarChart3,
  Anchor,
} from "lucide-react";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Upload Any Excel",
    description:
      "Drop in your supplier spreadsheet and get an instant per-unit cost breakdown with all fees calculated automatically.",
  },
  {
    icon: Container,
    title: "All Container Types",
    description:
      "Support for 20\u2019, 40\u2019, 40HQ, and LCL shipments. Freight is allocated per-CBM so every item gets its fair share.",
  },
  {
    icon: ShieldCheck,
    title: "Real US Tariff Rates",
    description:
      "Built-in HTS lookup with current duty rates including Section 301 tariffs (25%) on Chinese imports.",
  },
  {
    icon: History,
    title: "Save & Compare Past Shipments",
    description:
      "Every calculation is saved to your dashboard. Compare costs across suppliers, dates, and container types.",
  },
  {
    icon: FileDown,
    title: "Download PDF & Excel Reports",
    description:
      "Export polished reports for your records, your accountant, or your customs broker with one click.",
  },
  {
    icon: Share2,
    title: "Share Read-Only Links",
    description:
      "Generate a shareable link so your team, partners, or freight forwarders can view the breakdown without an account.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your product list",
    description:
      "Drop in an Excel file with your items or enter them manually. Include quantities, unit prices, weights, and dimensions.",
  },
  {
    number: "02",
    title: "Select container & shipping costs",
    description:
      "Choose your container type, enter your freight quote, and set any additional fees like insurance or customs brokerage.",
  },
  {
    number: "03",
    title: "Get the full cost breakdown",
    description:
      "Instantly see the true landed cost per unit \u2014 with duties, tariffs, freight allocation, and every fee itemised.",
  },
];

const includedFeatures = [
  "Unlimited shipment calculations",
  "Excel & PDF exports",
  "HTS tariff lookup with Section 301",
  "All container types (20\u2019, 40\u2019, 40HQ, LCL)",
  "Save & compare past shipments",
  "Shareable read-only links",
  "Email support",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border-subtle/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-7 h-7 text-accent" />
            <span className="font-serif text-xl text-text-primary tracking-tight">
              LandedCost
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/app/new-shipment"
              className="bg-accent text-background px-5 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              <h1 className="font-serif text-5xl md:text-6xl text-text-primary leading-tight tracking-tight">
                Know your true cost{" "}
                <span className="text-accent">before it leaves the port.</span>
              </h1>
              <p className="text-text-secondary text-xl leading-relaxed max-w-xl">
                Calculate the complete landed cost of any shipment from China
                &mdash; duties, tariffs, freight, and fees &mdash; in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/app/new-shipment"
                  className="bg-accent text-background px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20 text-center"
                >
                  Start Free Calculator
                </Link>
                <Link
                  href="#how-it-works"
                  className="border border-border-subtle text-text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-surface transition-all text-center"
                >
                  View Demo
                </Link>
              </div>
              <p className="text-text-secondary text-sm">
                No credit card required &middot; Free during beta
              </p>
            </div>

            {/* Right: Calculator Preview Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl blur-xl" />
              <div className="relative bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xl shadow-black/40">
                {/* Mockup header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-text-secondary text-xs font-mono">
                    Shipment #SH-2024-0047
                  </span>
                </div>

                {/* Mockup summary card */}
                <div className="bg-elevated rounded-xl p-5 mb-4 border border-border-subtle/50">
                  <p className="text-text-secondary text-xs uppercase tracking-wider mb-3">
                    Shipment Summary
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-text-secondary text-xs">Total FOB</p>
                      <p className="font-mono text-accent text-xl font-semibold">
                        $24,850.00
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs">
                        Total Landed
                      </p>
                      <p className="font-mono text-accent text-xl font-semibold">
                        $38,217.50
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs">
                        Duty &amp; Tariffs
                      </p>
                      <p className="font-mono text-text-primary text-lg">
                        $6,212.50
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs">
                        Freight (40HQ)
                      </p>
                      <p className="font-mono text-text-primary text-lg">
                        $4,800.00
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mockup item rows */}
                <div className="space-y-2">
                  {[
                    {
                      item: "LED Panel Light 60x60",
                      qty: "500",
                      landed: "$18.42",
                    },
                    {
                      item: "Smart Plug WiFi 16A",
                      qty: "2,000",
                      landed: "$4.87",
                    },
                    {
                      item: "USB-C Hub 7-in-1",
                      qty: "1,200",
                      landed: "$9.14",
                    },
                  ].map((row) => (
                    <div
                      key={row.item}
                      className="flex items-center justify-between bg-background/50 rounded-lg px-4 py-3 border border-border-subtle/30"
                    >
                      <div>
                        <p className="text-text-primary text-sm">{row.item}</p>
                        <p className="text-text-secondary text-xs">
                          Qty: {row.qty}
                        </p>
                      </div>
                      <p className="font-mono text-accent font-semibold">
                        {row.landed}
                        <span className="text-text-secondary text-xs font-sans ml-1">
                          /unit
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface/50 border-y border-border-subtle/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-4">
              Everything you need to calculate landed cost
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Stop guessing. Stop spreadsheet gymnastics. Get the real number in
              minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border-subtle rounded-xl p-6 hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/5 group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-text-primary font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-4">
              How it works
            </h2>
            <p className="text-text-secondary text-lg">
              Three steps to your true landed cost.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-accent/60 via-accent/30 to-accent/60 hidden md:block" />

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex gap-8 items-start">
                    {/* Step number */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <span className="font-mono text-accent text-xl font-bold">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="pt-2">
                      <h3 className="text-text-primary font-semibold text-xl mb-2">
                        {step.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                      {index === 0 && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-lg px-3 py-1.5">
                            <Upload className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs text-text-secondary">
                              .xlsx
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-lg px-3 py-1.5">
                            <Settings2 className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs text-text-secondary">
                              Manual entry
                            </span>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-lg px-3 py-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs text-text-secondary">
                              Per-unit cost
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-surface border border-border-subtle rounded-lg px-3 py-1.5">
                            <FileDown className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs text-text-secondary">
                              Export PDF
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-surface/50 border-y border-border-subtle/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-4">
              Simple pricing
            </h2>
            <p className="text-text-secondary text-lg">
              Free while we&apos;re in beta. No catches.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-surface border border-accent/30 rounded-2xl p-8 shadow-lg shadow-accent/5 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-5xl font-bold text-accent">
                    $0
                  </span>
                  <span className="text-text-secondary text-lg">/month</span>
                </div>
                <p className="text-accent text-sm font-medium mb-6">
                  Free during beta
                </p>

                <div className="border-t border-border-subtle pt-6 mb-8">
                  <p className="text-text-primary font-medium mb-4">
                    Everything included:
                  </p>
                  <ul className="space-y-3">
                    {includedFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-text-secondary text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/app/new-shipment"
                  className="block w-full bg-accent text-background py-4 rounded-lg text-center font-semibold text-lg hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  Start Free Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-accent" />
                <span className="font-serif text-lg text-text-primary">
                  LandedCost
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                Know your true cost before it leaves the port.
              </p>
            </div>
            <p className="text-text-secondary text-sm">
              &copy; 2024 LandedCost. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
