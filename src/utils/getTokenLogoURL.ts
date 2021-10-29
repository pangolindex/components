export const getTokenLogoURL = (address: string) =>
  address ? `https://raw.githubusercontent.com/pangolindex/tokens/main/assets/${address}/logo.png` : '';
