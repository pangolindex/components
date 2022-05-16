import { AbstractConnector } from '@web3-react/abstract-connector';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactGA from 'react-ga';
// import MetamaskIcon from 'src/assets/images/metamask.png';
// import XDefiIcon from 'src/assets/images/xDefi.png';
// import RabbyIcon from 'src/assets/images/rabby.svg';
import { gnosisSafe, injected, xDefi } from 'src/connectors';
import { LANDING_PAGE, EVM_SUPPORTED_WALLETS, AVALANCHE_CHAIN_PARAMS, IS_IN_IFRAME, WalletInfo } from 'src/constants';
import usePrevious from 'src/hooks/usePrevious';
import { ExternalLink } from 'src/theme';
import { Button } from 'src/components/Button';
import {
  CloseIcon,
  CloseColor,
  Wrapper,
  HeaderRow,
  ContentWrapper,
  UpperSection,
  Blurb,
  OptionGrid,
  HoverText,
} from './styles';
import { Modal, Box, ToggleButtons } from '../../';
import Option from './Option';
import PendingView from './PendingView';
import { WalletModalProps } from './types';
import { useModalOpen, useWalletModalToggle } from 'src/state/papplication/hooks';
import { ApplicationModal } from 'src/state/papplication/actions';

const WALLET_TUTORIAL = `${LANDING_PAGE}/tutorials/getting-started/#set-up-metamask`;

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

function addAvalancheNetwork() {
  injected.getProvider().then((provider) => {
    provider
      ?.request({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_CHAIN_PARAMS],
      })
      .catch((error: any) => {
        console.log(error);
      });
  });
}

const WalletModal: React.FC<WalletModalProps> = ({ visible }) => {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error: web3Error } = useWeb3React();
  const [walletType, setWalletType] = useState('EVM CHAINS' as string);

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
  const [selectedOption, setSelectedOption] = useState<WalletInfo | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const [triedSafe, setTriedSafe] = useState<boolean>(!IS_IN_IFRAME);

  const previousAccount = usePrevious(account);

  const walletModalOpen = visible || useModalOpen(ApplicationModal.WALLET);
  const toggleWalletModal = useWalletModalToggle();

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      walletModalOpen &&
      ((active && !activePrevious) || (connector && connector !== connectorPrevious && !web3Error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, web3Error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const isMetamask = window.ethereum && window.ethereum.isMetaMask;
  const isRabby = window.ethereum && window.ethereum.isRabby;
  const isCbWalletDappBrowser = window?.ethereum?.isCoinbaseWallet;
  const isWalletlink = !!window?.WalletLinkProvider || !!window?.walletLinkExtension;
  const isCbWallet = isCbWalletDappBrowser || isWalletlink;

  const tryActivation = async (
    activationConnector: AbstractConnector | SafeAppConnector | undefined,
    option: WalletInfo | undefined,
  ) => {
    const name = Object.keys(EVM_SUPPORTED_WALLETS).find(
      (key) => EVM_SUPPORTED_WALLETS[key].connector === activationConnector,
    );
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    });
    setPendingWallet(connector); // set wallet for pending view
    setSelectedOption(option);
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (activationConnector instanceof WalletConnectConnector && activationConnector.walletConnectProvider?.wc?.uri) {
      activationConnector.walletConnectProvider = undefined;
    }

    if (!triedSafe && activationConnector instanceof SafeAppConnector) {
      activationConnector.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(activationConnector, undefined, true).catch(() => {
            setTriedSafe(true);
          });
        }
        setTriedSafe(true);
      });
    } else if (activationConnector) {
      activate(activationConnector, undefined, true)
        .then(() => {
          if (isCbWallet) {
            addAvalancheNetwork();
          }
        })
        .catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            activate(activationConnector); // a little janky...can't use setError because the connector isn't set
          } else {
            setPendingError(true);
          }
        });
    }
  };

  function getActiveOption(): WalletInfo | undefined {
    if (connector === injected) {
      if (isRabby) {
        return EVM_SUPPORTED_WALLETS.RABBY;
      } else if (isMetamask) {
        return EVM_SUPPORTED_WALLETS.METAMASK;
      }
      return EVM_SUPPORTED_WALLETS.INJECTED;
    }
    const name = Object.keys(EVM_SUPPORTED_WALLETS).find((key) => EVM_SUPPORTED_WALLETS[key].connector === connector);
    if (name) {
      return EVM_SUPPORTED_WALLETS[name];
    }
    return undefined;
  }

  //get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isXDEFI = window.ethereum && window.ethereum.isXDEFI;
    const activeOption = getActiveOption();

    return Object.keys(EVM_SUPPORTED_WALLETS).map((key) => {
      const option = EVM_SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector, option);
              }}
              id={`connect-${key}`}
              key={key}
              active={activeOption && option.name === activeOption.name}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              //icon={require('../../assets/images/' + option.iconName)} //TODO
              icon={''}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        if (option.name === 'Rabby Wallet') {
          if (!isRabby) {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#7a7cff'}
                header={'Install Rabby Wallet'}
                subheader={null}
                link={'https://rabby.io/'}
                // icon={RabbyIcon}
                icon={''}
              />
            );
          }
        }

        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                // icon={MetamaskIcon}
                icon={''}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }

        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // overwrite injected when needed
      else if (option.connector === xDefi) {
        // don't show injected if there's no injected provider

        if (!(window.xfi && window.xfi.ethereum && window.xfi.ethereum.isXDEFI)) {
          if (option.name === 'XDEFI Wallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#315CF5'}
                header={'Install XDEFI Wallet'}
                subheader={null}
                link={'https://www.xdefi.io/'}
                // icon={XDefiIcon}
                icon={''}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }

        // likewise for generic
        else if (option.name === 'Injected' && (isMetamask || isXDEFI)) {
          return null;
        }
      }

      // Not show Gnosis Safe option without Gnosis Interface
      if (option.connector === gnosisSafe && !IS_IN_IFRAME) {
        return null;
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector, option);
            }}
            key={key}
            active={activeOption && option.name === activeOption.name}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={''}
          />
        )
      );
    });
  }

  function getModalContent() {
    const isXDEFI = window.xfi && window.xfi.ethereum && window.xfi.ethereum.isXDEFI;
    const isMetamaskOrCbWallet = isMetamask || isCbWallet || isXDEFI;

    if (web3Error) {
      return (
        <UpperSection>
          <CloseIcon
            onClick={() => {
              toggleWalletModal();
            }}
          >
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{web3Error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
          <ContentWrapper>
            {web3Error instanceof UnsupportedChainIdError ? (
              <>
                <h5>Please connect to the appropriate Avalanche network.</h5>
                {isMetamaskOrCbWallet && (
                  <Button variant="primary" onClick={addAvalancheNetwork}>
                    Switch to Avalanche Chain
                  </Button>
                )}
              </>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </ContentWrapper>
        </UpperSection>
      );
    }

    return (
      <UpperSection>
        <CloseIcon
          onClick={() => {
            toggleWalletModal();
          }}
        >
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}
            >
              Back
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>Connect to a wallet</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          <Box mt="5px" width="100%" mb="5px">
            <ToggleButtons
              options={['EVM CHAINS', 'NON-EVM CHAINS']}
              value={walletType}
              onChange={(value) => {
                setWalletType(value);
              }}
            />
          </Box>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              option={selectedOption}
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>New to Avalanche? &nbsp;</span>{' '}
              <ExternalLink href={WALLET_TUTORIAL}>Learn more about setting up a wallet</ExternalLink>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }

  console.log('tets=====');

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={() => {
        toggleWalletModal();
      }}
    >
      <Wrapper>Test</Wrapper>
    </Modal>
  );
};

export default WalletModal;
