/**
 * Fly To Cart Animation Utility
 * Creates a visual clone of the source element and animates it towards the target element.
 */
export const flyToCart = (
  sourceEl: HTMLElement,
  cartEl: HTMLElement,
  onComplete?: () => void
) => {
  if (!sourceEl || !cartEl) return;

  // ⚡ Safety Guard: Prevent UI spam by ensuring only one animation runs at a time
  if (document.querySelector(".flying-dish-clone")) return;

  const cartRect = cartEl.getBoundingClientRect();

  // Create a visual clone (prefer images if found, otherwise the whole card)
  const dishImage = sourceEl.querySelector("img") || sourceEl;
  const clone = dishImage.cloneNode(true) as HTMLElement;
  const imageRect = dishImage.getBoundingClientRect();

  // Initial Styling
  clone.classList.add("flying-dish-clone");
  clone.style.position = "fixed";
  clone.style.left = `${imageRect.left}px`;
  clone.style.top = `${imageRect.top}px`;
  clone.style.width = `${imageRect.width}px`;
  clone.style.height = `${imageRect.height}px`;
  clone.style.zIndex = "10000";
  clone.style.pointerEvents = "none";
  clone.style.borderRadius = "12px";
  clone.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
  clone.style.opacity = "1";
  clone.style.transition = "all 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

  document.body.appendChild(clone);

  // Calculate destination offsets
  const deltaX = (cartRect.left + cartRect.width / 2) - (imageRect.left + imageRect.width / 2);
  const deltaY = (cartRect.top + cartRect.height / 2) - (imageRect.top + imageRect.height / 2);

  // ✈️ Trigger Animation with curved path (Paper Airplane Feel)
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.15) rotate(-15deg)`;
    clone.style.opacity = "0.3";
    clone.style.filter = "blur(1px)";
  });

  // 🧹 Cleanup and Feedback
  setTimeout(() => {
    clone.remove();
    if (onComplete) onComplete();
  }, 750);
};
