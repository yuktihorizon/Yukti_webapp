export function isCustomCraftProduct(product) {
  if (!product) return false;
  const categoryName =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || "";
  const text = [product.name, product.series, categoryName].join(" ").toLowerCase();
  return text.includes("custom craft");
}
