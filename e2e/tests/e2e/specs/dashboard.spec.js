import selectors from '../../../cypress/fixtures/selectors-1.json'
describe('Dashboard', () => {
    beforeEach( () => {
        Cypress.on('uncaught:exception', (err, runnable, promise) => {

            // if (err.message.includes("TypeError")) {
            //     return false
            // }
          
            if (err.name === "TypeError: Cannot read properties of undefined (reading 'onFail')") {
                return false
            }
          })
    })
    const { connectWallet,connectMetamask, connected, gasToken, walletAddress, nativeToken, nativeTokenDeatils, nativeTokenLogo, nativeTokenBalance, detailsMenuClose, changeBtn, walletConnected, accountMenuClose, totalAmount, amountInchains, hideBalanceBtn, sterics, showBalanceBtn, copyAddress, copiedAddress, networkName, mainnets, swapSideMenu, dashboardSideMenu, testnetBtn, stakeV2SideMenu} = selectors.dashboard
    const { yourPortfolio, amountInChainsSwap, hideBalanceBtnSwap, stericsSwap, showBalanceBtnSwap, tokensInChainsSwap, amountInTokensSwap, tokensToSwap, selectTokens, selectTokensValue, selectTokensMenuClose, fromInput, toInput, swapBtn, percentBtns, percentBtnActive, tradeDetails, tradeDetailsValues, toEstimated, unitPrice, toTokenChain, confirmSwap, confirmSwapDetails, confirmSwapMsg, confirmSwapBtn, swappingMsg, TransactionSubmitted, recentTransactions, transactionLinks, clearAll, transactionAppear, accountMenuCloseSwap, notification, notificationViewOnExplorer} = selectors.swap
    it.only('Connects with Metamask', () => {
        cy.visit('/dashboard')
        cy.get(connectWallet).click();
        cy.get(connectMetamask).click();
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
        cy.get(connected).should("not.be.empty");
        //Balance of the gas token (AVAX) and your wallets address
        cy.get(gasToken).invoke('text').should('contain', 'AVAX');
        cy.get(walletAddress).contains('0x33...8C60');
        cy.get(walletAddress).invoke('text').should('equal', '0x33...8C60');
        //Native token details
        cy.get(nativeToken).contains("PNG").click()
        cy.wait(5000)
        cy.get(nativeTokenDeatils).contains("Balance").should('be.visible')
        cy.get(nativeTokenDeatils).contains("Unclaimed").should('be.visible')
        cy.get(nativeTokenDeatils).contains("PNG price").should('be.visible')
        cy.get(nativeTokenDeatils).contains("PNG in circulation").should('be.visible')
        cy.get(nativeTokenDeatils).contains("Total Supply").should('be.visible')
        cy.get(nativeTokenDeatils).should('not.be.empty');
        //Native token Logo
        cy.get(nativeTokenLogo).should('have.attr', 'alt', 'PNG logo')
        //Native token Balance
        cy.get(nativeTokenBalance).should('not.be.empty');
        cy.get(detailsMenuClose).click()
        //Showing status connected
        cy.get(walletAddress).contains('0x33...8C60').click()
        cy.get(changeBtn).contains("Change").click()
        cy.get(walletConnected).should("have.css", "background-color", "rgb(64, 68, 79)")
        cy.get(accountMenuClose).click()
        // //Total Amount Invested in the chains
        // cy.get(totalAmount).contains("Total Amount Invested").should('be.visible')
        // cy.get(amountInchains).should('not.be.empty');
        // cy.get(hideBalanceBtn).contains("Hide Your Balance").click()
        // cy.get(sterics).contains("*").should('be.visible')
        // cy.get(showBalanceBtn).contains("Show Your Balance").click()
        // cy.get(amountInchains).should('not.be.empty');
   
        //Copy the wallet address
        cy.get(walletAddress).contains('0x33...8C60').click()
        // cy.get(copyAddress).contains("Copy Address").click() 
        // cy.get(copiedAddress).contains("Copied").should('be.visible')
        //View on explorer
        cy.request('GET', 'https://snowtrace.io/address/0x33CCa68A49B348ec247E0d1216936B5eF5638C60').then( res => {
            expect(res.status).to.equal(200)
           }) 
    })
    //Switching to the Mainnets
    it('Switch to Flare', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(mainnets).contains("Flare").click();
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Flare), native token (PFL) and the gas token (FLR) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Flare').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'PFL');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'FLR');
    })

    it('switch to Songbird', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(mainnets).contains("Songbird").click();
        cy.wait(2000)
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Songbird), native token (PSB) and the gas token (SGB) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Songbird').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'PSB');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'SGB');
    })

    it('switch to Evmos', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(mainnets).contains("Evmos").click();
        cy.wait(2000)
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Evmos), and the gas token (EVMOS) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Evmos').should('be.visible')
        cy.get(swapSideMenu).click()
        cy.get(dashboardSideMenu).click()
        cy.wait(2000)
        cy.get(gasToken).invoke('text').should('contain', 'EVMOS');
    })
    //Switching to the Testnets
    it('Switch to Coston', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(testnetBtn).contains("Testnet").click()
        cy.get(mainnets).contains("Coston").click();
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Coston), native token (PCT)  and the gas token (cFLR) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Coston').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'PCT');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'cFLR');
    })

    it('Switch to Evmos Testnet', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(testnetBtn).contains("Testnet").click()
        cy.get(mainnets).contains("Evmos Testnet").click();
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Evmos Testnet), native token (evmPNG)  and the gas token (tEVMOS) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Evmos Testnet').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'evmPNG');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'tEVMOS');
    })

    it('Switch to Wagmi', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(testnetBtn).contains("Testnet").click()
        cy.get(mainnets).contains("Wagmi").click();
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Wagmi), native token (wagmiPNG)  and the gas token (WGMI) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Wagmi').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'wagmiPNG');
        cy.get(stakeV2SideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'WGMI');
    })

    it('Switch to Avalanche Fuji', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(testnetBtn).contains("Testnet").click()
        cy.get(mainnets).contains("Avalanche Fuji").click();
        cy.allowMetamaskToAddAndSwitchNetwork()
        //After switching, the Network name (Avalanche Fuji), native token (fujiPNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Avalanche Fuji').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'fujiPNG');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'AVAX');
    })
    
    it('Switch Back to Avalanche', () => {
        cy.visit('/dashboard')
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(mainnets).contains("Avalanche").click();
        cy.allowMetamaskToSwitchNetwork();
        //After switching, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').should('be.visible')
        cy.get(nativeToken).invoke('text').should('contain', 'PNG');
        cy.get(swapSideMenu).click()
        cy.wait(2000)
        cy.get(dashboardSideMenu).click()
        cy.get(gasToken).invoke('text').should('contain', 'AVAX');
    })

    it('Transaction Buttons on Trade card', () => {
        cy.visit('/')
        cy.wait(10000);
        cy.get(swapSideMenu).click()
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

    it.only('Reject Transaction', () => {
        cy.visit('/')
        cy.get(swapSideMenu).click()
        cy.get(connectWallet).click();
        cy.get(connectMetamask).click();
        cy.switchToMetamaskWindow();
        //cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
        cy.get(connected).should("not.be.empty")
        
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

  }) 