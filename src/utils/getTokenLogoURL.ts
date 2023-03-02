import { LogoSize, PANGOLIN_TOKENS_REPO_RAW_BASE_URL, ZERO_ADDRESS } from 'src/constants';

export const getTokenLogoURL = (address: string, chainId: number, size: LogoSize = 24) =>
  `${PANGOLIN_TOKENS_REPO_RAW_BASE_URL}/main/assets/${chainId}/${address || ZERO_ADDRESS}/logo_${size}.png`;
