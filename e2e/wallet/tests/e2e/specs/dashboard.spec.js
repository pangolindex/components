import selectors from '../../../cypress/fixtures/selectors.json'
describe('Dashboard', () => {
    const { connectWallet,connectMetamask, connected, gasToken, walletAddress, nativeToken, nativeTokenDeatils, nativeTokenLogo, nativeTokenBalance, detailsMenuClose, changeBtn, walletConnected, accountMenuClose, totalAmount, amountInchains, hideBalanceBtn, sterics, showBalanceBtn, copyAddress, copiedAddress, networkName, mainnets, swapSideMenu, dashboardSideMenu, testnetBtn, stakeV2SideMenu} = selectors.dashboard
    it('Connects with Metamask', () => {
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


  }) 