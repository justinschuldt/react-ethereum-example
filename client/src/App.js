import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import BallotUI from "./components/Ballot/index.js";
import BallotAdmin from "./components/BallotAdmin/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader } from 'rimble-ui';

import { zeppelinSolidityHotLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

const formatBallotState = (number)  => {
  switch (Number(number)) {
    case 0:
      return 'Created';
    case 1:
      return 'Voting';
    case 2: 
      return 'Ended';
    default:
    return '';
  }
}
class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  componentDidMount = async () => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
    let Ballot = {};
    let Wallet = {};
    try {
      Ballot = require("../../contracts/Ballot.sol")
      Wallet = require("../../contracts/Wallet.sol");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        let instance = null;
        let instanceWallet = null;
        let deployedNetwork = null;
        if (Ballot.networks) {
          deployedNetwork = Ballot.networks[networkId.toString()];
          if (deployedNetwork) {
            instance = new web3.eth.Contract(
              Ballot.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (Wallet.networks) {
          deployedNetwork = Wallet.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceWallet = new web3.eth.Contract(
              Wallet.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (instance || instanceWallet) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled,
            isMetaMask, contract: instance, wallet: instanceWallet }, () => {
              this.refreshValues(instance, instanceWallet);
              setInterval(() => {
                this.refreshValues(instance, instanceWallet);
              }, 5000);
            });
        }
        else {
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = (instance, instanceWallet) => {
    if (instance) {
      this.getName();
      this.getProposal();
      this.getVoteState();
      this.getVoteCount();
      this.getVoterCount();
      this.getFinalCount();
      this.getOfficialAddress();
      this.isAddressRegistered();
      this.hasAddressVoted();
    }
    if (instanceWallet) {
      this.updateTokenOwner();
    }
  }

  // fetch data that will drive the UI
  getName = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getName().call();
    this.setState({ ballotName: response})
  }
  getProposal = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getProposal().call();
    this.setState({ proposal: response })
  }
  getVoteState = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getState().call();
    this.setState({ voteState: formatBallotState(response) });
  }
  getVoteCount = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getVoteCount().call();
    this.setState({ voteCount: response });
  }
  getVoterCount = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getVoterCount().call();
    this.setState({ voterCount: response });
  }
  getFinalCount = async () => {
    const { contract } = this.state;
    const response = await contract.methods.getVoterCount().call();
    this.setState({ finalCount: response });
  }
  getOfficialAddress = async () => {
    const { accounts, contract } = this.state;
    const response = await contract.methods.getOfficialAddress().call();
    this.setState({
      contractOfficial: response.toString() === accounts[0].toString(),
      officialAddress: response
    });
  }
  isAddressRegistered = async () => {
    const { accounts, contract } = this.state; 
    const response = await contract.methods.isAddressRegistered(accounts[0]).call();
    this.setState({ isAddressRegistered: response });
  }
  hasAddressVoted = async () => {
    const { accounts, contract } = this.state; 
    const response = await contract.methods.hasAddressVoted(accounts[0]).call();
    this.setState({ hasAddressVoted: response }); 
  }

  // user actions
  registerVoter = async (name) => {
    const { accounts, contract } = this.state;
    await contract.methods.registerVoter(name).send({ from: accounts[0] });
    this.getVoterCount();
    this.isAddressRegistered();
  }
  castVote = async (choice) => {
    const { accounts, contract } = this.state;
    await contract.methods.doVote(choice).send({ from: accounts[0] });
    this.getVoteCount();
    this.hasAddressVoted();
  }
  startVotingPeriod = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.startVote().send({ from: accounts[0] });
    this.getVoteState();
  }
  endVotingPeriod = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.endVote().send({ from: accounts[0] });
    this.getVoteState();
    this.getFinalCount();
  }
  updateName = async (name) => {
    const { accounts, contract } = this.state;
    await contract.methods.updateName(name).send({ from: accounts[0] });
    this.getName();
  }
  updateProposal = async (proposal) => {
    const { accounts, contract } = this.state;
    await contract.methods.updateProposal(proposal).send({ from: accounts[0] });
    this.getProposal();
  }

  // render
  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey} accounts={this.state.accounts} />
      </div>
    );
  }

  render() {
    const { accounts, ganacheAccounts } = this.state;
    return (
      <div className={styles.App}>
        <div className={styles.wrapper}>
          {!this.state.web3 && this.renderLoader()}
          {this.state.web3 && !this.state.contract && (
            this.renderDeployCheck('ballot')
          )}
          {this.state.web3 && this.state.contract && (
            <div className={styles.contracts}>
              <h1>{this.state.ballotName}: Yes or No?</h1>

              <div className={styles.widgets}>
                <BallotAdmin
                  updateName={this.updateName}
                  updateProposal={this.updateProposal}
                  startVotingPeriod={this.startVotingPeriod}
                  endVotingPeriod={this.endVotingPeriod}
                  {...this.state}
                />
                <BallotUI
                  registerVoter={this.registerVoter}
                  castVote={this.castVote}
                  {...this.state}
                />
              </div>
              {this.state.balance < 0.1 && (
                <Instructions
                  ganacheAccounts={ganacheAccounts}
                  name="metamask"
                  accounts={accounts} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
