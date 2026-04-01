export function resourceTotal(quantity: number, unitCost: number) {
  return quantity * unitCost;
}

export function purchaseNetPrice(grossPrice: number, discount: number) {
  return grossPrice * (1 - discount / 100);
}

export function purchaseTotal(quantity: number, netPrice: number) {
  return quantity * netPrice;
}
