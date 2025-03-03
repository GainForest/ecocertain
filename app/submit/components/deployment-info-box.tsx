import { Card } from "@/components/ui/card";
import {
	BadgeDollarSign,
	Eye,
	EyeOff,
	FileText,
	HandHeart,
	Heart,
	type LucideProps,
	Settings,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import type React from "react";

interface DeploymentInfoBoxProps {
	className?: string;
}

const ListItem = ({
	Icon,
	label,
}: {
	Icon: React.FC<LucideProps>;
	label: string;
}) => {
	return (
		<li className="flex items-center gap-2 text-sm">
			<Icon className="shrink-0 text-primary" size={18} />
			<span>{label}</span>
		</li>
	);
};
export const DeploymentInfoBox = ({ className }: DeploymentInfoBoxProps) => {
	return (
		<Card className={className}>
			<div className="p-4">
				<h3 className="mb-4 font-medium">
					After you mint your hypercert, you will be able to:
				</h3>
				<ul className="space-y-3">
					<ListItem Icon={Sparkles} label="Display your impact on the world" />
					<ListItem
						Icon={BadgeDollarSign}
						label="List it for sale on the marketplace"
					/>
					<ListItem
						Icon={ShieldCheck}
						label="Register it for approval by GainForest"
					/>
				</ul>

				<div className="mt-6">
					<h3 className="mb-3 font-medium">The community:</h3>
					<ul className="space-y-3">
						<ListItem
							Icon={Eye}
							label="Can view the impact that you have made"
						/>
						<ListItem Icon={Heart} label="Can fund your hypercert" />
					</ul>
				</div>
			</div>
		</Card>
	);
};
