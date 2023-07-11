import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
import { nativeDetails } from '../../../cypress/src/dashboard'
import { connectWalletftn } from '../../../cypress/src/dashboard'
import { tradeDetailsftn } from '../../../cypress/src/swap'
import { selectTokensftn } from '../../../cypress/src/swap'
import { confirmTradeDetailsftn } from '../../../cypress/src/swap'
import { confirmBtnftn } from '../../../cypress/src/swap'
import { limitSellBuyTokenftn } from '../../../cypress/src/swap'
import { limitSellBuyConfirmDetailsftn } from '../../../cypress/src/swap'
import { notificationftn } from '../../../cypress/src/swap'
import { successfulCardftn } from '../../../cypress/src/swap'
import { limitSellBuyTradeDetailsftn } from '../../../cypress/src/swap'
import { limitOrdersftn } from '../../../cypress/src/swap'
import { cancelLimitOrderftn } from '../../../cypress/src/swap'
import { selectLimitTokensftn } from '../../../cypress/src/swap'

let { swapSideMenu, testnetBtn, walletAddress, connectToWallet, connectToMetamask, connectWallet,connected, tokenSearch} = selectors.dashboard
let { tokensToSwap, approveBtn, selectTokens, selectTokensValue, selectTokensMenuClose, fromInput, toInput, swapBtn, percentBtns, percentBtnActive, confirmSwapDetails, confirmSwapBtn, swappingMsg, recentTransactions, transactionLinks, clearAll, transactionAppear, accountMenuCloseSwap, transactionRejected, selectTokenBtn, priceField, tokenBalances, buyBtn, swapSuccessfulTransactionLink, limitSuccessfulTransactionLink, cancelLimitSuccessfulTransactionLink} = selectors.swap
let { percentBtnArr, swapTokensArr} = data.swap

//To run each file
//npx  env-cmd -f env/.env npx synpress run --spec 'tests/e2e/specs/swap.spec.js' -cf synpress.json
describe('Swap', () => {
    it('Connect to Metamask', () => {
        cy.visit('/dashboard');
      
        // MetaMask connection
        cy.get(connectToWallet).click();
        cy.get(connectToMetamask).contains("Metamask").click();
        cy.get(connectWallet).click();
      
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
      
        // Verify successful connection
        cy.get(connected).should("not.be.empty");
      
        // Verify changed network details
        nativeDetails(0);
      });  

    it('Transaction Buttons on Trade card', () => {
        cy.visit('/dashboard');
      
        // Selecting swap side menu
        cy.get(swapSideMenu).click();
      
        connectWalletftn();
        cy.wait(10000);
      
        // Tokens along balances in select tokens card
        for (let i = 0; i <= 1; i++) {
          cy.get(tokensToSwap).contains(swapTokensArr[i]).click();
          cy.get(selectTokens).contains(swapTokensArr[i]).should('be.visible');
          cy.get(selectTokensValue, { timeout: 30000 }).should('not.be.empty');
          cy.get(selectTokensMenuClose).eq(0).click();
        }
      
        // Enter an amount button
        cy.get(fromInput).should('have.attr', 'placeholder', '0.00');
        cy.get(toInput).should('have.attr', 'placeholder', '0.00');
        cy.get(swapBtn).contains("Enter an amount").should('be.visible');
        cy.get(swapBtn).contains("Enter an amount").should("have.css", "background-color", "rgb(229, 229, 229)");
      
        // Insufficient balance button
        cy.get(fromInput).type('100000');
        cy.wait(5000);
        cy.get(swapBtn).contains("Insufficient AVAX balance").should('be.visible');
        cy.get(swapBtn).contains("Insufficient AVAX balance").should("have.css", "background-color", "rgb(229, 229, 229)");
      });

      it('Verify tokens with balance > 0 appear in the dropdown', () => {
        cy.visit('/dashboard');
        cy.get(swapSideMenu).click();
        connectWalletftn();
      
        for (let i = 0; i <= 1; i++) {
          cy.get(tokensToSwap).eq(i).click();
      
          cy.get(tokenBalances, { timeout: 30000 }).each((option) => {
            cy.wrap(option).scrollIntoView().invoke('text').then((text) => {
              const balancePattern = /\d+\.\d+/;
              if (balancePattern.test(text)) {
                cy.wrap(option).should('be.visible');
              }
            });
          });
      
          cy.get(selectTokensMenuClose).eq(0).click();
        }
      });

      it('Details on Trade card', () => {
        cy.visit('/dashboard');
        cy.get(swapSideMenu).click();
        connectWalletftn();
      
        // Select tokens by their titles
        selectTokensftn("Pangolin", "TetherToken");
      
        // Percent buttons
        for (let i = 0; i <= 3; i++) {
          cy.get(percentBtns).eq(percentBtnArr[i]).click();
          cy.wait(10000);
          cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
          });
          cy.get(fromInput).should('not.have.value', '0.00');
          cy.get(toInput).should('not.have.value', '0.00');
      
          // See details by token names
          tradeDetailsftn("PNG","USDt");
          
          // Verify and approve if needed
          cy.get(approveBtn, { timeout: 30000 }).then(($buttons) => {
          const approveButton = Cypress.$($buttons).filter((_, button) => {
          const buttonText = Cypress.$(button).text().trim();
          return buttonText.startsWith('Approve');
          });
  
         if (approveButton.length) {
         // Token approval is required, perform approval process
         cy.wrap(approveButton).click();
         cy.wait(5000); // Wait for the approval process to complete
         cy.confirmMetamaskPermissionToSpend()
         cy.wait(10000);
        }
        });

          // Swap button
          cy.get(swapBtn, { timeout: 30000 }).contains("Swap").should('be.visible');
          cy.get(swapBtn, { timeout: 30000 }).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        }
      });

      it('Reject Transaction', () => {
        cy.visit('/dashboard');
        cy.get(swapSideMenu).click();
        connectWalletftn();
        selectTokensftn("Pangolin", "TetherToken");
        tradeDetailsftn("PNG","USDt");
        cy.wait(15000);
      
        // Verify and approve if needed
        cy.get(approveBtn, { timeout: 30000 }).then(($buttons) => {
          const approveButton = Cypress.$($buttons).filter((_, button) => {
            const buttonText = Cypress.$(button).text().trim();
            return buttonText.startsWith('Approve');
          });
      
          if (approveButton.length) {
            // Token approval is required, perform approval process
            cy.wrap(approveButton).click();
            cy.wait(5000); // Wait for the approval process to complete
            cy.confirmMetamaskPermissionToSpend();
            cy.wait(10000);
            // Add assertions here to verify the approval process if needed
          }
        });
      
        // Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click();
      
        confirmTradeDetailsftn("USDt");
      
        // Confirm swap button
        confirmBtnftn(confirmSwapBtn, "Confirm Swap");
        cy.wait(5000);
      
        // Reject transaction
        cy.rejectMetamaskTransaction();
        cy.get(transactionRejected).contains("Transaction rejected.").should('be.visible');
      
        // Dismiss button
        confirmBtnftn(confirmSwapBtn, "Dismiss");
        cy.get(confirmSwapDetails).contains("Trade").should('be.visible');
      
        // Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
      });

      it('Details on Confirm swap card', () => {
        cy.visit('/dashboard');
        cy.get(swapSideMenu).click();
        connectWalletftn();
        selectTokensftn("Pangolin", "TetherToken");
        tradeDetailsftn("PNG","USDt");
        cy.wait(15000);
      
        // Verify and approve if needed
        cy.get(approveBtn, { timeout: 30000 }).then(($buttons) => {
          const approveButton = Cypress.$($buttons).filter((_, button) => {
            const buttonText = Cypress.$(button).text().trim();
            return buttonText.startsWith('Approve');
          });
      
          if (approveButton.length) {
            // Token approval is required, perform approval process
            cy.wrap(approveButton).click();
            cy.wait(5000); // Wait for the approval process to complete
            cy.confirmMetamaskPermissionToSpend();
            cy.wait(10000);
            // Add assertions here to verify the approval process if needed
          }
        });
      
        // Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click();
      
        // Details on confirmswap card
        confirmTradeDetailsftn("USDt");
      
        // Confirm swap button
        confirmBtnftn(confirmSwapBtn, "Confirm Swap");
      
        // Swapping message
        cy.get(swappingMsg).invoke('text').should('match', /.*USDt.*/);
        cy.wait(10000);
        cy.confirmMetamaskTransaction();
        cy.wait(10000);
      
        // Notification
        notificationftn("USDt");
      
        // Successful card
        cy.wait(5000);
        successfulCardftn(confirmSwapBtn, swapSuccessfulTransactionLink);
      
        // Recent Transactions
        cy.get(walletAddress).contains('0xa0...b166').click();
        cy.get(recentTransactions).contains("Recent Transactions").should('be.visible');
      
        // Transaction Links
        cy.get(transactionLinks).each(page => {
          cy.request(page.prop('href')).as('link');
        });
        cy.get('@link').should(response => {
          expect(response.status).to.eq(200);
        });
      
        // Clear all Transactions
        cy.get(clearAll).contains("(clear all)").click();
        cy.get(transactionAppear).contains("Your transactions will appear here...").should('be.visible');
        cy.get(accountMenuCloseSwap).click();
      });

    it('Details on Limit Sell card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "0.001", 0)

        //Sell token detaisl
        limitSellBuyTradeDetailsftn()

        //On market price 
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should('be.visible');
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
        
        //Less than market price
        limitSellBuyTokenftn(0, 1);
    })

    it('Sell token Confirm card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()
        
        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "0.001", 0)

        //Less than market price
        limitSellBuyTokenftn(0, 1);

        //Placing the order
        cy.get(swapBtn).contains("Place Order").click()

        //confirm card
        limitSellBuyConfirmDetailsftn("PNG", "USDC")

        //Executing on higher limit price
        cy.get(confirmSwapBtn).contains("Confirm Order").click()
        cy.get(swappingMsg).invoke('text').should('match', /\bPNG\b.*\bUSDC\b/);
        cy.wait(5000);
        cy.confirmMetamaskTransaction()
        cy.wait(3000);

        //Notification
        notificationftn("Sell order placed.")
        cy.wait(5000);

        //Successful card
        successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)  
    })
    
    it('Details on Limit Buy card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "5", 1)

        //buy token detaisl
        limitSellBuyTradeDetailsftn()

        //On market price 
        cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should('be.visible');
        cy.get(swapBtn).contains("Only possible to place buy orders below market rate").should("have.css", "background-color", "rgb(229, 229, 229)");
        
        //Greater than the market price
        limitSellBuyTokenftn(1, 0);
    })

    it('Buy token Confirm card', () => {
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "5", 1)

        //Greater than the market price
        limitSellBuyTokenftn(1, 0);

        //Placing the order
        cy.get(swapBtn).contains("Place Order").click()

        //confirm card
        limitSellBuyConfirmDetailsftn("PNG", "USDC")

        //Executing on lower limit price
        cy.get(confirmSwapBtn).contains("Confirm Order").click()
        cy.get(swappingMsg).invoke('text').should('match', /\bPNG\b.*\bUSDC\b/);
        cy.wait(5000);
        cy.confirmMetamaskTransaction()
        cy.wait(3000);

        //Notification
        notificationftn("Buy order placed.")
        cy.wait(5000);

        // //Successful card
        successfulCardftn(confirmSwapBtn, limitSuccessfulTransactionLink)
    })

    it('Limit Order section', () => {
        //Connect to MetaMask from swap page
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "0.001", 0)
        
        //Less than the market price
        limitSellBuyTokenftn(0, 1);

        //Placing the order
        cy.get(swapBtn).contains("Place Order").click()

        //Executing on higher limit price
        cy.get(confirmSwapBtn).contains("Confirm Order").click()
        cy.wait(5000);
        cy.confirmMetamaskTransaction()
        cy.wait(3000);

        //Limit Orders OPEN
        limitOrdersftn("OPEN","open", "PNG", "USDC")
        
        //Limit Orders EXECUTED 
        //cy.get(buyBtn).contains("EXECUTED").click()
        //limitOrdersftn("EXECUTED","executed", "PNG", "USDC")
        
        //Limit Orders CANCELLED 
        cy.get(buyBtn).contains("CANCELLED").click()
        limitOrdersftn("CANCELLED","cancelled", "PNG", "USDC")

    })

    it('Reject Cancelling Limit Order', () => {
        //Connect to MetaMask from swap page
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "0.001", 0)
        
        //Less than the market price
        limitSellBuyTokenftn(0, 1);

        //Placing the order
        cy.get(swapBtn).contains("Place Order").click()

        //Executing on higher limit price
        cy.get(confirmSwapBtn).contains("Confirm Order").click()
        cy.wait(5000);
        cy.confirmMetamaskTransaction()
        cy.wait(3000);

        //Cancel Limit Orders 
        cancelLimitOrderftn()

        //Reject transaction
        cy.wait(10000);
        cy.rejectMetamaskTransaction();
        cy.wait(5000);
        cy.get(confirmSwapBtn).contains("MetaMask Tx Signature: User denied transaction signature.").should('be.visible').click()
        cy.wait(10000);
        cy.confirmMetamaskTransaction()
        
        //Successful card
        cy.wait(5000);
        successfulCardftn( confirmSwapBtn, cancelLimitSuccessfulTransactionLink) 

    })

    it('Cancelling the Limit order', () => {
        //Connect to MetaMask from swap page
        cy.visit('/dashboard')
        cy.get(swapSideMenu).click()
        connectWalletftn()

        //Select limit tokens
        selectLimitTokensftn("PNG", "USDC", "0.001", 0)
        
        //Less than the market price
        limitSellBuyTokenftn(0, 1);

        //Placing the order
        cy.get(swapBtn).contains("Place Order").click()

        //Executing on higher limit price
        cy.get(confirmSwapBtn).contains("Confirm Order").click()
        cy.wait(5000);
        cy.confirmMetamaskTransaction()
        cy.wait(3000);

        //Cancel Limit Orders 
        cancelLimitOrderftn()

        //Reject transaction
        cy.wait(10000)
        cy.confirmMetamaskTransaction()

        //Successful card
        cy.wait(10000);
        successfulCardftn( confirmSwapBtn, cancelLimitSuccessfulTransactionLink) 
    })
    

})