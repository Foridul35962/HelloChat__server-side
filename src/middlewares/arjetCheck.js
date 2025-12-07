import aj from "../utils/arjet.js";
import { isSpoofedBot } from "@arcjet/inspect";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiErrors from "../utils/ApiError.js";

const arcjetProtection = asyncHandler(async (req, res, next) => {

    if (req.headers['x-dev-client'] === 'postman') {
        return next();
    }

    try {
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                throw new ApiErrors(429, "Rate limit exceeded. Please try again later.");
            }
            else if (decision.reason.isBot()) {
                throw new ApiErrors(403, "Bot access denied.");
            }
            else {
                throw new ApiErrors(403, "Access denied by security policy.");
            }
        }

        if (decision.ip.isHosting()) {
            throw new ApiErrors(403, "Hosting / VPN IPs are not allowed.");
        }

        if (decision.results.some(isSpoofedBot)) {
            throw new ApiErrors(403, "Malicious bot activity detected.");
        }

        next();
    } catch (error) {
        console.log("Arcjet protection error:", error);
        next(error);
    }
});

export default arcjetProtection;