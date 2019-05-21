pragma solidity ^0.5.0;

import "zos-lib/contracts/Initializable.sol";

contract Ballot is Initializable {

  struct ballotInfo{
      string ballotName;
      string proposal;
  }

  struct vote{
      address voterAddress;
      bool choice;
  }

  struct voter{
      string voterName;
      bool voted;
  }

  uint private countResult;
  uint public finalResult;
  uint public totalVoter;
  uint public totalVote;
  address public owner;
  string public ballotName;
  string public proposal;
  address public official;

  mapping(uint => vote) private votes;
  mapping(address => voter) public voterRegister;

  enum State { Created, Voting, Ended }
  State public state;

	//creates a new ballot contract
    function initialize(
        address _official
        ) public initializer {
        countResult = 0;
        finalResult = 0;
        totalVoter = 0;
        totalVote = 0;
        owner = msg.sender;
        ballotName = '';
        proposal = '';
        official = _official;

        state = State.Created;
    }

	modifier onlyOfficial() {
		require(msg.sender == official);
		_;
	}

	modifier inState(State _state) {
		require(state == _state);
		_;
	}

  event voterRegistered(address voter);
  event voteStarted();
  event voteEnded(uint finalResult);
  event voteCast(address voter);

  // getters

  function getName() public view returns (string memory) {
    return ballotName;
  }
  function getProposal() public view returns (string memory) {
    return proposal;
  }
  function getState() public view returns (State) {
    return state;
  }
  function getVoteCount() public view returns (uint) {
    return totalVote;
  }
  function getVoterCount() public view returns (uint) {
    return totalVoter;
  }
  function getFinalResult() public view inState(State.Ended) returns (uint) {
    return finalResult;
  }
  function getOfficialAddress() public view returns (address) {
      return official;
  }
  function isAddressRegistered(address _address) public view returns (bool) {
      return bytes(voterRegister[_address].voterName).length != 0;
  }
  function hasAddressVoted(address _address) public view returns (bool) {
      return voterRegister[_address].voted;
  }

  function updateName(string memory _name)
    public
    inState(State.Created)
    onlyOfficial
  {
    ballotName = _name;
  }
  function updateProposal(string memory _proposal)
    public
    inState(State.Created)
    onlyOfficial
  {
    proposal = _proposal;
  }

  function registerVoter(string memory _voterName)
      public
  {
      voter memory v;
      v.voterName = _voterName;
      v.voted = false;
      voterRegister[msg.sender] = v;
      totalVoter++;
      emit voterRegistered(msg.sender);
  }

  //declare voting starts now
  function startVote()
      public
      inState(State.Created)
      onlyOfficial
  {
      state = State.Voting;
      emit voteStarted();
  }

  //voters vote by indicating their choice (true/false)
  function doVote(bool _choice)
      public
      inState(State.Voting)
      returns (bool voted)
  {
      bool found = false;

      if (bytes(voterRegister[msg.sender].voterName).length != 0 &&
        !voterRegister[msg.sender].voted){
          voterRegister[msg.sender].voted = true;
          vote memory v;
          v.voterAddress = msg.sender;
          v.choice = _choice;
          if (_choice){
              countResult++; //counting on the go
          }
          votes[totalVote] = v;
          totalVote++;
          found = true;
      }
      emit voteCast(msg.sender);
      return found;
  }

  //end votes
  function endVote()
      public
      inState(State.Voting)
      onlyOfficial
  {
      state = State.Ended;
      finalResult = countResult; //move result from private countResult to public finalResult
      emit voteEnded(finalResult);
  }
}
