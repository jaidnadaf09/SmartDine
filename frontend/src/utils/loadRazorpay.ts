const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Lazily loads the Razorpay checkout SDK only when a payment is initiated.
 * Prevents the "preloaded but not used" console warning by avoiding global eager loading.
 * Safe to call multiple times — returns immediately if SDK is already loaded.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Script tag exists but may still be loading
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SRC}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    // Inject script on demand
    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.id = "razorpay-script";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
