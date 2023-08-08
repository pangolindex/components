import React from 'react';
import { Box, Text } from 'src/components';
import { ThemeColorsType } from 'src/theme';
import { Separator, StyledLogo, TitleWrapper } from './styleds';

interface Props {
  color?: ThemeColorsType;
  title: string;
  subtitle?: string;
  logo: string;
}

export default function Title({ color, title, subtitle, logo }: Props) {
  return (
    <>
      <TitleWrapper>
        <Box>
          <Text fontSize={[28, 22]} fontWeight={700} lineHeight="33px" color={color ? color : 'text1'}>
            {title}
          </Text>
          {subtitle && (
            <Text fontSize={[16, 14]} fontWeight={500} color={color ? color : 'text1'}>
              {subtitle}
            </Text>
          )}
        </Box>
        <StyledLogo src={logo} size={'48px'} />
      </TitleWrapper>
      <Separator />
    </>
  );
}
