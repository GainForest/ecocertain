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

const formatPercent = (value: number) =>
	`${value.toFixed(1).replace(/[.,]0$/, "")}%`;

const CHAIN_ID_TO_NAME: Record<number, string> = {
	1: "Ethereum",
	10: "Optimism",
	56: "BNB Chain",
	100: "Gnosis",
	137: "Polygon",
	252: "Fantom",
	8453: "Base",
	42161: "Arbitrum",
	42220: "Celo",
	43114: "Avalanche",
	44787: "Celo Alfajores",
	59140: "Linea Testnet",
	59144: "Linea",
};

const formatChainName = (chainId?: number | string | null) => {
	if (chainId === null || chainId === undefined) {
		return "N/A";
	}
	const numericId =
		typeof chainId === "string" ? Number.parseInt(chainId, 10) : chainId;
	if (!Number.isFinite(numericId)) {
		return chainId.toString();
	}
	return CHAIN_ID_TO_NAME[numericId] ?? `Chain ${numericId}`;
};

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

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Geographic Reach
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Countries represented"
						value={formatNumber(metrics.geo.countriesRepresented)}
						subtitle="Distinct countries with mapped GeoJSON"
						emphasis="large"
					/>
					<StatCard
						title="Hectares mapped"
						value={formatNumber(metrics.geo.totalHectares)}
						subtitle="Verified via submitted GeoJSON"
					/>
					<StatCard
						title="Priority regions"
						value={formatNumber(metrics.geo.priorityRegionProjects)}
						subtitle="Africa + Asia + South America"
					/>
				</div>
				<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
					<h3 className="font-semibold text-foreground">Top countries</h3>
					{metrics.geo.topCountries.length === 0 ? (
						<p className="mt-2 text-muted-foreground text-sm">
							Geo enrichment has not been run yet.
						</p>
					) : (
						<ul className="mt-3 space-y-1 text-sm">
							{metrics.geo.topCountries.map((country) => (
								<li
									key={country.name}
									className="flex items-center justify-between text-muted-foreground"
								>
									<span>{country.name}</span>
									<span className="font-medium text-foreground">
										{country.count} project
										{country.count === 1 ? "" : "s"}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					User &amp; Flow Telemetry (30d)
				</h2>
				<div className="grid gap-4 md:grid-cols-4">
					<StatCard
						title="Active wallets"
						value={formatNumber(metrics.engagement.wallets.monthlyActive)}
						subtitle={`${formatNumber(
							metrics.engagement.wallets.totalConnects,
						)} connects`}
					/>
					<StatCard
						title="Form completion rate"
						value={formatPercent(metrics.engagement.forms.completionRate)}
						subtitle={`${formatNumber(
							metrics.engagement.forms.completed,
						)} published`}
					/>
					<StatCard
						title="Swap success"
						value={formatPercent(metrics.engagement.swaps.completionRate)}
						subtitle={`${formatNumber(
							metrics.engagement.swaps.started,
						)} swap attempts`}
					/>
					<StatCard
						title="Payment flow completion"
						value={formatPercent(metrics.engagement.payments.completionRate)}
						subtitle={`${formatNumber(
							metrics.engagement.payments.totalFlows,
						)} flows`}
					/>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">Swap telemetry</h3>
						<p className="text-muted-foreground text-sm">
							Route execution stats from the LI.FI widget
						</p>
						<div className="mt-4 flex flex-wrap gap-4 text-muted-foreground text-sm">
							<div>
								<p className="text-xs uppercase">Median duration</p>
								<p className="font-semibold text-foreground text-lg">
									{metrics.engagement.swaps.medianDurationMs} ms
								</p>
							</div>
							<div>
								<p className="text-xs uppercase">Total completions</p>
								<p className="font-semibold text-foreground text-lg">
									{formatNumber(metrics.engagement.swaps.completed)}
								</p>
							</div>
							<div>
								<p className="text-xs uppercase">Chain switches</p>
								<p className="font-semibold text-foreground text-lg">
									{formatNumber(metrics.engagement.wallets.chainSwitches)}
								</p>
							</div>
						</div>
					</div>
					<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Operational health
						</h3>
						<p className="text-muted-foreground text-sm">
							Submission funnel + IPFS logging
						</p>
						<div className="mt-4 flex flex-wrap gap-4 text-muted-foreground text-sm">
							<div>
								<p className="text-xs uppercase">Validation errors</p>
								<p className="font-semibold text-foreground text-lg">
									{formatNumber(metrics.engagement.forms.validationErrors)}
								</p>
							</div>
							<div>
								<p className="text-xs uppercase">Payment drop-off</p>
								<p className="font-semibold text-foreground text-lg">
									{formatPercent(metrics.engagement.payments.dropOffRate)}
								</p>
							</div>
							<div>
								<p className="text-xs uppercase">IPFS success rate</p>
								<p className="font-semibold text-foreground text-lg">
									{formatPercent(metrics.engagement.uploads.successRate)}
								</p>
								<p className="text-muted-foreground text-xs">
									{formatNumber(metrics.engagement.uploads.failures)} failures
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Performance Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Avg. minting time"
						value={`${metrics.engagement.performance.averageMintTimeSeconds}s`}
						subtitle="From start to completion"
					/>
					<StatCard
						title="Avg. payment time"
						value={`${metrics.engagement.performance.averagePaymentTimeSeconds}s`}
						subtitle={`Approval: ${metrics.engagement.performance.approvalTimeSeconds}s · Confirmation: ${metrics.engagement.performance.confirmationTimeSeconds}s`}
					/>
					<StatCard
						title="IPFS uploads"
						value={`${metrics.engagement.performance.averageUploadTimeMs}ms`}
						subtitle={`Avg size: ${metrics.engagement.performance.averageUploadSizeKB}KB`}
					/>
				</div>
				{metrics.engagement.performance.slowestSteps.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Slowest minting steps
						</h3>
						<p className="text-muted-foreground text-sm">
							Average duration by step
						</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.performance.slowestSteps.map((step) => (
								<div
									key={step.step}
									className="flex items-center justify-between"
								>
									<span className="text-muted-foreground">{step.step}</span>
									<span className="font-medium text-foreground">
										{step.avgDurationMs}ms
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					User Behavior & Engagement
				</h2>
				<div className="grid gap-4 md:grid-cols-4">
					<StatCard
						title="Bounce rate"
						value={formatPercent(metrics.engagement.behavior.bounceRate)}
						subtitle="Sessions with ≤ 2 events"
					/>
					<StatCard
						title="Multi-chain users"
						value={formatNumber(metrics.engagement.behavior.multiChainUsers)}
						subtitle="Wallets using 2+ chains"
					/>
					<StatCard
						title="Retention rate"
						value={formatPercent(metrics.engagement.behavior.retentionRate)}
						subtitle={`${formatNumber(
							metrics.engagement.behavior.returningUsers,
						)} returning · ${formatNumber(
							metrics.engagement.behavior.newUsers,
						)} new`}
					/>
					<StatCard
						title="Tip acceptance"
						value={formatPercent(metrics.engagement.behavior.tipAcceptanceRate)}
						subtitle={`Decline rate: ${formatPercent(
							metrics.engagement.behavior.tipDeclineRate,
						)}`}
					/>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<StatCard
						title="Avg. events per session"
						value={metrics.engagement.behavior.averageEventsPerSession.toString()}
						subtitle="User engagement level"
					/>
					<StatCard
						title="Wallet disconnect rate"
						value={formatPercent(
							metrics.engagement.behavior.walletDisconnectRate,
						)}
						subtitle="Disconnects vs. connects"
					/>
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Cross-Chain Swap Intelligence
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Total swap volume"
						value={formatCurrency(metrics.engagement.swaps.totalSwapVolumeUSD)}
						subtitle={`Avg: ${formatCurrency(
							metrics.engagement.swaps.averageSwapAmountUSD,
						)}`}
					/>
					<StatCard
						title="Most used source chain"
						value={formatChainName(
							metrics.engagement.swaps.mostUsedSourceChain,
						)}
					/>
					<StatCard
						title="Most used dest chain"
						value={formatChainName(metrics.engagement.swaps.mostUsedDestChain)}
					/>
				</div>
				{metrics.engagement.swaps.chainPairDistribution.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Popular chain pairs
						</h3>
						<p className="text-muted-foreground text-sm">
							Most common swap routes
						</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.swaps.chainPairDistribution
								.slice(0, 5)
								.map((pair) => (
									<div
										key={`${pair.from}-${pair.to}`}
										className="flex items-center justify-between"
									>
										<span className="text-muted-foreground">
											{formatChainName(pair.from)}
											{" -> "}
											{formatChainName(pair.to)}
										</span>
										<span className="font-medium text-foreground">
											{pair.count} swaps
										</span>
									</div>
								))}
						</div>
					</div>
				)}
				{metrics.engagement.swaps.popularTokenPairs.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Popular token pairs
						</h3>
						<p className="text-muted-foreground text-sm">Most swapped tokens</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.swaps.popularTokenPairs
								.slice(0, 5)
								.map((pair) => (
									<div
										key={`${pair.fromToken}-${pair.toToken}`}
										className="flex items-center justify-between"
									>
										<span className="text-muted-foreground">
											{pair.fromToken} → {pair.toToken}
										</span>
										<span className="font-medium text-foreground">
											{pair.count} swaps · Avg{" "}
											{formatCurrency(pair.avgAmountUSD)}
										</span>
									</div>
								))}
						</div>
					</div>
				)}
				{metrics.engagement.swaps.commonFailureReasons.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">Swap failures</h3>
						<p className="text-muted-foreground text-sm">
							Failure rate:{" "}
							{formatPercent(metrics.engagement.swaps.failureRate)}
						</p>
						<ul className="mt-4 space-y-1 text-sm">
							{metrics.engagement.swaps.commonFailureReasons.map((reason) => (
								<li key={reason} className="text-muted-foreground">
									• {reason}
								</li>
							))}
						</ul>
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					On-chain Transaction Analytics
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Approval transactions"
						value={formatNumber(metrics.engagement.onchain.approvalTxCount)}
						subtitle="Token spending approvals"
					/>
					<StatCard
						title="Purchase transactions"
						value={formatNumber(metrics.engagement.onchain.purchaseTxCount)}
						subtitle="Completed hypercert purchases"
					/>
					<StatCard
						title="Tip transactions"
						value={formatNumber(metrics.engagement.onchain.tipTxCount)}
						subtitle={`Platform fees: ${formatNumber(
							metrics.engagement.onchain.platformFeesCollected,
						)} collected`}
					/>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<StatCard
						title="Unique hypercerts purchased"
						value={formatNumber(
							metrics.engagement.onchain.uniqueHypercertsFromPayments,
						)}
						subtitle="Distinct hypercerts from payment flows"
					/>
					<StatCard
						title="Unique orders completed"
						value={formatNumber(
							metrics.engagement.onchain.uniqueOrdersCompleted,
						)}
						subtitle="Distinct marketplace orders filled"
					/>
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Error Analytics
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Connection errors"
						value={formatNumber(metrics.engagement.errors.connectionErrors)}
						subtitle="Wallet connection failures"
					/>
					<StatCard
						title="Chain switch errors"
						value={formatNumber(metrics.engagement.errors.chainSwitchErrors)}
						subtitle="Network switching issues"
					/>
					<StatCard
						title="Upload error rate"
						value={formatPercent(metrics.engagement.errors.uploadErrorRate)}
						subtitle={`${formatNumber(
							metrics.engagement.errors.largeFileFailures,
						)} large file failures`}
					/>
				</div>
				{metrics.engagement.errors.topValidationErrors.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Top validation errors
						</h3>
						<p className="text-muted-foreground text-sm">
							Most common form validation issues
						</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.errors.topValidationErrors.map((error) => (
								<div
									key={`${error.field}-${error.message}`}
									className="flex items-center justify-between"
								>
									<div className="flex-1">
										<span className="font-medium text-foreground">
											{error.field}
										</span>
										<span className="ml-2 text-muted-foreground">
											{error.message}
										</span>
									</div>
									<span className="font-medium text-foreground">
										{error.count}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
				{metrics.engagement.errors.errorsByStep.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Errors by payment step
						</h3>
						<p className="text-muted-foreground text-sm">
							Payment flow error distribution
						</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.errors.errorsByStep.map((step) => (
								<div
									key={step.step}
									className="flex items-center justify-between"
								>
									<span className="text-muted-foreground">{step.step}</span>
									<span className="font-medium text-foreground">
										{step.errorCount} errors ({formatPercent(step.errorRate)})
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Time-Based Activity Patterns
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<StatCard
						title="Peak hour"
						value={`${metrics.engagement.patterns.peakHour}:00`}
						subtitle="Most active hour (UTC)"
					/>
					<StatCard
						title="Peak day"
						value={metrics.engagement.patterns.peakDay}
						subtitle="Most active day of week"
					/>
					<StatCard
						title="Weekday vs Weekend"
						value={formatNumber(
							metrics.engagement.patterns.weekdayVsWeekend.weekdayEvents,
						)}
						subtitle={`Weekday events · ${formatNumber(
							metrics.engagement.patterns.weekdayVsWeekend.weekendEvents,
						)} weekend`}
					/>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-3">
					<StatCard
						title="Daily active users"
						value={formatNumber(metrics.engagement.patterns.dailyActiveUsers)}
						subtitle="Unique wallets (24h)"
					/>
					<StatCard
						title="Weekly active users"
						value={formatNumber(metrics.engagement.patterns.weeklyActiveUsers)}
						subtitle="Unique wallets (7d)"
					/>
					<StatCard
						title="Monthly active users"
						value={formatNumber(metrics.engagement.patterns.monthlyActiveUsers)}
						subtitle="Unique wallets (30d)"
					/>
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-sans font-semibold text-muted-foreground text-sm uppercase">
					Referrer & Browser Analytics
				</h2>
				{metrics.engagement.geo.topReferrers.length > 0 && (
					<div className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">Top referrers</h3>
						<p className="text-muted-foreground text-sm">
							Traffic sources with conversion rates
						</p>
						<div className="mt-4 space-y-2 text-sm">
							{metrics.engagement.geo.topReferrers.map((ref) => (
								<div
									key={ref.referrer}
									className="flex items-center justify-between"
								>
									<span className="text-muted-foreground">{ref.referrer}</span>
									<span className="font-medium text-foreground">
										{ref.count} sessions · {formatPercent(ref.conversionRate)}{" "}
										conversion
									</span>
								</div>
							))}
						</div>
					</div>
				)}
				{metrics.engagement.geo.topUserAgents.length > 0 && (
					<div className="mt-4 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
						<h3 className="font-semibold text-foreground">
							Browser distribution
						</h3>
						<p className="text-muted-foreground text-sm">User agent analysis</p>
						<div className="mt-4 flex flex-wrap gap-6">
							{metrics.engagement.geo.topUserAgents.map((ua) => (
								<div key={ua.browser}>
									<p className="text-muted-foreground text-xs uppercase">
										{ua.browser}
									</p>
									<p className="font-semibold text-foreground text-lg">
										{formatNumber(ua.count)}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</section>
		</main>
	);
}
