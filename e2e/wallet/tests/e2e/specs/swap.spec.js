import selectors from '../../../cypress/fixtures/selectors.json'
describe('Swap', () => {
    const { connectWallet,connectMetamask, connected, swapSideMenu, walletAddress, networkName, mainnets, nativeToken, dashboardSideMenu, gasToken} = selectors.dashboard
    const { yourPortfolio, amountInChainsSwap, hideBalanceBtnSwap, stericsSwap, showBalanceBtnSwap, tokensInChainsSwap, amountInTokensSwap, tokensToSwap, selectTokens, selectTokensValue, selectTokensMenuClose, fromInput, toInput, swapBtn, percentBtns, percentBtnActive, tradeDetails, tradeDetailsValues, toEstimated, unitPrice, toTokenChain, confirmSwap, confirmSwapDetails, confirmSwapMsg, confirmSwapBtn, swappingMsg, TransactionSubmitted, recentTransactions, transactionLinks, clearAll, transactionAppear, accountMenuCloseSwap, notification, notificationViewOnExplorer} = selectors.swap

    it.only('Connects with Metamask', () => {
        //Connect to MetaMask from swap page
        cy.visit('/swap')
        cy.get(connectWallet).click();
        cy.get(connectMetamask).click();
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
        cy.get(connected).should("not.be.empty");         
        //After switching, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'PNG');
        cy.get(gasToken).invoke('text').should('contain', 'AVAX');

    })  

    // it('Your Portfolio', () => {
    //     //Total Amount Invested in the chains
    //     cy.visit('/swap')
    //     cy.get(swapSideMenu).click()
    //     cy.get(yourPortfolio).contains("Your Portfolio").should('be.visible')
    //     cy.get(amountInChainsSwap).should('not.be.empty');
    //     cy.get(hideBalanceBtnSwap).contains("Hide Your Balance").click()
    //     cy.get(stericsSwap).contains("*").should('be.visible')
    //     cy.get(showBalanceBtnSwap).contains("Show Your Balance").click()
    //     cy.get(amountInChainsSwap).should('not.be.empty');
    //     //Tokens along balances
    //     cy.get(tokensInChainsSwap).should('be.visible')
    //     cy.get(amountInTokensSwap).should('not.be.empty')
    // })

    it.only('Transaction Buttons on Trade card', () => {
        cy.visit('/swap')
        cy.wait(10000);
        //Tokens along balances in FROM
        cy.get(tokensToSwap).contains("AVAX").click()
        cy.get(selectTokens).contains("AVAX").should('be.visible')
        cy.get(selectTokensValue).should('not.be.empty')
        cy.get(selectTokensMenuClose).eq(0).click()
        //Tokens along balances in TO
        cy.get(tokensToSwap).contains("USDC").click()
        cy.get(selectTokens).contains("USDC").should('be.visible')
        cy.get(selectTokensValue).should('not.be.empty')
        cy.get(selectTokensMenuClose).eq(0).click()
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

    it('Details on Trade card', () => {
        //25% tokens
        cy.visit('/swap')
        cy.wait(20000);
        cy.get(percentBtns).eq(0).click();
        cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
            });
        cy.get(fromInput).should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
        cy.wait(10000);
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        //50% tokens
        cy.get(percentBtns).eq(0).click();
        cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
            });
        cy.get(fromInput).should('not.have.value', '0.00'); 
        cy.get(toInput).should('not.have.value', '0.00'); 
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        //75% tokens
        cy.get(percentBtns).eq(1).click();
        cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
            });
        cy.get(fromInput).should('not.have.value', '0.00'); 
        cy.get(toInput).should('not.have.value', '0.00');     
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        //100% tokens
        cy.get(percentBtns).eq(2).click();
        cy.get(percentBtnActive).should(($element) => {
            expect($element.css('color')).to.equal('rgb(255, 255, 255)');
            });
        cy.get(fromInput).should('not.have.value', '0.00'); 
        cy.get(toInput).should('not.have.value', '0.00'); 
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        //Trade details
        cy.get(tradeDetails).contains("Minimum Received").should('be.visible');
        cy.get(tradeDetailsValues).should('contain', 'USDC');
        cy.get(tradeDetails).contains("Price Impact").should('be.visible');
        cy.get(tradeDetails).contains("Liquidity Provider Fee").should('be.visible');
        cy.get(tradeDetailsValues).should('contain', 'AVAX');
        cy.get(tradeDetailsValues).eq(0).should('not.be.empty');
        cy.get(tradeDetailsValues).eq(1).should('not.be.empty');
        cy.get(toEstimated).contains("To (estimated)").should('be.visible'); 
        cy.get(unitPrice).contains("Price").should('be.visible');
        cy.get(unitPrice).contains("USDC").should('be.visible');
        //Token chain
        // cy.get(toTokenChain).contains("WAVAX").should('be.visible');    
        // cy.get(toTokenChain).contains("PNG").should('be.visible');    
        // cy.get(toTokenChain).contains("USDC").should('be.visible');    
    })

    it('Details on Confirm swap card', () => {
        cy.visit('/swap')
        cy.get(fromInput).type('0.0001')
        cy.wait(10000);
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click()
        //Details on confirmswap card
        cy.get(confirmSwap).contains("Confirm Swap").should('be.visible')
        cy.get(confirmSwapDetails).contains("AVAX").should('be.visible')
        cy.get(confirmSwapDetails).contains("USDC").should('be.visible')
        cy.get(confirmSwapDetails).eq(1).should('not.be.empty');
        cy.get(confirmSwapDetails).eq(3).should('not.be.empty');
        // cy.get('img[class="sc-ezredP cizzGM"]').eq(9).should('have.attr', 'alt', 'PNG logo')
        // cy.get('img[class="sc-ezredP cizzGM"]').eq(10).should('have.attr', 'alt', 'USDC logo')
        cy.get(confirmSwapMsg).invoke('text').should('match', /.*USDC.*/);
        //Confirm swap button
        cy.get(confirmSwapBtn).contains("Confirm Swap").should('be.visible');
        cy.get(confirmSwapBtn).contains("Confirm Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        cy.get(confirmSwapBtn).contains("Confirm Swap").click()
        //Swapping message
        cy.get(swappingMsg).invoke('text').should('match', /.*USDC.*/);
        cy.confirmMetamaskTransaction()
        //Successful card
        cy.get(TransactionSubmitted).contains("Transaction Submitted").should('be.visible');
        cy.request('GET', 'https://snowtrace.io/tx/0xa1bd06abcf1c5ca902f0241ba184599fadbd4993b1903a562a8976bbc25f6e6b').then( res => {
            expect(res.status).to.equal(200)
          }) 
        cy.get(confirmSwapBtn).contains("Close").should('be.visible');
        cy.get(confirmSwapBtn).contains("Close").click()
        //Notification
        cy.get(notification).invoke('text').should('match', /.*USDC.*/); 
        cy.get(notificationViewOnExplorer).each(page => {
            cy.request(page.prop('href')).as('link');
        });
        cy.get('@link').should(response => {
            expect(response.status).to.eq(200);
        }); 
        //Recent Transactions
        cy.get(walletAddress).contains('0x33...8C60').click()
        cy.get(recentTransactions).contains("Recent Transactions").should('be.visible')  
        //Transaction Links
        cy.get(transactionLinks).each(page => {
                cy.request(page.prop('href')).as('link');
            });
            cy.get('@link').should(response => {
                expect(response.status).to.eq(200);
            });
        //Clear all Transactions
        cy.get(clearAll).contains("clear all").click()
        cy.get(transactionAppear).contains("Your transactions will appear here...").should('be.visible')
        cy.get(accountMenuCloseSwap).click()      
    })

    it('Reject Transaction', () => {
        cy.visit('/swap')
        cy.wait(10000);
        // cy.on("fail", (err) => {
        //     cy.log(err.message);
        //     return false;
        //   });
        cy.get(fromInput).type('0.0001')
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click()
        cy.get(confirmSwapBtn).contains("Confirm Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        cy.get(confirmSwapBtn).contains("Confirm Swap").click()
        cy.rejectMetamaskTransaction()
        cy.get('div[class="sc-iqHYmW flqkxK"]').contains("Transaction rejected.").should('be.visible')  
        cy.get('button[class="sc-fubCzh fUmmJu"]').contains("Dismiss").should('be.visible');
        cy.get('button[class="sc-fubCzh fUmmJu"]').contains("Dismiss").should("have.css", "background-color", "rgb(255, 200, 0)");
        cy.get('button[class="sc-fubCzh fUmmJu"]').contains("Dismiss").click()
        cy.get('div[class="sc-iqHYmW cgZRQ"]').contains("Trade").should('be.visible')  
        //Swap button
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).contains("Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
    })

    it('Price Updated', () => {
        cy.visit('/swap')
        cy.wait(5000);
        cy.get(fromInput).type('0.0001')
        cy.wait(5000);
        cy.get(swapBtn).contains("Swap").should('be.visible');
        cy.get(swapBtn).click()
        cy.get(confirmSwapBtn).contains("Confirm Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
        //Waiting for price to update
        cy.wait(200000)
        cy.get('div[class="sc-iqHYmW jlVtaV"]d').contains("Price Updated").should('be.visible')  
        cy.get('button[class="sc-fubCzh hMDWoK"]').contains("Accept").should('be.visible');
        cy.get('button[class="sc-fubCzh hMDWoK"]').contains("Accept").should("have.css", "background-color", "rgb(255, 200, 0)");
        cy.get('div[class="sc-iqHYmW QlILP"]').should(($updatedPrice) => {
            expect($updatedPrice.css('color')).to.equal('rgb(255, 200, 0)');
            });
        cy.get('button[class="sc-fubCzh dZMImC"]').contains("Confirm Swap").should('be.visible')
        cy.get('button[class="sc-fubCzh dZMImC"]').contains("Confirm Swap").should("have.css", "background-color", "rgb(229, 229, 229)");
        cy.get('button[class="sc-fubCzh hMDWoK"]').contains("Accept").click()
        cy.get('button[class="sc-fubCzh fUmmJu"]').contains("Confirm Swap").should('be.visible');
        cy.get('button[class="sc-fubCzh fUmmJu"]').contains("Confirm Swap").should("have.css", "background-color", "rgb(255, 200, 0)");
    })

    it('Limit Sell card', () => {
        
        cy.visit('/swap')
        cy.wait(2000);
        cy.get('div[class="sc-iBaQBe KqBsY"]').contains("LIMIT").click()
        cy.get(tokensToSwap).click()
        cy.get('[class="sc-iqHYmW sc-eazVAB jlVtaV dPbFNt"]').eq(2).click();
        cy.get('span[class="sc-jJEKmz jysvvD token-symbol-container"]').contains("Select Token").click()
        cy.get('div[class="sc-iqHYmW ktkHFj"]').contains("USDC").click()
        cy.get(fromInput).type('0.0001')
        cy.wait(5000);
        cy.get('input[class="sc-dQoVA cBTceE sc-eLgNKc jWrmCf"]').should('not.have.value', '0.00');
        cy.get(toInput).should('not.have.value', '0.00');
    
        //Sell token detaisl
        cy.get('div[class="sc-iqHYmW eoCjyj"]').contains("Gas Price").should('be.visible')
        cy.get('div[class="sc-iqHYmW sc-cOajNj YUTNa fQiDUE"]').should('not.be.empty')
        cy.get('div[class="sc-iqHYmW eoCjyj"]').contains("Real Execution Price").should('be.visible')
        cy.get('div[class="sc-iqHYmW sc-cOajNj YUTNa fQiDUE"]').should('not.be.empty')
        cy.get('div[class="sc-iqHYmW eoCjyj"]').contains("Gelato Fee").should('be.visible')
        cy.get('div[class="sc-iqHYmW sc-cOajNj YUTNa fQiDUE"]').should('not.be.empty')
        cy.get('div[class="sc-iqHYmW eoCjyj"]').contains("Slippage Tolerance").should('be.visible')
        cy.get('div[class="sc-iqHYmW sc-cOajNj YUTNa fQiDUE"]').should('not.be.empty')
        cy.get('div[class="sc-iqHYmW eoCjyj"]').contains("Minimum Received").should('be.visible')
        cy.get('div[class="sc-iqHYmW sc-cOajNj YUTNa fQiDUE"]').should('not.be.empty')
        //Limit price 
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should('be.visible');
        cy.get(swapBtn).contains("Only possible to place sell orders above market rate").should("have.css", "background-color", "rgb(229, 229, 229)");

    })

    


    
}) 