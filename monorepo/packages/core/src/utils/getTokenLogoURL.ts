import { LogoSize, PANGOLIN_TOKENS_REPO_RAW_BASE_URL, ZERO_ADDRESS } from 'src/constants';

export function getTokenLogoURL(address: string, chainId: number, size: LogoSize = 24) {
  return `${PANGOLIN_TOKENS_REPO_RAW_BASE_URL}/main/assets/${chainId}/${address || ZERO_ADDRESS}/logo_${size}.png`;
}
