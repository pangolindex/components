import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
let { connectWallet,connectMetamask, connected, gasToken, walletAddress, nativeToken, nativeTokenDeatils, nativeTokenLogo, nativeTokenBalance, detailsMenuClose, networkName, networks, swapSideMenu, dashboardSideMenu, testnetBtn} = selectors.dashboard
let { networkNameArr, nativeTokenArr, gasTokenArr, testnetNetworkNameArr, testnetNativeTokenArr, testnetGasTokenArr, nativeTokenDeatilsArr} = data.dashboard

function nativeDetails(native){
    cy.get(walletAddress).contains('0x33...8C60');
    cy.get(walletAddress).invoke('text').should('equal', '0x33...8C60');
    //Native token details
    cy.get(nativeToken).invoke('text').should('contain', nativeTokenArr[native]);
    cy.get(nativeToken).contains(nativeTokenArr[native]).click()
    cy.get(nativeTokenLogo).should('be.visible', { timeout: 20000 })
    cy.get(nativeTokenDeatils).should('not.be.empty');
    cy.get(nativeTokenLogo).should('have.attr', 'alt', `${nativeTokenArr[native]} logo`)
    cy.get(nativeTokenBalance).should('be.visible', { timeout: 20000 })
    cy.get(nativeTokenBalance).should('not.be.empty');
    for (var i = 0; i <= 4; i++) {
        cy.get(nativeTokenDeatils).contains(nativeTokenDeatilsArr[i]).should('be.visible')
    }
    cy.get(detailsMenuClose).click()
    cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[native]);
    //Showing status connected
    // cy.get(walletAddress).contains('0x33...8C60').click()
    // cy.request('GET', 'https://snowtrace.io/address/0x33CCa68A49B348ec247E0d1216936B5eF5638C60').then( res => {
    //     expect(res.status).to.equal(200)
    // cy.get(changeBtn).contains("Change").click()
    // cy.get(walletConnected).should("have.css", "background-color", "rgb(64, 68, 79)")
    // cy.get(accountMenuClose).click() 

}
describe('Dashboard', () => {
    it('Connect to Metamask', () => {
        cy.visit('/dashboard')
        //MetaMask connection
        cy.get(connectWallet).click();
        cy.get(connectMetamask).click();
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
        cy.get(connected).should("not.be.empty");
        //Native token details and your wallets address
        nativeDetails(0)        
    })

    it('Switch to Mainnets', () => {
        cy.visit('/dashboard')
        //Switching to the Mainnets
        for (var i = 0; i <= 2; i++) {
            cy.get(networkName).should('have.attr', 'title', networkNameArr[i]).click()
            cy.get(networks).contains(networkNameArr[i + 1]).click();
            cy.wait(2000)
            cy.allowMetamaskToAddAndSwitchNetwork()
            //After switching, the Network name, native token and the gas token in the menu will change to the chain specific ones
            cy.get(networkName).should('have.attr', 'title', networkNameArr[i + 1]).should('be.visible')
            if(i != 2 ){
                nativeDetails(i + 1)
            }
        } 
    })

    it('Switch to Testnets', () => {
        cy.visit('/dashboard')
        //Switching to the Testnets
        for (var i = 0; i <= 3; i++) {
            cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[i]).click()
            cy.get(testnetBtn).contains("Testnet").click()
            cy.get(networks).contains(testnetNetworkNameArr[i + 1]).click();
            cy.wait(2000)
            cy.allowMetamaskToAddAndSwitchNetwork()
            //After switching, the Network name, native token and the gas token in the menu will change to the chain specific ones
            cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[i + 1]).should('be.visible')
            cy.get(nativeToken).invoke('text').should('contain', testnetNativeTokenArr[i]);
            cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', testnetGasTokenArr[i]);
        } 

    })
    
    it('Switch Back to Avalanche', () => {
        cy.visit('/dashboard')
        //Back to Avalanche chain 
        cy.get(networkName).should('have.attr', 'title', 'Avalanche').click()
        cy.get(networks).contains("Avalanche").click();
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