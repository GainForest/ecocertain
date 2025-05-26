import { getDataSuffix } from "@divvi/referral-sdk";

const dataSuffix = getDataSuffix({
  consumer: "0x60b979De2c961Ac884E6a5D921cDbfA0f454EAA4",
  providers: [
    "0x0423189886d7966f0dd7e7d256898daeee625dca",
    "0xc95876688026be9d6fa7a7c33328bd013effa2bb",
    "0x5f0a55fad9424ac99429f635dfb9bf20c3360ab8",
  ],
});

export const DIVVI_DATA_SUFFIX = dataSuffix;
