export const generateDescription = (name: string, category: string): string => {
  const safeName = name || 'dish';
  const safeCategory = category || 'food';
  return `Delicious ${safeName} prepared with rich flavors, perfect for ${safeCategory} lovers.`;
};
