import { getDashboardMetrics } from "@/lib/metrics/dashboard";

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(value);

const formatNumber = (value: number) =>
	new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);

const StatCard = ({
	title,
	value,
	subtitle,
	emphasis,
}: {
	title: string;
	value: string;
	subtitle?: string;
	emphasis?: "large" | "default";
}) => (
	<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
		<p className="text-muted-foreground text-sm">{title}</p>
		<p
			// biome-ignore lint/nursery/useSortedClasses: space needed for template literal
			className={`mt-2 font-baskerville ${
				emphasis === "large" ? "text-4xl" : "text-3xl"
			}`}
		>
			{value}
		</p>
		{subtitle ? (
			<p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
		) : null}
	</div>
);

const ProgressCard = ({
	title,
	valueLabel,
	progress,
	targetLabel,
}: {
	title: string;
	valueLabel: string;
	progress: number;
	targetLabel: string;
}) => (
	<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
		<div className="flex items-center justify-between text-muted-foreground text-sm">
			<span>{title}</span>
			<span>{valueLabel}</span>
		</div>
		<div className="mt-2 h-2 w-full rounded-full bg-muted">
			<div
				className="h-full rounded-full bg-green-600 transition-all"
				style={{ width: `${Math.min(progress * 100, 100)}%` }}
			/>
		</div>
		<p className="mt-2 text-muted-foreground text-xs">{targetLabel}</p>
	</div>
);

export default async function DashboardPage() {
	const metrics = await getDashboardMetrics();

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
			<header>
				<h1 className="font-baskerville font-bold text-4xl text-foreground">
					Metrics Dashboard
				</h1>
				<p className="text-muted-foreground text-sm">
					Last updated {new Date(metrics.lastUpdated).toLocaleString("en-US")}
				</p>
			</header>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Platform Overview
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Ecocerts Published"
						value={formatNumber(metrics.totals.hypercerts)}
						subtitle={`${formatNumber(
							metrics.totals.listedForSale,
						)} currently listed`}
					/>
					<StatCard
						title="Total Volume"
						value={formatCurrency(metrics.totals.totalVolumeUSD)}
						subtitle="All-time marketplace inflow"
					/>
					<StatCard
						title="Average Purchase"
						value={formatCurrency(metrics.totals.averageTransactionUSD)}
						subtitle={`${metrics.totals.uniqueBuyerCount} unique buyers`}
					/>
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Monthly Activity
				</h2>
				<div className="grid gap-4 md:grid-cols-4">
					<StatCard
						title="On-chain transactions"
						value={formatNumber(metrics.monthly.onchainTransactions)}
						subtitle={`${formatNumber(
							metrics.monthly.minted,
						)} mints · ${formatNumber(
							metrics.monthly.purchases,
						)} purchases · ${formatNumber(
							metrics.monthly.evaluations,
						)} evaluations`}
						emphasis="large"
					/>
					<StatCard
						title="Minted this month"
						value={formatNumber(metrics.monthly.minted)}
					/>
					<StatCard
						title="Purchases this month"
						value={formatNumber(metrics.monthly.purchases)}
					/>
					<StatCard
						title="Monthly volume"
						value={formatCurrency(metrics.monthly.volumeUSD)}
						subtitle="Converted using current price feeds"
					/>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-[2fr_1fr]">
				<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
					<h3 className="font-semibold text-foreground">SDG KPIs</h3>
					<p className="text-muted-foreground text-sm">
						Tracking progress toward the $10k / 50 tx targets
					</p>
					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<ProgressCard
							title="On-chain volume"
							valueLabel={formatCurrency(metrics.sdg.transactionVolumeUSD)}
							progress={metrics.sdg.volumeProgress}
							targetLabel={`Target: ${formatCurrency(
								metrics.sdg.volumeTargetUSD,
							)} by Mar 31, 2026`}
						/>
						<ProgressCard
							title="On-chain transactions"
							valueLabel={formatNumber(metrics.sdg.transactionCount)}
							progress={metrics.sdg.transactionProgress}
							targetLabel={`Target: ${formatNumber(
								metrics.sdg.transactionTarget,
							)} tx`}
						/>
					</div>
				</div>
				<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
					<h3 className="font-semibold text-foreground">Repeat Donors</h3>
					<p className="text-muted-foreground text-sm">
						Address-based repeat rate across all-time sales
					</p>
					<div className="mt-4">
						<p className="font-baskerville text-4xl">
							{metrics.totals.repeatBuyerRate}%
						</p>
						<p className="text-muted-foreground text-sm">
							{formatNumber(metrics.totals.repeatBuyerCount)} repeat buyers out
							of {formatNumber(metrics.totals.uniqueBuyerCount)} unique
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
