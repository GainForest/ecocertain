import { HistoryIcon } from "lucide-react";
import React from "react";

const History = () => {
	return (
		<div className="w-full">
			<div className="flex items-center gap-2">
				<HistoryIcon /> <span>History</span>
			</div>
		</div>
	);
};

export default History;
