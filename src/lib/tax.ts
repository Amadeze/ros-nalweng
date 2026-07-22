export function calculateTax(
  subtotal: number,
  invoiceDiscount: number,
  taxType: string,
  customTaxRate: number | null | undefined,
  pphType: string | null | undefined
) {
  const taxableAmount = Math.max(0, subtotal - invoiceDiscount);
  let taxRate = 0;
  
  if (taxType === "PPN_11") taxRate = 11;
  else if (taxType === "PPN_12") taxRate = 12;
  else if (taxType === "CUSTOM" && customTaxRate) taxRate = customTaxRate;
  
  const taxAmount = (taxableAmount * taxRate) / 100;
  
  let pphWithholding = 0;
  if (pphType === "PPH_21") pphWithholding = (taxableAmount * 2.5) / 100;
  else if (pphType === "PPH_23") pphWithholding = (taxableAmount * 2) / 100;
  
  return {
    taxAmount,
    taxType,
    taxRate,
    taxableAmount,
    pphType,
    pphWithholding
  };
}
