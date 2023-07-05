import selectors from '../fixtures/selectors.json'
import data from '../fixtures/pangolin-data.json'

let {settingBtn, slippageField, tradeDetails, tradeDetailsValues, toEstimated, unitPrice, tokensToSwap, selectTokens, fromInput, confirmSwap, confirmSwapDetails, confirmSwapMsg, confirmSwapBtn, priceField, swapBtn, limitPrice, TransactionSubmitted, transactionLinks, notification, notificationViewOnExplorer, sellTokenDetailsValues, openBtn, openOrders, openOrdersSwitch, openOrderSwitched, limitOrderDetails, amountInTokensSwap, cancelOrderbtn, cancelOrderMsg, executionPrice, cancelOrderBtnPopup, cancellingOrderMsg, tokenSearch} = selectors.swap
let { sellTokenDetailsArr, limitOrderDetailsArr} = data.swap
function switchingValues (selectIter, headerAssert, token) {
    cy.get('div[class="sc-eCYdqJ sc-dkdnUF fEptdj gilYEX"] div[class="sc-eCYdqJ fEptdj"]').within( $banner => {
        cy.wrap($banner).find(`div[class="sc-eCYdqJ fEptdj"]:nth-child(${selectIter})`).within( fromToken => {
            cy.get(fromToken).contains('div[class="sc-eCYdqJ jqkPHT"]', `${headerAssert}`).should('be.visible').within( fromTokenValBtn => {
                cy.get(fromTokenValBtn).find(' ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').then(fromTokenVal => {
                    cy.get(fromTokenVal).find('span.token-symbol-container').should('contain', `${token}`)
                })       
            })  
        })
    })
}

function tokenDisable (iter, value, token, toTokon) {
    switchingValues(iter, value, token)
    cy.get('div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').eq(toTokon).click()
    cy.get('div[class="sc-eCYdqJ sc-iNFqmR fEptdj hMCpHj"]').should('have.attr','disabled')
}

function tokenSwitching (iter, value, token, toTokon) {
    switchingValues(iter, value, token)
    cy.get('div[class="sc-eCYdqJ fEptdj"] div[class="sc-eCYdqJ jqkPHT"] ~ div[class="sc-eCYdqJ sc-gKXOVf fEptdj cjBzGg"] button.open-currency-select-button').eq(toTokon).click()
    cy.get('div[class="sc-jSMfEi icpGcW"]').contains('AVAX').click()
}

function slippage(type, selector, message){
    cy.get(settingBtn).click()
    cy.get('div[class="sc-jSMfEi bjuyXL"]').should("contain","Settings")
    cy.get(slippageField).eq(0).clear().type(type)
    cy.get(selector).should('have.text', message)
}

function disconnectWallet (fromSelector, toSelector){
    cy.get(fromSelector).should(fromValue => {
        // From field
        expect(fromValue).have.attr('placeholder','0.00')
    
    })
    cy.get(toSelector).should(toValue => {
        // To field
        expect(toValue).have.attr('placeholder','0.00')
    })
}

function connectWallet1 (fromSelector, toSelector, connectWalletBtnSel) {
    disconnectWallet(fromSelector, toSelector)
    cy.get(connectWalletBtnSel).should(enterAmountBtn => {
        expect(enterAmountBtn).to.contain('Connect Wallet')
        expect(enterAmountBtn).have.css('background-color','rgb(255, 200, 0)')
    })
}

function notificationftn(msg) {
    const regexPattern = new RegExp(`.*${msg}.*`);
    cy.get(notification, { timeout: 30000 }).contains(regexPattern).should('be.visible')
    cy.get(notificationViewOnExplorer).each(page => {
      cy.request(page.prop('href')).as('link');
    });
    cy.get('@link').should(response => {
      expect(response.status).to.eq(200);
    });
}

function successfulCardftn(successBtnSelector, explorerLink){
        cy.get(TransactionSubmitted).contains("Transaction Submitted").should('be.visible');
        cy.get(explorerLink).each(page => {
            cy.request(page.prop('href')).as('link');
        });
        cy.get('@link').should(response => {
            expect(response.status).to.eq(200);
        });
        confirmBtnftn(successBtnSelector, "Close")
        cy.get(confirmSwapDetails).contains("Trade").should('be.visible') 
}

function tradeDetailsftn (fromToken, toTokon) {
    cy.get(tradeDetails).contains("Minimum Received").should('be.visible');
    cy.get(tradeDetailsValues).should('contain', toTokon);
    cy.get(tradeDetails).contains("Price Impact").should('be.visible');
    cy.get(tradeDetails).contains("Liquidity Provider Fee").should('be.visible');
    cy.get(tradeDetailsValues).should('contain', fromToken);
    cy.get(tradeDetailsValues).eq(0).should('not.be.empty');
    cy.get(tradeDetailsValues).eq(1).should('not.be.empty');
    cy.get(toEstimated).contains("To (estimated)").should('be.visible'); 
    cy.get(unitPrice).contains("Price").should('be.visible');
    cy.get(unitPrice).contains(toTokon).should('be.visible'); 
}

function selectTokensftn (fromTokenTitle, toTokenTitle){
    cy.get(tokensToSwap).eq(0).contains("AVAX").click()
    cy.get(tokenSearch).eq(0).type(fromTokenTitle)
    cy.get(selectTokens).eq(0).should('have.attr', 'title', fromTokenTitle).should('be.visible', { timeout: 30000 })
    cy.get(selectTokens).eq(0).should('have.attr', 'title', fromTokenTitle).click()
    cy.get(tokensToSwap).eq(1).contains("USDC").click()
    cy.get(tokenSearch).eq(0).type(toTokenTitle)
    cy.get(selectTokens).eq(0).should('have.attr', 'title', toTokenTitle).should('be.visible', { timeout: 30000 })
    cy.get(selectTokens).eq(0).should('have.attr', 'title', toTokenTitle).click()
    cy.get(fromInput).type('0.01')
}

function confirmTradeDetailsftn (toTokenTitle){
    cy.get(confirmSwap).contains("Confirm Swap").should('be.visible')
    cy.get(confirmSwapDetails).contains("PNG").should('be.visible')
    cy.get(confirmSwapDetails).contains("USDt").should('be.visible')
    cy.get(confirmSwapDetails).eq(1).should('not.be.empty');
    cy.get(confirmSwapDetails).eq(3).should('not.be.empty');
    const regexPattern = new RegExp(`.*${toTokenTitle}.*`);
    cy.get(confirmSwapMsg).invoke('text').should('match', regexPattern);
}

function confirmBtnftn (btnSelector,btnName){
    cy.get(btnSelector).contains(btnName).should('be.visible');
    cy.get(btnSelector).contains(btnName).should("have.css", "background-color", "rgb(255, 200, 0)");
    cy.get(btnSelector).contains(btnName).click()
    
}

function limitSellBuyTokenftn(x, y) {
    cy.get(priceField).invoke('val').then((value) => {
        const decrementedValue = parseFloat(value) - 0.01; // deccrement the retrieved value
        const incrementedValue = parseFloat(value) + 0.01; // inccrement the retrieved value
        const limitArr = [decrementedValue, incrementedValue]
        cy.get(priceField).clear().type(limitArr[x].toFixed(2)); // Re-enter the value
        if (x === 0) {
            cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should('be.visible');
            cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
        }
        else if (x === 1) {
            cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should('be.visible');
            cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
          }
        else {
            cy.get(swapBtn).contains("Invalid condition").should('not.exist');
          }
        //Greater than market 
        cy.get(priceField).clear().type(limitArr[y].toFixed(2)); // Re-enter the incremented value
        cy.get(swapBtn).contains("Place Order").should('be.visible')
        cy.get(swapBtn).contains("Place Order").should("have.css", "background-color", "rgb(255, 200, 0)");
        });
}

function limitSellBuyTradeDetailsftn() {
    for (var i = 0; i <= 4; i++) {
        cy.get(tradeDetails).contains(sellTokenDetailsArr[i]).should('be.visible')
        cy.get(sellTokenDetailsValues).should('not.be.empty')
    }
}

function limitSellBuyConfirmDetailsftn(token1, token2) {
    // Confirm card
    cy.get(confirmSwap).contains("Confirm Order").should('be.visible')
    cy.get(confirmSwapDetails).contains(token1).should('be.visible')
    cy.get(confirmSwapDetails).contains(token2).should('be.visible')
    cy.get(confirmSwapDetails).should('not.be.empty')
  
    // Validate limit price
    cy.get(limitPrice).contains("Limit Price").should('be.visible')
    cy.get(limitPrice).eq(1).invoke('text').then((text) => {
      const pattern = new RegExp(`1\\s+${token2}\\s+=\\s+\\d+(\\.\\d+)?\\s+${token1}`);
      expect(text).to.match(pattern);
    });
  
    // Switching limit price
    cy.get(limitPrice).contains("Limit Price").click()
    cy.get(limitPrice).eq(1).invoke('text').then((textUpdated) => {
      const patternUpdated = new RegExp(`1\\s+${token1}\\s+=\\s+\\d+(\\.\\d+)?\\s+${token2}`);
      expect(textUpdated).to.match(patternUpdated);
    })
  
    cy.get(limitPrice).eq(2).should('contain', '0x33...8C60')
  }

function limitOrdersftn(navBtn,status){
    cy.get(confirmSwapDetails).eq(2).contains("Limit Orders").should('be.visible')
    cy.get(openBtn).eq(2).contains(navBtn).should("have.css", "background-color", "rgb(17, 17, 17)")
    cy.get(openOrders).eq(0).should('contain', status);
    cy.get(openOrdersSwitch).eq(0).click()
    //Limit Order Details 
    for (var i = 0; i <= 3; i++){
        cy.get(limitOrderDetails).eq(i + 9).contains(limitOrderDetailsArr[i]).should('be.visible')
    }
    cy.get(amountInTokensSwap).should("not.be.empty");
    cy.get(amountInTokensSwap).eq(3).contains(status).should('be.visible')
}

function cancelLimitOrderftn(){
    cy.get(cancelOrderbtn).contains("Cancel Order").click()
        cy.get(confirmSwapDetails).contains("Cancel Order").should('be.visible')
        cy.get(cancelOrderMsg).invoke('text').then((text) => {
            const pattern = /\b(USDC|PNG)\b/;
            expect(text).to.match(pattern);
          });
       cy.get(executionPrice).contains("Execution Price").should('be.visible') 
       cy.get(cancelOrderBtnPopup).contains("Cancel Order").should('be.visible').click()
       cy.get(cancellingOrderMsg).contains("Cancelling order...").should('be.visible')
}

export {switchingValues, tokenDisable, tokenSwitching, slippage, disconnectWallet, connectWallet1, tradeDetailsftn, selectTokensftn, confirmTradeDetailsftn, confirmBtnftn, limitSellBuyTokenftn, limitSellBuyConfirmDetailsftn, notificationftn,successfulCardftn, limitSellBuyTradeDetailsftn, limitOrdersftn, cancelLimitOrderftn}
