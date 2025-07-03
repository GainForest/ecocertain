import { Send, ShieldCheck } from "lucide-react";
import React from "react";

const Sidebar = () => {
	return (
		<div className="relative flex h-full items-center justify-center">
			<Send size={100} className="text-beige-muted-foreground opacity-50" />
			<div className="absolute right-4 bottom-4 left-4 text-center font-baskerville font-bold text-beige-muted-foreground text-xl">
				Transfer
			</div>
		</div>
	);
};

export default Sidebar;
