import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: ".env.development" });
    console.log("Environment: development (loaded .env.development)");
} else {
    dotenv.config();
    console.log("Environment: production (loaded .env)");
}
