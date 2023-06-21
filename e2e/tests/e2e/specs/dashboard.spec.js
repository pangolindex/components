import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
import { nativeDetails } from '../../../cypress/src/dashboard'
import { connectWalletftn } from '../../../cypress/src/dashboard'

let { connectWallet,connectToMetamask,connectToWallet, connected, gasToken, walletAddress, networkName, networks, testnetBtn} = selectors.dashboard
let { networkNameArr, gasTokenArr, testnetNetworkNameArr} = data.dashboard
describe('Dashboard', () => {
    it('Connect to Metamask', () => {
        cy.visit('/dashboard')
        //MetaMask connection
        cy.get(connectToWallet).click();
        cy.get(connectToMetamask).contains("Metamask").click();
        cy.get(connectWallet).click()
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
        cy.get(connected).should("not.be.empty");        
        //After connecting, the Network name (Avalanche), native token (PNG) and the gas token (AVAX) in the menu will change to the chain specific ones
        nativeDetails(0)        
    })

    it('Switch to Mainnets', () => {
        cy.visit('/')
        connectWalletftn()
        //Switching to the Mainnets
        for (var i = 0; i <= 3; i++) {
            cy.get(networkName).should('have.attr', 'title', networkNameArr[i]).click()
            cy.get(networks).contains(networkNameArr[i + 1]).click();
            cy.wait(2000)
            if(i == 3){ 
                cy.allowMetamaskToSwitchNetwork();
            }
            else{
               cy.allowMetamaskToAddAndSwitchNetwork()
            } 
            //After switching, the Network name, native token and the gas token in the menu will change to the chain specific ones
            cy.get(networkName).should('have.attr', 'title', networkNameArr[i + 1]).should('be.visible')
            if(i != 2 ){
                nativeDetails(i + 1)
            }
            else{
                cy.get(walletAddress).contains('0x33...8C60');
                cy.get(walletAddress).invoke('text').should('equal', '0x33...8C60');
                cy.get(gasToken, { timeout: 50000 }).invoke('text').should('contain', gasTokenArr[i + 1]);
            }
        } 
    })

    it('Switch to Testnets', () => {
        cy.visit('/')
        connectWalletftn()
        //Switching to the Testnets
        for (var i = 0; i <= 4; i++) {
            cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[i]).click()
            if(i != 4){
                cy.get(testnetBtn).contains("Testnet").click()
            }
            cy.get(networks).contains(testnetNetworkNameArr[i + 1]).click();
            cy.wait(2000)
            if(i == 4){ 
                cy.allowMetamaskToSwitchNetwork();
            }
            else{
               cy.allowMetamaskToAddAndSwitchNetwork()
            } 
            //After switching, the Network name, native token and the gas token in the menu will change to the chain specific ones
            cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[i + 1]).should('be.visible')
            nativeDetails(i + 5)
         
        } 

    })

}) 