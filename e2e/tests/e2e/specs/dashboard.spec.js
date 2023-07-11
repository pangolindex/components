import selectors from '../../../cypress/fixtures/selectors.json'
import data from '../../../cypress/fixtures/pangolin-data.json'
import { nativeDetails } from '../../../cypress/src/dashboard'
import { connectWalletftn } from '../../../cypress/src/dashboard'

let { connectWallet,connectToMetamask,connectToWallet, connected, gasToken, walletAddress, networkName, networks, testnetBtn} = selectors.dashboard
let { networkNameArr, gasTokenArr, testnetNetworkNameArr} = data.dashboard

//To run each file
//npx  env-cmd -f env/.env npx synpress run --spec 'tests/e2e/specs/dashboard.spec.js' -cf synpress.json
describe('Dashboard', () => {

    it('Connect to Metamask', () => {
        cy.visit('/dashboard');
      
        // MetaMask connection
        cy.get(connectToWallet).click();
        cy.get(connectToMetamask).contains("Metamask").click();
        cy.get(connectWallet).click();
        
        // Switch to Metamask window and accept access
        cy.switchToMetamaskWindow();
        cy.acceptMetamaskAccess().should("be.true");
        cy.switchToCypressWindow();
      
        // Verify successful connection
        cy.get(connected).should("not.be.empty");
      
        // Verify changed network details
        nativeDetails(0);
      });

    it('Switch to Mainnets', () => {
    cy.visit('/');

    connectWalletftn();

    // Switching to the Mainnets
    for (let i = 0; i < networkNameArr.length - 1; i++) {
        // Switch to the next network
        cy.get(networkName).should('have.attr', 'title', networkNameArr[i]).click();
        cy.get(networks).contains(networkNameArr[i + 1]).click();
        cy.wait(2000);

        // Allow Metamask to add or switch networks
        if (i === networkNameArr.length - 2) {
        cy.allowMetamaskToSwitchNetwork();
        } else {
        cy.allowMetamaskToAddAndSwitchNetwork();
        }

        // Verify the switched network details
        cy.get(networkName)
        .should('have.attr', 'title', networkNameArr[i + 1])
        .should('be.visible');

        // Verify native details based on the network
        if (i !== networkNameArr.length - 3) {
        nativeDetails(i + 1);
        } else {
        cy.get(walletAddress)
            .contains('0xa0...b166')
            .invoke('text')
            .should('equal', '0xa0...b166');
        cy.get(gasToken, { timeout: 50000 })
            .invoke('text')
            .should('contain', gasTokenArr[i + 1]);
        }
    }
});  

      it('Switch to Testnets', () => {
        cy.visit('/');
      
        connectWalletftn();
      
        // Switching to the Testnets
        for (let i = 0; i < testnetNetworkNameArr.length - 1; i++) {
          // Switch to the next testnet
          cy.get(networkName).should('have.attr', 'title', testnetNetworkNameArr[i]).click();
      
          if (i !== testnetNetworkNameArr.length - 2) {
            cy.get(testnetBtn).contains("Testnet").click();
          }
      
          cy.get(networks).contains(testnetNetworkNameArr[i + 1]).click();
          cy.wait(2000);
      
          // Allow Metamask to add or switch networks
          if (i === testnetNetworkNameArr.length - 2) {
            cy.allowMetamaskToSwitchNetwork();
          } else {
            cy.allowMetamaskToAddAndSwitchNetwork();
          }
      
          // Verify the switched testnet details
          cy.get(networkName)
            .should('have.attr', 'title', testnetNetworkNameArr[i + 1])
            .should('be.visible');
      
          nativeDetails(i + 5);
        }
      });

}) 