import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
import { nativeDetails } from '../../../cypress/src/dashboard'

let { connectWallet,connectMetamask, connected, gasToken, walletAddress, networkName, networks, testnetBtn} = selectors.dashboard
let { networkNameArr, gasTokenArr, testnetNetworkNameArr} = data.dashboard
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
        //After connecting, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
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
            else{
            cy.get(walletAddress).contains('0x33...8C60');
            cy.get(walletAddress).invoke('text').should('equal', '0x33...8C60');
            cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[i + 5]);
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
            if(i != 1 ){
                nativeDetails(i + 3)
            }
            else{
            cy.get(walletAddress).contains('0x33...8C60');
            cy.get(walletAddress).invoke('text').should('equal', '0x33...8C60');
            cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[i + 3]);
            }
        } 

    })
    
    it('Switch Back to Avalanche', () => {
        cy.visit('/dashboard')
        //Back to Avalanche chain 
        cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[0]).click()
        cy.get(networks).contains(testnetNetworkNameArr[0]).click();
        cy.wait(2000)
        cy.allowMetamaskToSwitchNetwork();
        //After switching, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        nativeDetails(0)

    })

  }) 