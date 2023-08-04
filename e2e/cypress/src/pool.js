import selectors from '../fixtures/selectors.json';
import data from '../fixtures/pangolin-data.json';

let { selectTokens, toEstimated, amountInTokensSwap, confirmSwap, toTokenChain, swappingMsg } = selectors.swap;
let {
  createPairToken1,
  createPairToken2,
  createAddTokenValues,
  createAddConfirmBtn,
  createAddMaxBtn,
  createAddOutputMsg,
  createAddBtn,
  createAddAmountField,
  createAddSupplyBtn,
  createAddApproveBtn,
  createAddTokenNamesValues,
  importToken1,
  importSelectToken,
  poolFound,
  importTokenLogo,
  importTokenName,
  importTokenDetails,
  importTokenValues,
  importManageBtn,
  createApproveBtn,
  depositDetails,
  depositDetailsValues,
  farmPGL,
  farmApproveBtn,
  farmPercentBtns,
  farmPercentBtnsActive,
  poolSelectToken,
  approveBlock,
  noLiquidityBtn,
  tokensValue,
} = selectors.pools;
let { depositDetailsArr, depositDetailsValuesArr, addliquidityValue } = data.pools;
let { percentBtnArr } = data.swap;

function selectTokensPoolftn(token1, token2, pairBtn) {
  cy.get(createPairToken1).eq(0).click();
  cy.get(poolSelectToken).should('have.attr', 'placeholder', 'Search').type(token1);
  cy.get(selectTokens).contains(token1).click();
  cy.get(createPairToken2).contains('Select a Token').click();
  cy.get(poolSelectToken).should('have.attr', 'placeholder', 'Search').type(token2);
  cy.get(selectTokens).contains(token2).click();
  cy.get(createAddBtn, { timeout: 50000 })
    .invoke('text')
    .then((text) => {
      const buttonName = text;
      if (buttonName === pairBtn) {
        cy.get(createAddBtn, { timeout: 30000 }).should('contain', pairBtn).click();
      } else {
        throw new Error(`Select the tokens accordingly. Tests terminated: Change the tokens for ${pairBtn}`);
      }
    });
}

function selectTokensImportPoolftn(token1, token2, btnName) {
  cy.get(importToken1).eq(0).click();
  cy.get(poolSelectToken).should('have.attr', 'placeholder', 'Search').type(token1);
  cy.get(selectTokens).contains(token1).click();
  cy.get(importSelectToken).contains('Select a token').click();
  cy.get(poolSelectToken).should('have.attr', 'placeholder', 'Search').type(token2);
  cy.get(selectTokens).contains(token2).click();
  cy.wait(5000);
  if (btnName === 'No pool found.')
    cy.get('div[class="sc-kEjbQP fPkORu"]+div').then(($element) => {
      const elementClass = $element.attr('class');
      if (elementClass === 'sc-kEjbQP sc-eTLXjT iqcNnm kLFKTE') {
        cy.get(noLiquidityBtn).should('contain', 'No pool found.');
      } else if (elementClass === 'sc-kEjbQP sc-erkanz iqcNnm iqyxLc') {
        throw new Error(`Select the tokens accordingly. Tests terminated: Change the tokens for ${btnName}`);
      } else {
        throw new Error(
          'Change the selectors used in selectTokensImportPoolftn() for divs of Pool Found! & No pool found: Sibling of sc-kEjbQP fPkORu selector',
        );
      }
    });

  if (btnName === 'Pool Found!')
    cy.get('div[class="sc-kEjbQP fPkORu"]+div').then(($element) => {
      const elementClass = $element.attr('class');
      if (elementClass === 'sc-kEjbQP sc-erkanz iqcNnm iqyxLc') {
        cy.get(poolFound).contains('Pool Found!', { timeout: 30000 }).should('be.visible');
      } else if (elementClass === 'sc-kEjbQP sc-eTLXjT iqcNnm kLFKTE') {
        throw new Error(`Select the tokens accordingly. Tests terminated: Change the tokens for ${btnName}`);
      } else {
        throw new Error(
          'Change the selectors used in selectTokensImportPoolftn() for divs of Pool Found! & No pool found: Sibling of sc-kEjbQP fPkORu selector',
        );
      }
    });
}

function pairDetailsCardftn(startIndex) {
  for (let i = startIndex; i <= startIndex + 1; i++) {
    cy.get(createAddAmountField).eq(i).clear();
    cy.get(createAddTokenValues)
      .eq(i)
      .invoke('text')
      .should('match', /^\d+(\.\d+)?$/);
    cy.get(amountInTokensSwap)
      .eq(i)
      .invoke('text')
      .should('match', /^(0|\d+(.\d+)?|-)(%)?$/);
    cy.get(createAddConfirmBtn).should('contain', 'Enter an amount');
    cy.get(createAddMaxBtn).eq(startIndex).should('be.visible').click();
    cy.get(amountInTokensSwap).eq(i).invoke('text').should('match', /\d+/);
    cy.get(createAddAmountField).eq(i).invoke('val').should('match', /\d+/);
  }
}

function importTokenDetailsftn(token1, token2) {
  cy.get(poolFound).contains('Pool Found!').should('be.visible');
  cy.get(importTokenLogo).eq(0).should('have.attr', 'alt', `${token2} logo`);
  cy.get(importTokenLogo).eq(1).should('have.attr', 'alt', `${token1} logo`);
  cy.get(importTokenName).should(($div) => {
    expect($div).to.contain(token1);
    expect($div).to.contain('/');
    expect($div).to.contain(token2);
  });

  const poolFoundArr = ['PGL', 'Your pool share:', token1, token2];
  for (let i = 0; i < poolFoundArr.length; i++) {
    cy.get(importTokenDetails).contains(poolFoundArr[i]).should('be.visible');
    cy.get(importTokenValues).eq(i).should('not.be.empty');
  }

  cy.get(importManageBtn).contains('Manage').click();
}

function createEnterValuesftn(cardName, supplyBtn, token1, token2) {
  for (let index = 2; index <= 3; index++) {
    // Entering values
    cy.get(createAddTokenValues)
      .eq(index)
      .invoke('text')
      .then((text) => {
        const incrementedValue = parseFloat(text) + 10;
        // Insufficient balance

        cy.get(createAddAmountField).eq(index).clear().type(incrementedValue);

        // Wait for the "Insufficient balance" message to be visible
        cy.get(createAddConfirmBtn)
          .eq(3)
          .contains(new RegExp(/Insufficient [\w.]+ balance/i), { timeout: 10000 })
          .should('be.visible');

        // Move the cy.type() inside the then bloc
        cy.get(createAddAmountField).eq(index).clear();
        cy.get(createAddAmountField).eq(index).type(addliquidityValue);
      });
  }

  // Verify and approve if needed
  cy.wait(5000);
  cy.contains('Supply').then(($element) => {
    const backgroundColor = Cypress.$($element).css('background-color');

    if (backgroundColor === 'rgb(229, 229, 229)') {
      cy.get(approveBlock).then(($element) => {
        const elementClass = $element.attr('class');
        cy.log(elementClass);
        if (elementClass === 'sc-fubCzh kbRxVC') {
          for (let i = 0; i <= 1; i++) {
            const btnSelector = i === 0 ? createApproveBtn : createAddApproveBtn;

            cy.get(btnSelector, { timeout: 30000 })
              .eq(0)
              .then(($buttons) => {
                const approveButton = Cypress.$($buttons).filter((_, button) => {
                  const buttonText = Cypress.$(button).text().trim();
                  return buttonText.startsWith('Approve');
                });

                if (approveButton.length) {
                  cy.wrap(approveButton).click();
                  cy.wait(5000);
                  cy.confirmMetamaskPermissionToSpend();
                  cy.wait(15000);
                }
              });
          }
        } else if (elementClass === 'sc-fubCzh gsRRav') {
          cy.get(createAddApproveBtn, { timeout: 30000 }).then(($buttons) => {
            const approveButton = Cypress.$($buttons).filter((_, button) => {
              const buttonText = Cypress.$(button).text().trim();
              return buttonText.startsWith('Approve');
            });

            if (approveButton.length) {
              cy.wrap(approveButton).click();
              cy.wait(5000);
              cy.confirmMetamaskPermissionToSpend();
              cy.wait(15000);
            }
          });
        } else {
          cy.log('Undefined Selector: Change Approve Button selectors for createEnterValuesftn() ');
        }
      });
    }
  });

  //Supply button
  cy.get(createAddApproveBtn, { timeout: 50000 }).eq(1).should('contain', 'Supply').click();

  // You will receive card

  cy.get(confirmSwap).invoke('text').should('include', cardName);
  cy.get(tokensValue).should('be.visible');
  cy.get(createAddOutputMsg)
    .contains('Output is estimated. If the price changes by more than 0.5% your transaction will revert.')
    .should('be.visible');
  cy.get(importManageBtn).should('contain', supplyBtn).click();
  cy.get(swappingMsg)
    .contains(new RegExp(`^Supplying \\d+\\.\\d+ ${token1} and \\d+\\.\\d+ ${token2}$`))
    .should('be.visible');
}

function depositDetailsftn() {
  //Deposit Details
  cy.get(confirmSwap).contains('Deposit').should('be.visible');
  cy.get(toEstimated)
    .invoke('text')
    .should('match', /^Balance: \d+\.\d+$/);
  for (let i = 0; i <= 2; i++) {
    cy.get(depositDetails).eq(i).should('contain', depositDetailsArr[i]);
    cy.get(depositDetailsValues).eq(i).invoke('text').should('match', new RegExp(depositDetailsValuesArr[i]));
  }
}

function percentBtnsFtn() {
  //Trade buttons
  cy.get(farmPGL).clear();
  cy.get(farmApproveBtn).contains('Approve').should('have.css', 'background-color', 'rgb(229, 229, 229)');
  cy.get(farmApproveBtn).contains('Enter an amount').should('be.visible');

  //Percent buttons
  for (let i = 3; i > 0; i--) {
    cy.get(farmPercentBtns).eq(percentBtnArr[i]).click();
    cy.get(farmPercentBtnsActive).should(($element) => {
      expect($element.css('background-color')).to.equal('rgb(255, 200, 0)');
    });
    cy.get(farmPGL).should('not.have.value', '0.00');
    cy.get(importManageBtn).contains('Approve').should('have.css', 'background-color', 'rgb(255, 200, 0)');
  }
}
export {
  selectTokensPoolftn,
  pairDetailsCardftn,
  createEnterValuesftn,
  selectTokensImportPoolftn,
  importTokenDetailsftn,
  depositDetailsftn,
  percentBtnsFtn,
};
