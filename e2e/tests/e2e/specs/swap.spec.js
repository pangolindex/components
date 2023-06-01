import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
import { nativeDetails } from '../../../cypress/src/dashboard'
import { tradeDetailsftn } from '../../../cypress/src/swap'
import { selectTokensftn } from '../../../cypress/src/swap'
import { confirmTradeDetailsftn } from '../../../cypress/src/swap'
import { confirmBtnftn } from '../../../cypress/src/swap'
import { limitSellBuyTokenftn } from '../../../cypress/src/swap'

let { connectWallet,connectMetamask, connected, swapSideMenu, testnetBtn, walletAddress} = selectors.dashboard
let { tokensToSwap, selectTokens, selectTokensValue, selectTokensMenuClose, fromInput, toInput, swapBtn, percentBtns, percentBtnActive, tradeDetails, confirmSwap, confirmSwapDetails, confirmSwapMsg, confirmSwapBtn, swappingMsg, TransactionSubmitted, recentTransactions, transactionLinks, clearAll, transactionAppear, accountMenuCloseSwap, notification, notificationViewOnExplorer, transactionRejected, selectTokenBtn, priceField, sellTokenDetailsValues, limitPrice, tokenBalances} = selectors.swap
let { percentBtnArr, swapTokensArr, sellTokenDetailsArr} = data.swap

describe('Swap', () => {
    it.only('Connects with Metamask', () => {
        //Connect to MetaMask from swap page
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(connectWallet).click();
        cy.get(connectMetamask).click();
        cy.get(connected).should("not.be.empty");         
        //After switching, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        nativeDetails(0)
    })  

    it.only('Transaction Buttons on Trade card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.wait(10000);
        //Tokens along balances in select tokens card
        for (var i = 0; i <= 1; i++){
            cy.get(tokensToSwap).contains(swapTokensArr[i]).click()
            cy.get(selectTokens).contains(swapTokensArr[i]).should('be.visible')
            cy.get(selectTokensValue).should('not.be.empty')
            cy.get(selectTokensMenuClose).eq(0).click()
        }   
        //Enter an amount button
        cy.get(fromInput).should('have.attr', 'placeholder', '0.00')
        cy.get(toInput).should('have.attr', 'placeholder', '0.00')
        cy.get(swapBtn).contains("Enter an amount").should('be.visible')
        cy.get(swapBtn).contains("Enter an amount").should("have.css", "background-color", "rgb(229, 229, 229)")
        //Insufficient balance button
        cy.get(fromInput).type('100000')
        cy.get(swapBtn).contains("Insufficient AVAX balance").should('be.visible')
        cy.get(swapBtn).contains("Insufficient AVAX balance").should("have.css", "background-color", "rgb(229, 229, 229)")

    })

    it.only('Verify tokens with balance > 0 appear in the dropdown', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        for (var i = 0; i <= 1; i++) {
        cy.get(tokensToSwap).eq(i).click(); 
        cy.wait(15000);
        cy.get(tokenBalances)
          .each((option) => {
            cy.wrap(option).scrollIntoView().invoke('text').then((text) => {
              const balancePattern = /\d+\.\d+/; 
              if (balancePattern.test(text)) {
                cy.wrap(option).should('be.visible');
              }
            });
          });
          cy.get(selectTokensMenuClose).eq(0).click()
        }
    })

    it.only('Details on Trade card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        //Select tokens by their titles
        selectTokensftn("Pangolin", "TetherToken")
        //percent buttons
        for (var i = 0; i <= 3; i++) {
            cy.get(percentBtns).eq(percentBtnArr[i]).click();
            cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
            });
            cy.get(fromInput).should('not.have.value', '0.00');
            cy.get(toInput).should('not.have.value', '0.00');
            cy.wait(5000);
            //see details by tokens name
            tradeDetailsftn("PNG","USDt")
            //Swap button
            cy.get(swapBtn).contains("Swap").should('be.visible');
            cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        }               
    })

    it.only('Reject Transaction', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        selectTokensftn("Pangolin", "TetherToken")
        tradeDetailsftn("PNG","USDt")
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click()
        confirmTradeDetailsftn("USDt")
        //Confirm swap button
        confirmBtnftn("Confirm Swap")
        cy.wait(5000);
        //Reject transaction
        cy.rejectMetamaskTransaction();
        cy.get(transactionRejected).contains("Transaction rejected.").should('be.visible')  
        //Dismiss button
        confirmBtnftn("Dismiss")
        cy.get(confirmSwapDetails).contains("Trade").should('be.visible')  
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
    })

    it.only('Details on Confirm swap card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        selectTokensftn("Pangolin", "TetherToken")
        tradeDetailsftn("PNG","USDt")
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click()
        //Details on confirmswap card
        confirmTradeDetailsftn("USDt")
        //Confirm swap button
        // confirmBtnftn("Confirm Swap")
        // //Swapping message
        // cy.get(swappingMsg).invoke('text').should('match', /.*USDt.*/);
        // cy.wait(5000);
        // //cy.confirmMetamaskTransaction()
        // cy.wait(5000);
        // //Notification
        // cy.get(notification).eq(0).invoke('text').should('match', /.*USDt.*/); 
        // cy.get(notificationViewOnExplorer).each(page => {
        //     cy.request(page.prop('href')).as('link');
        // });
        // cy.get('@link').should(response => {
        //     expect(response.status).to.eq(200);
        // });
        // //Successful card
        // cy.get(TransactionSubmitted).contains("Transaction Submitted").should('be.visible');
        // cy.request('GET', 'https://snowtrace.io/tx/0xa1bd06abcf1c5ca902f0241ba184599fadbd4993b1903a562a8976bbc25f6e6b').then( res => {
        //     expect(res.status).to.equal(200)
        //   }) 
        // confirmBtnftn("Close")
        // cy.get(confirmSwapDetails).contains("Trade").should('be.visible')  
        //Recent Transactions
        // cy.get(walletAddress).contains('0x33...8C60').click()
        // cy.get(recentTransactions).contains("Recent Transactions").should('be.visible')  
        // //Transaction Links
        // cy.get(transactionLinks).each(page => {
        //         cy.request(page.prop('href')).as('link');
        //     });
        //     cy.get('@link').should(response => {
        //         expect(response.status).to.eq(200);
        //     });
        // //Clear all Transactions
        // cy.get(clearAll).contains("clear all").click()
        // cy.get(transactionAppear).contains("Your transactions will appear here...").should('be.visible')
        // cy.get(accountMenuCloseSwap).click()      
    })

    it.only('Details on Limit Sell card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(testnetBtn).contains("LIMIT").click()
        cy.get(tokensToSwap).click()
        cy.wait(20000);
        cy.get(selectTokens).contains("PNG").click()
        cy.get(selectTokenBtn).contains("Select Token").click()
        cy.get(selectTokens).contains("USDC").click()
        cy.get(fromInput).type('0.001')
        cy.wait(5000);
        cy.get(priceField).should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
        //Sell token detaisl
        for (var i = 0; i <= 4; i++) {
            cy.get(tradeDetails).contains(sellTokenDetailsArr[i]).should('be.visible')
            cy.get(sellTokenDetailsValues).should('not.be.empty')
        }
        //On market price 
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should('be.visible');
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
        //Less than market price
        limitSellBuyTokenftn(0, 1);
    })

    it('Sell token Confirm card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(testnetBtn).contains("LIMIT").click()
        cy.get(tokensToSwap).click()
        cy.wait(20000);
        cy.get(selectTokens).contains("PNG").click()
        cy.get(selectTokenBtn).contains("Select Token").click()
        cy.get(selectTokens).contains("USDC").click()
        cy.get(fromInput).type('0.001')
        cy.wait(5000);
        cy.get(priceField).should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
        cy.get(priceField).invoke('val').then((value) => {
        const incrementedValue = parseFloat(value) + 0.01; // inccrement the retrieved value
        cy.get(priceField).clear().type(incrementedValue.toFixed(2)); // Re-enter the incremented value
        cy.get(swapBtn).contains("Place Order").should('be.visible')
        cy.get(swapBtn).contains("Place Order").click()
        });
        //confirm card
        cy.get(confirmSwap).contains("Confirm Order").should('be.visible')
        cy.get(confirmSwapDetails).contains("PNG").should('be.visible')
        cy.get(confirmSwapDetails).contains("USDC").should('be.visible')
        cy.get(confirmSwapDetails).should('not.be.empty')
        cy.get(limitPrice).contains("Limit Price").should('be.visible')
        cy.get(limitPrice).eq(1).invoke('text').then((text) => {
          const pattern = /1\s+USDC\s+=\s+\d+(\.\d+)?\s+PNG/;
          expect(text).to.match(pattern);
        });
        //switching limit price
        cy.get(limitPrice).contains("Limit Price").click()
        cy.get(limitPrice).eq(1).invoke('text').then((textUpdated) => {
            const patternUpdated = /1\s+PNG\s+=\s+\d+(\.\d+)?\s+USDC/;
            expect(textUpdated).to.match(patternUpdated);
        })
        cy.get(limitPrice).eq(2).should('contain', '0x33...8C60')
        // //Executing on higher limit price
        // cy.get(confirmSwapBtn).contains("Confirm Order").click()
        // cy.get(swappingMsg).invoke('text').should('match', /\bPNG\b.*\bUSDC\b/);
        // cy.wait(5000);
        // cy.confirmMetamaskTransaction()
        // cy.wait(5000);
        // //Notification
        // cy.get(notification).eq(0).should("contain", "Sell order placed."); 
        // cy.get(notificationViewOnExplorer).each(page => {
        //     cy.request(page.prop('href')).as('link');
        // });
        // cy.get('@link').should(response => {
        //     expect(response.status).to.eq(200);
        // });
        // //Successful card
        // cy.get(TransactionSubmitted).contains("Transaction Submitted").should('be.visible');
        // cy.request('GET', 'https://snowtrace.io/tx/0xf5690d13de39a1a03c597836bf9120f7b456bf00529466b8a22c9862c0d876f9').then( res => {
        //     expect(res.status).to.equal(200)
        //   }) 
        // cy.get(confirmSwapBtn).contains("Close").should('be.visible');
        // cy.get(confirmSwapBtn).contains("Close").click() 
        // cy.get(confirmSwapDetails).contains("Trade").should('be.visible')  
    })
    
    it.only('Details on Limit Buy card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(testnetBtn).contains("LIMIT").click()
        cy.get('div[class="sc-iBaQBe KqBsY"]').contains("BUY").click()
        cy.get(tokensToSwap).click()
        cy.wait(20000);
        cy.get(selectTokens).contains("PNG").click()
        cy.get(selectTokenBtn).contains("Select Token").click()
        cy.get(selectTokens).contains("USDC").click()
        cy.get(fromInput).type('10')
        cy.wait(5000);
        cy.get(priceField).should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
        //buy token detaisl
        for (var i = 0; i <= 4; i++) {
            cy.get(tradeDetails).contains(sellTokenDetailsArr[i]).should('be.visible')
            cy.get(sellTokenDetailsValues).should('not.be.empty')
        }
        //On market price 
        cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should('be.visible');
        cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
        //Greater than the market price
        limitSellBuyTokenftn(1, 0);
    })

    it('Buy token Confirm card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(testnetBtn).contains("LIMIT").click()
        cy.get('div[class="sc-iBaQBe KqBsY"]').contains("BUY").click()
        cy.get(tokensToSwap).click()
        cy.wait(20000);
        cy.get(selectTokens).contains("PNG").click()
        cy.get(selectTokenBtn).contains("Select Token").click()
        cy.get(selectTokens).contains("USDC").click()
        cy.get(fromInput).type('10')
        cy.wait(5000);
        cy.get(priceField).should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
        cy.get(priceField).invoke('val').then((value) => {
        const decrementedValue = parseFloat(value) - 0.01; // deccrement the retrieved value
        cy.get(priceField).clear().type(decrementedValue.toFixed(2)); // Re-enter the decremented value
        cy.get(swapBtn).contains("Place Order").should('be.visible')
        cy.get(swapBtn).contains("Place Order").click()
        });
        //confirm card
        cy.get(confirmSwap).contains("Confirm Order").should('be.visible')
        cy.get(confirmSwapDetails).contains("PNG").should('be.visible')
        cy.get(confirmSwapDetails).contains("USDC").should('be.visible')
        cy.get(confirmSwapDetails).should('not.be.empty')
        cy.get(limitPrice).contains("Limit Price").should('be.visible')
        cy.get(limitPrice).eq(1).invoke('text').then((text) => {
          const pattern = /1\s+USDC\s+=\s+\d+(\.\d+)?\s+PNG/;
          expect(text).to.match(pattern);
        });
        //switching limit price
        cy.get(limitPrice).contains("Limit Price").click()
        cy.get(limitPrice).eq(1).invoke('text').then((textUpdated) => {
            const patternUpdated = /1\s+PNG\s+=\s+\d+(\.\d+)?\s+USDC/;
            expect(textUpdated).to.match(patternUpdated);
        })
        cy.get(limitPrice).eq(2).should('contain', '0x33...8C60')
        // //Executing on lower limit price
        // cy.get(confirmSwapBtn).contains("Confirm Order").click()
        // cy.get(swappingMsg).invoke('text').should('match', /\bPNG\b.*\bUSDC\b/);
        // cy.wait(5000);
        // cy.confirmMetamaskTransaction()
        // cy.wait(5000);
        // //Notification
        // cy.get(notification).eq(0).should("contain", "Sell order placed."); 
        // cy.get(notificationViewOnExplorer).each(page => {
        //     cy.request(page.prop('href')).as('link');
        // });
        // cy.get('@link').should(response => {
        //     expect(response.status).to.eq(200);
        // });
        // //Successful card
        // cy.get(TransactionSubmitted).contains("Transaction Submitted").should('be.visible');
        // cy.request('GET', 'https://snowtrace.io/tx/0xf5690d13de39a1a03c597836bf9120f7b456bf00529466b8a22c9862c0d876f9').then( res => {
        //     expect(res.status).to.equal(200)
        //   }) 
        // cy.get(confirmSwapBtn).contains("Close").should('be.visible');
        // cy.get(confirmSwapBtn).contains("Close").click() 
        // cy.get(confirmSwapDetails).contains("Trade").should('be.visible') 
    })

    it.only('Swap page', () => {
        //Connect to MetaMask from swap page
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        cy.get(percentBtns).eq(0).should('be.visible')
        
    })

}) 