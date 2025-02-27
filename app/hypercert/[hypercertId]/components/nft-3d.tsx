import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { GlareCard } from "@/components/ui/glare-card";
import Image from "next/image";
import React from "react";

const NFT3D = ({ src }: { src: string }) => {
	return (
		<GlareCard>
			{/* <CardContainer>
        <CardBody className="rounded-xl shadow-xl">
          <CardItem className=""> */}
			<Image
				src={src}
				alt="Hypercert NFT"
				width={300}
				height={300}
				className="h-auto w-full max-w-sm"
			/>
			{/* </CardItem>
        </CardBody>
      </CardContainer> */}
		</GlareCard>
	);
};

export default NFT3D;
