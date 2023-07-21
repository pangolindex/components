import selectors from '../fixtures/selectors.json';
import data from '../fixtures/pangolin-data.json';

let { testnetBtn } = selectors.dashboard;
let {
  settingBtn,
  slippageField,
  tradeDetails,
  tradeDetailsValues,
  ordersOpen,
  toEstimated,
  unitPrice,
  tokensToSwap,
  selectTokens,
  fromInput,
  confirmSwap,
  confirmSwapDetails,
  confirmSwapMsg,
  priceField,
  swapBtn,
  limitPrice,
  TransactionSubmitted,
  notification,
  notificationViewOnExplorer,
  sellTokenDetailsValues,
  openBtn,
  openOrders,
  limitOrderDetails,
  amountInTokensSwap,
  cancelOrderbtn,
  cancelOrderMsg,
  executionPrice,
  cancelOrderBtnPopup,
  cancellingOrderMsg,
  tokenSearch,
  approveBtn,
  limitTokensLogo,
  selectTokenBtn,
  toInput,
  buyBtn,
  orderTokenNames,
} = selectors.swap;
let { sellTokenDetailsArr, limitOrderDetailsArr, fromToken, toToken } = data.swap;

function switchingValues(selectIter, headerAssert, token) {
  cy.get('div[class="sc-eCYdqJ sc-dkdnUF fEptdj gilYEX"] div[class="sc-eCYdqJ fEptdj"]').within(($banner) => {
    cy.wrap($banner)
      .find(`div[class="sc-eCYdqJ fEptdj"]:nth-child(${selectIter})`)
      .within((fromToken) => {
        cy.get(fromToken)
          .contains('div[class="sc-eCYdqJ jqkPHT"]', `${headerAssert}`)
          .should('be.visible')
          .within((fromTokenValBtn) => {
            cy.get(fromTokenValBtn)
              .find(' ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button')
              .then((fromTokenVal) => {
                cy.get(fromTokenVal).find('span.token-symbol-container').should('contain', `${token}`);
              });
          });
      });
  });
}

function tokenDisable(iter, value, token, toTokon) {
  switchingValues(iter, value, token);
  cy.get(
    'div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button',
  )
    .eq(toTokon)
    .click();
  cy.get('div[class="sc-eCYdqJ sc-iNFqmR fEptdj hMCpHj"]').should('have.attr', 'disabled');
}

function tokenSwitching(iter, value, token, toTokon) {
  switchingValues(iter, value, token);
  cy.get(
    'div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button',
  )
    .eq(toTokon)
    .click();
  cy.get('div[class="sc-jSMfEi icpGcW"]').contains('AVAX').click();
}

function slippage(type, selector, message) {
  cy.get(settingBtn).click();
  cy.get('div[class="sc-jSMfEi bjuyXL"]').should('contain', 'Settings');
  cy.get(slippageField).eq(0).clear().type(type);
  cy.get(selector).should('have.text', message);
}

function disconnectWallet(fromSelector, toSelector) {
  cy.get(fromSelector).should((fromValue) => {
    // From field
    expect(fromValue).have.attr('placeholder', '0.00');
  });
  cy.get(toSelector).should((toValue) => {
    // To field
    expect(toValue).have.attr('placeholder', '0.00');
  });
}

function connectWallet1(fromSelector, toSelector, connectWalletBtnSel) {
  disconnectWallet(fromSelector, toSelector);
  cy.get(connectWalletBtnSel).should((enterAmountBtn) => {
    expect(enterAmountBtn).to.contain('Connect Wallet');
    expect(enterAmountBtn).have.css('background-color', 'rgb(255, 200, 0)');
  });
}

function notificationftn(RegularExp) {
  const regexPattern = new RegExp(RegularExp);
  cy.get(notification, { timeout: 30000 }).contains(regexPattern).should('be.visible');
  cy.get(notificationViewOnExplorer).each((page) => {
    cy.request(page.prop('href')).as('link');
  });
  cy.get('@link').should((response) => {
    expect(response.status).to.eq(200);
  });
}

function successfulCardftn(successBtnSelector, explorerLink) {
  cy.get(TransactionSubmitted).contains('Transaction Submitted').should('be.visible');
  cy.get(explorerLink).each((page) => {
    cy.request(page.prop('href')).as('link');
  });
  cy.get('@link').should((response) => {
    expect(response.status).to.eq(200);
  });
  confirmBtnftn(successBtnSelector, 'Close');
  cy.get(confirmSwapDetails).contains('Trade').should('be.visible');
}

function tradeDetailsftn(fromToken, toTokon) {
  cy.get(tradeDetails, { timeout: 30000 }).contains('Minimum Received').should('be.visible');
  cy.get(tradeDetailsValues).should('contain', toTokon);
  cy.get(tradeDetails).contains('Price Impact').should('be.visible');
  cy.get(tradeDetails).contains('Liquidity Provider Fee').should('be.visible');
  cy.get(tradeDetailsValues).should('contain', fromToken);
  cy.get(tradeDetailsValues).eq(0).should('not.be.empty');
  cy.get(tradeDetailsValues).eq(1).should('not.be.empty');
  cy.get(toEstimated).contains('To (estimated)').should('be.visible');
  cy.get(unitPrice).contains('Price').should('be.visible');
  cy.get(unitPrice).contains(toTokon).should('be.visible');
}

function selectTokensftn(fromTokenTitle, toTokenTitle, value) {
  cy.get(tokensToSwap).eq(0).contains('AVAX').click();
  cy.get(tokenSearch).eq(0).type(fromTokenTitle);
  cy.get(selectTokens).eq(0).click();
  cy.get(tokensToSwap).eq(1).contains('USDC').click();
  cy.get(tokenSearch).eq(0).type(toTokenTitle);
  cy.get(selectTokens).eq(0).click();
  cy.get(fromInput).type(value);
}

function confirmTradeDetailsftn(token1, token2) {
  cy.get(confirmSwap).contains('Confirm Swap').should('be.visible');
  cy.get(confirmSwapDetails).contains(token1).should('be.visible');
  cy.get(confirmSwapDetails).contains(token2).should('be.visible');
  cy.get(confirmSwapDetails).eq(1).should('not.be.empty');
  cy.get(confirmSwapDetails).eq(3).should('not.be.empty');
  const regexPattern = new RegExp(`.*${token2}.*`);
  cy.get(confirmSwapMsg).invoke('text').should('match', regexPattern);
}

function confirmBtnftn(btnSelector, btnName) {
  cy.get(btnSelector).contains(btnName).should('be.visible');
  cy.get(btnSelector).contains(btnName).should('have.css', 'background-color', 'rgb(255, 200, 0)');
  cy.get(btnSelector).contains(btnName).click({ force: true });
  cy.wait(5000);
}

function limitSellBuyTokenftn(x, y) {
  cy.get(priceField)
    .should('not.have.value', '', { timeout: 30000 })
    .invoke('val')
    .then((value) => {
      const decrementedValue = parseFloat(value) - 0.01; // deccrement the retrieved value
      const incrementedValue = parseFloat(value) + 0.01; // inccrement the retrieved value
      const limitArr = [decrementedValue, incrementedValue];
      cy.get(priceField).clear().type(limitArr[x].toFixed(2)); // Re-enter the value
      if (x === 0) {
        cy.get(swapBtn).contains('Only possible to place sell orders above market rate').should('be.visible');
        cy.get(swapBtn)
          .contains('Only possible to place sell orders above market rate')
          .should('have.css', 'background-color', 'rgb(229, 229, 229)');
      } else if (x === 1) {
        cy.get(swapBtn).contains('Only possible to place buy orders below market rate').should('be.visible');
        cy.get(swapBtn)
          .contains('Only possible to place buy orders below market rate')
          .should('have.css', 'background-color', 'rgb(229, 229, 229)');
      } else {
        cy.get(swapBtn).contains('Invalid condition').should('not.exist');
      }

      //Greater than market
      cy.get(priceField).clear().type(limitArr[y].toFixed(2)); // Re-enter the incremented value
      cy.wait(5000);

      // Verify and approve if needed
      approveftn();

      // swap button
      cy.get(swapBtn).contains('Place Order').should('be.visible');
      cy.get(swapBtn).contains('Place Order').should('have.css', 'background-color', 'rgb(255, 200, 0)');
    });
}

function limitSellBuyTradeDetailsftn() {
  for (var i = 0; i <= 4; i++) {
    cy.get(tradeDetails).contains(sellTokenDetailsArr[i]).should('be.visible');
    cy.get(sellTokenDetailsValues).should('not.be.empty');
  }
}

function limitSellBuyConfirmDetailsftn(token1, token2) {
  // Confirm card
  cy.get(confirmSwap).contains('Confirm Order').should('be.visible');
  cy.get(confirmSwapDetails).contains(token1).should('be.visible');
  cy.get(confirmSwapDetails).contains(token2).should('be.visible');
  cy.get(confirmSwapDetails).should('not.be.empty');

  // Validate limit price
  cy.get(limitPrice).contains('Limit Price').should('be.visible');
  cy.get(limitPrice)
    .eq(1)
    .invoke('text')
    .then((text) => {
      const pattern = new RegExp(`1\\s+${token2}\\s+=\\s+\\d+(\\.\\d+)?\\s+${token1}`);
      expect(text).to.match(pattern);
    });

  // Switching limit price
  cy.get(limitPrice).contains('Limit Price').click();
  cy.get(limitPrice)
    .eq(1)
    .invoke('text')
    .then((textUpdated) => {
      const patternUpdated = new RegExp(`1\\s+${token1}\\s+=\\s+\\d+(\\.\\d+)?\\s+${token2}`);
      expect(textUpdated).to.match(patternUpdated);
    });

  cy.get(limitPrice)
    .eq(2)
    .invoke('text')
    .then((text) => {
      const walletAddressText = text.trim();
      cy.contains(walletAddressText).should('be.visible');
    });
}

function limitOrdersftn(navBtn, status, logo1, logo2) {
  // Limit Order Details
  cy.get(confirmSwapDetails).eq(2).contains('Limit Orders').should('be.visible');
  cy.get(limitTokensLogo).eq(0).should('have.attr', 'alt', `${logo1} logo`).click();
  cy.get(limitTokensLogo).eq(1).should('have.attr', 'alt', `${logo2} logo`).click();
  for (var i = 0; i <= 3; i++) {
    cy.get(limitOrderDetails)
      .eq(i + 9)
      .contains(limitOrderDetailsArr[i])
      .should('be.visible');
  }
  cy.get(amountInTokensSwap).should('not.be.empty');
  cy.get(amountInTokensSwap).eq(3).contains(`${status}`).should('be.visible');

  // Open/close order details
  cy.get(orderTokenNames)
    .eq(0)
    .invoke('text')
    .then((text) => {
      const pattern = new RegExp(`Buy ${logo2} with ${logo1}`);
      expect(text).to.match(pattern);
    });
  cy.get(openOrders).eq(0).contains(`${status}`).should('be.visible');
  cy.get(openBtn).contains(navBtn).should('have.css', 'background-color', 'rgb(17, 17, 17)');
}

function cancelLimitOrderftn() {
  cy.get(ordersOpen)
    .eq(0)
    .should('contain', 'open')
    .then(($element) => {
      const text = $element.text();
      if (text.includes('(P)')) {
        cy.wait(20000);
      }
    });
  cy.get(ordersOpen).eq(0).should('contain', 'open').click();
  cy.get(cancelOrderbtn).contains('Cancel Order').click();
  cy.get(confirmSwapDetails).contains('Cancel Order').should('be.visible');
  cy.get(cancelOrderMsg)
    .invoke('text')
    .then((text) => {
      const pattern = new RegExp(`Buy \\d+(?:\\.\\d+)? ${toToken} with \\d+(?:\\.\\d+)? ${fromToken}`);
      expect(text).to.match(pattern);
    });
  cy.get(executionPrice).contains('Execution Price').should('be.visible');
  cy.get(cancelOrderBtnPopup).contains('Cancel Order').should('be.visible').click();
  cy.get(cancellingOrderMsg).contains('Cancelling order...').should('be.visible');
}

function selectLimitTokensftn(token1, token2, amount, buy) {
  cy.get(testnetBtn).contains('LIMIT').click();
  if (buy === 1) {
    cy.get(buyBtn).contains('BUY').click();
  }
  cy.get(tokensToSwap).click();
  cy.get(tokenSearch).eq(0).type(token1);
  cy.get(selectTokens).contains(token1).click();
  cy.get(selectTokenBtn).contains('Select Token').click();
  cy.get(tokenSearch).eq(0).type(token2);
  cy.get(selectTokens).contains(token2).click();
  cy.get(fromInput).type(amount);
  cy.wait(5000);
  cy.get(priceField).should('not.have.value', '0.00', { timeout: 30000 });
  cy.get(toInput).should('not.have.value', '0.00', { timeout: 30000 });
}

function approveftn(check) {
  cy.get(approveBtn, { timeout: 30000 }).then(($buttons) => {
    const approveButton = Cypress.$($buttons).filter((_, button) => {
      const buttonText = Cypress.$(button).text().trim();
      return buttonText.startsWith('Approve');
    });

    if (approveButton.length) {
      // Token approval is required, perform approval process
      cy.wrap(approveButton).click();
      cy.wait(5000); // Wait for the approval process to complete
      if (check === 0) {
        cy.confirmMetamaskPermissionToSpend();
      } else if (check === 1) {
        cy.confirmMetamaskSignatureRequest();
      } else {
        cy.get(approveBtn).contains('Invalid condition').should('not.exist');
      }
      cy.wait(10000);
    }
  });
}

function enterAmountBtnftn() {
  const filedSelectors = [fromInput, toInput];
  // Enter an amount button
  for (let i = 0; i < 2; i++) {
    cy.get(filedSelectors[i])
      .invoke('val')
      .then(($value) => {
        expect($value).to.not.equal('0.00');
      });
    cy.get(swapBtn).contains('Enter an amount').should('be.visible');
    cy.get(swapBtn).contains('Enter an amount').should('have.css', 'background-color', 'rgb(229, 229, 229)');
  }
}

export {
  switchingValues,
  tokenDisable,
  tokenSwitching,
  slippage,
  disconnectWallet,
  connectWallet1,
  tradeDetailsftn,
  selectTokensftn,
  confirmTradeDetailsftn,
  confirmBtnftn,
  limitSellBuyTokenftn,
  limitSellBuyConfirmDetailsftn,
  notificationftn,
  successfulCardftn,
  limitSellBuyTradeDetailsftn,
  limitOrdersftn,
  cancelLimitOrderftn,
  selectLimitTokensftn,
  approveftn,
  enterAmountBtnftn,
};
