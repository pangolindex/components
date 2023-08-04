import selectors from '../fixtures/selectors.json';
import data from '../fixtures/pangolin-data.json';

let {
  newsBtn,
  newsLinks1,
  newsNextBtn,
  socialMediaLinks,
  sideMenuCollapse,
  sideMenuExpand,
  walletAddress,
  nativeToken,
  nativeTokenLogo,
  nativeTokenDeatils,
  nativeTokenBalance,
  detailsMenuClose,
  gasToken,
  changeBtn,
  walletConnected,
  accountMenuClose,
  connectToWallet,
  connectWallet,
  connectToMetamask,
  connected,
  swapSideMenu,
  tokenSearch,
} = selectors.dashboard;
let { tokensToSwap, selectTokensValue } = selectors.swap;
let { nativeTokenArr, gasTokenArr, nativeTokenDeatilsArr } = data.dashboard;
let { swapValue, sellTokenValue, buyTokenValue, fromToken, gasTokenName } = data.swap;
let { createPairToken1, createPairToken2, addliquidityToken1, addliquidityToken2, addliquidityValue } = data.pools;

function newsLinks(startPoint, endPoint, link, assertMsg) {
  cy.get(newsBtn).then((news) => {
    for (let i = startPoint; i < endPoint; i++) {
      cy.get(news).find(newsNextBtn).click({ force: true });
      cy.wait(1000);
    }
    cy.get(newsLinks1).then((newsAssert) => {
      cy.get(newsAssert).contains(link).scrollIntoView().invoke('removeAttr', 'target').click({ force: true });
      cy.contains(assertMsg).should('be.visible');
    });
  });
}

function socialLinks(iteration, socialLinkArray) {
  cy.get(sideMenuCollapse)
    .should((visible) => {
      expect(visible).to.be.visible;
    })
    .then((sidemenu) => {
      cy.get(sidemenu).trigger('mouseover');
      cy.get(sideMenuExpand).should('be.visible');
    });
  cy.get(socialMediaLinks)
    .eq(iteration)
    .invoke('removeAttr', 'target')
    .then((test) => {
      if (iteration === 1) {
        cy.request('GET', 'https://t.me/pangolindexV2').then((res) => {
          expect(res.status).to.equal(200);
        });
      } else {
        cy.get(test).click();
        cy.url().should('include', `${socialLinkArray}`);
      }
    });
}

function nativeDetails(native) {
  cy.get(walletAddress)
    .invoke('text')
    .then((text) => {
      const walletAddressText = text.trim();
      cy.contains(walletAddressText).should('be.visible');
    });

  //Native token details
  cy.get(nativeToken).invoke('text').should('contain', nativeTokenArr[native]);
  cy.get(nativeToken).contains(nativeTokenArr[native]).click();
  cy.get(nativeTokenLogo, { timeout: 20000 }).should('be.visible');
  cy.get(nativeTokenDeatils).should('not.be.empty');
  cy.get(nativeTokenLogo).should('have.attr', 'alt', `${nativeTokenArr[native]} logo`);
  cy.get(nativeTokenBalance, { timeout: 20000 }).should('be.visible');
  cy.get(nativeTokenBalance).should('not.be.empty');
  cy.wait(5000);
  for (let i = 0; i <= 3; i++) {
    cy.get(nativeTokenDeatils).contains(nativeTokenDeatilsArr[i]).should('be.visible');
  }
  cy.get(detailsMenuClose).click();
  cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[native]);

  //Showing status connected
  cy.get(walletAddress).click();
  cy.get(accountViewOnExplorer).each((page) => {
    cy.request(page.prop('href')).as('link');
  });
  cy.get('@link').should((response) => {
    expect(response.status).to.eq(200);
  });
  cy.get(changeBtn).contains('Change').click();
  cy.get(walletConnected).should('have.css', 'background-color', 'rgb(39, 174, 96)');
  cy.get(accountMenuClose).click();
}

function connectWalletftn() {
  // MetaMask connection
  cy.get(connectToWallet).click();
  cy.get(connectToMetamask).contains('Metamask').click();
  cy.get(connectWallet).click();

  // Switch to Metamask window and accept access
  cy.switchToMetamaskWindow();
  cy.acceptMetamaskAccess().should('be.true');
  cy.switchToCypressWindow();

  // Verify successful connection
  cy.get(connected).should('not.be.empty');
  cy.wait(5000);
}

function checkTokenBalanceftn() {
  cy.visit('/');
  cy.get(swapSideMenu).click();
  connectWalletftn();
  cy.get(tokensToSwap).eq(0).contains('AVAX').click();
  cy.get(tokenSearch).eq(0).clear().type(fromToken);
  cy.wait(10000);
  cy.get(selectTokensValue, { timeout: 30000 })
    .invoke('text')
    .then((text) => {
      const tokenBalance = parseFloat(text);
      if (tokenBalance > 0.0 && tokenBalance < swapValue) {
        throw new Error('Insufficient token balance. Tests terminated: Change the swap value');
      }
      if (tokenBalance > 0.0 && tokenBalance < sellTokenValue) {
        throw new Error('Insufficient token balance. Tests terminated: Change the sell token value');
      }
      if (tokenBalance > 0.0 && tokenBalance < buyTokenValue) {
        throw new Error('Insufficient token balance. Tests terminated: Change the buy token value');
      }
      if (tokenBalance === 0.0) {
        throw new Error('Insufficient token balance. Tests terminated: Acquire the token balance');
      }
    });
  cy.get(selectTokensValue, { timeout: 30000 }).click();
  cy.get(tokensToSwap).eq(0).contains(fromToken).click();
  cy.get(tokenSearch).eq(0).clear().type(gasTokenName);
  cy.get(selectTokensValue, { timeout: 30000 })
    .invoke('text')
    .then((text) => {
      const tokenBalance = parseFloat(text);
      if (tokenBalance < 0.2) {
        throw new Error('Insufficient GAS Fee. Tests terminated: Acquire the GAS balance');
      }
    });
  cy.disconnectMetamaskWalletFromAllDapps();
}

function checkTokenBalancePoolftn() {
  cy.visit('/');
  cy.get(swapSideMenu).click();
  connectWalletftn();
  cy.get(tokensToSwap).eq(0).contains('AVAX').click();
  cy.wait(10000);
  const poolTokensArr = [createPairToken1, createPairToken2, addliquidityToken1, addliquidityToken2];
  for (let i = 0; i < poolTokensArr.length; i++) {
    cy.get(tokenSearch).eq(0).clear().type(poolTokensArr[i]);
    cy.get(selectTokensValue, { timeout: 30000 })
      .invoke('text')
      .then((text) => {
        const tokenBalance = parseFloat(text);
        if (tokenBalance > 0.0 && tokenBalance < addliquidityValue) {
          throw new Error('Insufficient token balance. Tests terminated: Change the Add liquidity value');
        }
        if (tokenBalance === 0.0) {
          throw new Error(
            `Insufficient token balance. Tests terminated: Acquire the ${poolTokensArr[i]} token balance`,
          );
        }
      });
  }
  cy.get(selectTokensValue, { timeout: 30000 }).click();
  cy.get(tokensToSwap).eq(0).contains(addliquidityToken2).click();
  cy.get(tokenSearch).eq(0).clear().type(gasTokenName);
  cy.get(selectTokensValue, { timeout: 30000 })
    .invoke('text')
    .then((text) => {
      const tokenBalance = parseFloat(text);
      if (tokenBalance < 0.2) {
        throw new Error('Insufficient GAS Fee. Tests terminated: Acquire the GAS balance');
      }
    });
  cy.disconnectMetamaskWalletFromAllDapps();
}

export { newsLinks, socialLinks, nativeDetails, connectWalletftn, checkTokenBalanceftn, checkTokenBalancePoolftn };
