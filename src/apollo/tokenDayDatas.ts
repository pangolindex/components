import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default

export const GET_TOKEN_DAY_DATAS = gql`
  query tokenDayDatas($token: String!) {
    tokenDayDatas(first: 7, orderBy: date, orderDirection: desc, where: { token: $token }) {
      id
      date
      priceUSD
      token {
        symbol
      }
    }
  }
`;
