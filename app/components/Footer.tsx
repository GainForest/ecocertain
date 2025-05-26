import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

const Footer = () => {
	return (
		<>
			<footer className="relative flex items-center justify-center overflow-hidden bg-background">
				<MotionWrapper
					type="div"
					className="absolute bottom-[-50%] left-[50%] h-[50%] w-[50%] translate-x-[-50%] rounded-full bg-green-500 blur-3xl"
					initial={{ opacity: 0, scale: 0.4, x: "-50%" }}
					animate={{ opacity: 0.75, scale: 1, x: "-50%" }}
					transition={{ duration: 3 }}
				/>
				<div className="flex w-full max-w-6xl flex-col items-center justify-between p-8 sm:flex-row">
					<div className="mb-8 flex flex-col items-center sm:mb-0 sm:items-start">
						<Link href={"/"} passHref className="flex items-center gap-2">
							<Image
								src="/assets/media/images/logo.svg"
								className="h-8 w-auto"
								alt="Gainforest"
								width={500}
								height={500}
							/>
						</Link>
						<p className="pt-2 font-baskerville font-bold text-base">
							By GainForest.Earth
						</p>
					</div>
					<section className="flex flex-col items-center gap-2 md:items-end">
						<ul className="flex flex-row items-center gap-2">
							{siteConfig.footerLinks.map((footerLink) => {
								if (footerLink.icon) {
									return (
										<li key={footerLink.title}>
											<Link
												href={footerLink.url}
												target={footerLink.openInNewTab ? "_blank" : "_self"}
												className="flex h-8 w-16 items-center justify-center rounded-lg bg-muted hover:bg-primary/20"
											>
												<footerLink.icon className="h-4 w-4" />
											</Link>
										</li>
									);
								}
								return null;
							})}
						</ul>
						<ul className="flex flex-col space-x-0 md:flex-row md:space-x-2">
							{siteConfig.footerLinks.map((footerLink) => {
								if (footerLink.icon) {
									return null;
								}
								const { title, url, openInNewTab } = footerLink;
								return (
									<li key={title}>
										<a
											href={url}
											target={openInNewTab ? "_blank" : "_self"}
											rel="noopener noreferrer"
											className={cn(
												buttonVariants({ variant: "link" }),
												"group flex items-center justify-between gap-2 text-lg",
											)}
											aria-label={`Open ${title} in a new tab`}
										>
											{title}
											{openInNewTab && (
												<>
													<span className="sr-only">(opens in a new tab)</span>
													<ArrowUpRight
														size={18}
														className="group-hover:-translate-y-0.5 ml-1 opacity-70 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:opacity-100"
														aria-hidden="true"
													/>
												</>
											)}
										</a>
									</li>
								);
							})}
						</ul>
					</section>
				</div>
			</footer>
		</>
	);
};

export default Footer;
