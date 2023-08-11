import { Box } from "@components/components";
import styled from "styled-components";

export const Frame = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`