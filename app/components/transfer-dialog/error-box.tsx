import { CircleAlert } from "lucide-react";

export const ErrorBox = ({ message }: { message: string }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-muted p-4 text-center">
			<CircleAlert size={36} className="opacity-50" />
			<span className="font-bold text-muted-foreground">{message}</span>
		</div>
	);
};
