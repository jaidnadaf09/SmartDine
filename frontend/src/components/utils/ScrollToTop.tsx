import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // force scroll reset on every navigation
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // also reset any scrollable containers
    document.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);

      if (
        style.overflow === "auto" ||
        style.overflow === "scroll" ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll"
      ) {
        el.scrollTop = 0;
      }
    });
  }, [location.key]); // key ensures trigger even on same route click

  return null;
}
