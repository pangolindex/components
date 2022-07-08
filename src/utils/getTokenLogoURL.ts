import { LogoSize, PANGOLIN_TOKENS_REPO_RAW_BASE_URL } from 'src/constants';

export const getTokenLogoURL = (address: string, chainId: number, size: LogoSize = 24) =>
  `${PANGOLIN_TOKENS_REPO_RAW_BASE_URL}/main/assets/${chainId}/${address}/logo_${size}.png`;
