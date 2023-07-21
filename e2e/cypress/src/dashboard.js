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
} = selectors.dashboard;
let { nativeTokenArr, gasTokenArr, nativeTokenDeatilsArr } = data.dashboard;

function newsLinks(startPoint, endPoint, link, assertMsg) {
  cy.get(newsBtn).then((news) => {
    for (var i = startPoint; i < endPoint; i++) {
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
  for (var i = 0; i <= 3; i++) {
    cy.get(nativeTokenDeatils).contains(nativeTokenDeatilsArr[i]).should('be.visible');
  }
  cy.get(detailsMenuClose).click();
  cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[native]);

  //Showing status connected
  cy.get(walletAddress).click();
  cy.request('GET', 'https://snowtrace.io/address/0x33CCa68A49B348ec247E0d1216936B5eF5638C60').then((res) => {
    expect(res.status).to.equal(200);
    cy.get(changeBtn).contains('Change').click();
    cy.get(walletConnected).should('have.css', 'background-color', 'rgb(39, 174, 96)');
    cy.get(accountMenuClose).click();
  });
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
export { newsLinks, socialLinks, nativeDetails, connectWalletftn };
