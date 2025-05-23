import SelfQRcodeWrapper, { SelfAppBuilder, SelfQRcode } from "@selfxyz/qrcode";
import { v4 as uuidv4 } from "uuid";

// Generate a unique user ID
const userId = uuidv4();

// Create a SelfApp instance using the builder pattern
const selfApp = new SelfAppBuilder({
  appName: "Ecocertain",
  scope: "gainforest-scope",
  endpoint: "https://ecocertain.xyz/api/self-xyz/verify",
  endpointType: "https",
  logoBase64: "https://ecocertain.xyz/assets/media/images/logo.svg", // Optional, accepts also PNG url
  userId,
}).build();
